#!/usr/bin/env python3
"""Install the explicitly authorised seven-morning local launchd schedule."""
import argparse
from datetime import date, datetime, timedelta
import json
import os
from pathlib import Path
import plistlib
import shutil
import subprocess
import sys
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
LABEL = 'ai.padho.blog-pcm-trial'


def schedule(config):
    start, end = (date.fromisoformat(config['trial'][key]) for key in ('startDate', 'endDate'))
    if (end - start).days != 6:
        raise ValueError('This installer is scoped to the approved seven-day trial')
    hour, minute = map(int, config['startTime'].split(':'))
    return [{'Month': d.month, 'Day': d.day, 'Hour': hour, 'Minute': minute}
            for d in (start + timedelta(days=n) for n in range(7))]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--install', action='store_true')
    parser.add_argument('--remove', action='store_true')
    args = parser.parse_args()
    if args.install and args.remove:
        parser.error('Choose install or remove')
    config = json.loads((ROOT / 'editorial/config.json').read_text())
    target = Path.home() / 'Library/LaunchAgents' / f'{LABEL}.plist'
    domain = f'gui/{os.getuid()}'
    service = f'{domain}/{LABEL}'
    if args.remove:
        subprocess.run(['launchctl', 'bootout', service], capture_output=True)
        target.unlink(missing_ok=True)
        print(f'Removed {LABEL}')
        return
    if datetime.now().astimezone().utcoffset() != datetime.now(ZoneInfo(config['timezone'])).utcoffset():
        raise RuntimeError('Mac timezone must match Asia/Kolkata for this calendar schedule')
    tool_dirs = []
    for tool in ('codex', 'node', 'npm', 'gcloud', 'git'):
        executable = shutil.which(tool)
        if not executable:
            raise RuntimeError(f'Missing executable: {tool}')
        tool_dirs.append(str(Path(executable).parent))
    log_dir = Path.home() / 'Library/Logs/PadhoBlogTrial'
    task = {
        'Label': LABEL,
        'ProgramArguments': [sys.executable, str(ROOT / 'scripts/daily-blog-run.py')],
        'WorkingDirectory': str(ROOT),
        'StartCalendarInterval': schedule(config),
        'RunAtLoad': False,
        'EnvironmentVariables': {
            'PATH': ':'.join(dict.fromkeys(tool_dirs + ['/opt/homebrew/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'])),
            'TZ': config['timezone'],
        },
        'StandardOutPath': str(log_dir / 'runner.log'),
        'StandardErrorPath': str(log_dir / 'runner-error.log'),
        'ProcessType': 'Background',
        'Umask': 63,
    }
    if not args.install:
        print(plistlib.dumps(task).decode())
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    log_dir.mkdir(parents=True, exist_ok=True, mode=0o700)
    if target.exists():
        current = plistlib.loads(target.read_bytes())
        if current == task:
            active = subprocess.run(['launchctl', 'print', service], capture_output=True)
            if active.returncode == 0:
                print(f'Already installed and loaded: {service}')
                return
        raise RuntimeError('A different schedule already exists; inspect it before replacing')
    target.write_bytes(plistlib.dumps(task))
    target.chmod(0o600)
    subprocess.run(['plutil', '-lint', str(target)], check=True)
    subprocess.run(['launchctl', 'bootstrap', domain, str(target)], check=True)
    subprocess.run(['launchctl', 'print', service], check=True)
    print(f'Installed seven-morning trial: {target}')


if __name__ == '__main__':
    main()
