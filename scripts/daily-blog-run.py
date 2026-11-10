#!/usr/bin/env python3
"""Run the bounded PCM trial through the signed-in local Codex CLI."""
import argparse
from datetime import datetime, time
import fcntl
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]


def eligibility(config, now, completed=False, attempted=False):
    local = now.astimezone(ZoneInfo(config['timezone']))
    date = local.date().isoformat()
    trial = config['trial']
    if not trial['enabled'] or not trial['startDate'] <= date <= trial['endDate']:
        return False, 'outside_trial'
    if local.time() < time.fromisoformat(config['startTime']):
        return False, 'before_start_time'
    if local.hour >= 12:
        return False, 'missed_morning_no_backfill'
    if completed:
        return False, 'already_published'
    if attempted:
        return False, 'already_attempted_review_logs_before_retry'
    return True, 'ready'


def command(args, timeout=120):
    result = subprocess.run(args, cwd=ROOT, capture_output=True, text=True, timeout=timeout)
    if result.returncode:
        # Never echo credentials or a complete tool response into permanent memory.
        raise RuntimeError(f'{args[0]} {args[1] if len(args) > 1 else ""} failed (exit {result.returncode}); inspect local command diagnostics')
    return result.stdout.strip()


def preflight():
    for tool in ['codex', 'git', 'node', 'npm', 'gcloud']:
        if not shutil.which(tool):
            raise RuntimeError(f'Missing executable: {tool}')
    if command(['git', 'branch', '--show-current']) != 'main':
        raise RuntimeError('The existing blog checkout must be on main')
    if command(['git', 'status', '--porcelain']):
        raise RuntimeError('Blog checkout has uncommitted work; preserve it and resolve ownership before retrying')
    command(['git', 'fetch', 'origin', 'main'])
    head = command(['git', 'rev-parse', 'HEAD'])
    remote = command(['git', 'rev-parse', 'origin/main'])
    if head != remote:
        command(['git', 'merge-base', '--is-ancestor', 'HEAD', 'origin/main'])
        command(['git', 'merge', '--ff-only', 'origin/main'])
    command(['codex', 'login', 'status'])
    servers = json.loads(command(['codex', 'mcp', 'list', '--json']))
    if not any(server.get('name') == 'figma' and server.get('enabled') for server in servers):
        raise RuntimeError('The Figma MCP connection is not enabled')
    command(['gcloud', 'auth', 'print-access-token'])  # Token stays in process memory.
    command(['node', 'scripts/blog-editorial.mjs', 'check'])


def save_private(path, data):
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(data, indent=2) + '\n')
    temporary.chmod(0o600)
    temporary.replace(path)


def run(args):
    config = json.loads((ROOT / 'editorial/config.json').read_text())
    if args.at and not args.check:
        raise RuntimeError('--at is available only with --check; execution always uses the real clock')
    now = datetime.fromisoformat(args.at) if args.at else datetime.now(ZoneInfo(config['timezone']))
    if now.tzinfo is None:
        raise RuntimeError('The check timestamp must include a timezone')
    date = now.astimezone(ZoneInfo(config['timezone'])).date().isoformat()
    run_path = ROOT / 'editorial/runs' / f'{date}.json'
    run_record = json.loads(run_path.read_text()) if run_path.exists() else {}
    scratch = ROOT / '.daily-blog/pcm'
    attempt_path = scratch / f'{date}.json'
    eligible, reason = eligibility(config, now, run_record.get('status') == 'published', attempt_path.exists())
    plan = {'date': date, 'eligible': eligible, 'reason': reason, 'startTime': config['startTime'],
            'timezone': config['timezone'], 'trial': config['trial'], 'cwd': str(ROOT),
            'figma': config['figma']['url']}
    if args.check or not eligible:
        print(json.dumps(plan, indent=2))
        return 0

    scratch.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chmod(scratch, 0o700)
    lock_path = ROOT / '.git/padho-daily-pcm.lock'
    with lock_path.open('a') as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            print('Another PCM run holds the main-checkout lock; no work started.')
            return 0
        # Recheck after acquiring the lock; two callers may have arrived together.
        if attempt_path.exists():
            print('This date already has an attempt; no duplicate run started.')
            return 0
        attempt = {**plan, 'status': 'started', 'startedAt': datetime.now().astimezone().isoformat()}
        save_private(attempt_path, attempt)
        try:
            preflight()
            # A fast-forward may have brought in a stop request or a completed run.
            config = json.loads((ROOT / 'editorial/config.json').read_text())
            record = json.loads(run_path.read_text()) if run_path.exists() else {}
            ok, reason = eligibility(config, datetime.now(ZoneInfo(config['timezone'])), record.get('status') == 'published')
            if not ok:
                attempt.update(status='skipped', reason=reason)
                save_private(attempt_path, attempt)
                return 0
            prompt = (ROOT / 'editorial/daily-prompt.md').read_text()
            prompt += f'\nThis invocation date is {date} in Asia/Kolkata. Use the actual clock for publication times.\n'
            output = scratch / f'{date}-result.md'
            events = scratch / f'{date}-events.jsonl'
            errors = scratch / f'{date}-stderr.log'
            cli = [shutil.which('codex'), 'exec', '--approve-for-me', '-C', str(ROOT),
                   '-c', 'web_search="live"', '--color', 'never', '--json',
                   '--output-last-message', str(output), '-']
            with events.open('w') as stdout, errors.open('w') as stderr:
                os.chmod(events, 0o600)
                os.chmod(errors, 0o600)
                result = subprocess.run(cli, input=prompt, text=True, stdout=stdout, stderr=stderr,
                                        cwd=ROOT, timeout=10800)
            if result.returncode:
                raise RuntimeError(f'Codex exited {result.returncode}; inspect {errors} and {events}')
            record = json.loads(run_path.read_text()) if run_path.exists() else {}
            history = json.loads((ROOT / 'editorial/history.json').read_text())['articles']
            articles = [r for r in history if r.get('slug') in record.get('articleSlugs', [])]
            if (record.get('status') != 'published' or len(articles) != 3
                    or sorted(r['category'] for r in articles) != sorted(config['subjects'])
                    or any(r.get('status') != 'published' or r.get('mode') != 'daily'
                           or datetime.fromisoformat(r['publishedAt']).astimezone(ZoneInfo(config['timezone'])).date().isoformat() != date
                           for r in articles)):
                raise RuntimeError('The run did not record three verified published articles; inspect its final response')
            registry = json.loads((ROOT / 'editorial/figma-pages.json').read_text())
            if not any(p.get('date') == date and p.get('pageId') and p.get('verified') is True for p in registry['pages']):
                raise RuntimeError('The dated Figma review page was not verified')
            command(['node', 'scripts/blog-editorial.mjs', 'check'])
            if command(['git', 'status', '--porcelain']):
                raise RuntimeError('Run finished with uncommitted blog changes')
            remote = command(['git', 'ls-remote', 'origin', 'refs/heads/main']).split()[0]
            if command(['git', 'rev-parse', 'HEAD']) != remote:
                raise RuntimeError('Local main and remote main do not match')
            attempt.update(status='published', articleSlugs=record['articleSlugs'])
        except Exception as error:
            attempt.update(status='failed', error=str(error))
            print(str(error), file=sys.stderr)
        finally:
            attempt['finishedAt'] = datetime.now().astimezone().isoformat()
            save_private(attempt_path, attempt)
        return 0 if attempt['status'] == 'published' else 1


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Print eligibility without network, agents or writes')
    parser.add_argument('--at', help='Timezone-bearing timestamp for --check boundary tests only')
    try:
        sys.exit(run(parser.parse_args()))
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
