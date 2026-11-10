import importlib.util
from datetime import datetime
from pathlib import Path
import unittest


def load(name, filename):
    spec = importlib.util.spec_from_file_location(name, Path(__file__).with_name(filename))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


runner = load('runner', 'daily-blog-run.py')
installer = load('installer', 'install-daily-blog.py')
CONFIG = {'timezone': 'Asia/Kolkata', 'startTime': '07:00',
          'trial': {'enabled': True, 'startDate': '2026-11-11', 'endDate': '2026-11-17'}}


class TrialTests(unittest.TestCase):
    def eligible(self, at, **kwargs):
        return runner.eligibility(CONFIG, datetime.fromisoformat(at), **kwargs)

    def test_only_seven_mornings(self):
        self.assertTrue(self.eligible('2026-11-11T07:00:00+05:30')[0])
        self.assertTrue(self.eligible('2026-11-17T07:00:00+05:30')[0])
        self.assertFalse(self.eligible('2026-11-10T07:00:00+05:30')[0])
        self.assertFalse(self.eligible('2026-11-18T07:00:00+05:30')[0])
        self.assertFalse(self.eligible('2027-11-11T07:00:00+05:30')[0])

    def test_uses_ist_and_waits_for_start(self):
        self.assertTrue(self.eligible('2026-11-11T01:30:00+00:00')[0])
        self.assertFalse(self.eligible('2026-11-11T01:29:00+00:00')[0])

    def test_no_duplicate_or_unattended_retries(self):
        at = '2026-11-11T07:00:00+05:30'
        self.assertFalse(self.eligible(at, completed=True)[0])
        self.assertFalse(self.eligible(at, attempted=True)[0])

    def test_does_not_backfill_after_morning(self):
        self.assertEqual(self.eligible('2026-11-11T15:00:00+05:30')[1], 'missed_morning_no_backfill')

    def test_schedule_has_exact_dates(self):
        days = installer.schedule(CONFIG)
        self.assertEqual([d['Day'] for d in days], list(range(11, 18)))
        self.assertTrue(all(d['Hour'] == 7 and d['Minute'] == 0 and d['Month'] == 11 for d in days))


if __name__ == '__main__':
    unittest.main()
