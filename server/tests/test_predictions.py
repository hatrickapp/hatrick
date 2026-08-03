import unittest
from datetime import datetime, timezone

from server.src.logic.predictions.scoring import resolve_btts, resolve_outcome, score_prediction
from server.src.logic.predictions.week import local_week_bounds


class PredictionScoringTests(unittest.TestCase):
    def test_resolve_outcome(self):
        self.assertEqual(resolve_outcome(2, 1), "home")
        self.assertEqual(resolve_outcome(1, 2), "away")
        self.assertEqual(resolve_outcome(1, 1), "draw")

    def test_btts_uses_simple_score_math(self):
        self.assertTrue(resolve_btts(1, 1))
        self.assertFalse(resolve_btts(1, 0))
        self.assertFalse(resolve_btts(0, 0))

    def test_hatrick_max_points(self):
        score = score_prediction(
            outcome_pick="home",
            btts_pick=True,
            scorer_player_id="player-1",
            home_score=2,
            away_score=1,
            scorer_player_ids={"player-1"},
        )
        self.assertEqual(score.points, 60)
        self.assertTrue(score.hatrick_bonus_awarded)

    def test_partial_points(self):
        score = score_prediction(
            outcome_pick="draw",
            btts_pick=False,
            scorer_player_id="player-1",
            home_score=2,
            away_score=0,
            scorer_player_ids=set(),
        )
        self.assertEqual(score.points, 10)
        self.assertFalse(score.hatrick_bonus_awarded)


class WeekBoundaryTests(unittest.TestCase):
    def test_week_bounds_use_user_timezone_monday(self):
        week_start, week_end = local_week_bounds(
            datetime(2026, 7, 11, 20, 0, tzinfo=timezone.utc),
            "Asia/Amman",
        )
        self.assertEqual(week_start.isoformat(), "2026-07-06")
        self.assertEqual(week_end.isoformat(), "2026-07-12")


if __name__ == "__main__":
    unittest.main()
