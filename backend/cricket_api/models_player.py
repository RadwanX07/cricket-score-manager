from django.db import models
from django.conf import settings

class Player(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='player_profile')
    batting_style = models.CharField(max_length=50, blank=True)
    bowling_style = models.CharField(max_length=50, blank=True)
    playing_role = models.CharField(max_length=50, blank=True)
    
    matches_played = models.IntegerField(default=0)
    runs_scored = models.IntegerField(default=0)
    balls_faced = models.IntegerField(default=0)
    balls_bowled = models.IntegerField(default=0)
    runs_conceded = models.IntegerField(default=0)
    wickets_taken = models.IntegerField(default=0)
    catches = models.IntegerField(default=0)
    stumpings = models.IntegerField(default=0)
    highest_score = models.IntegerField(default=0)
    best_bowling = models.CharField(max_length=20, default='0/0')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def batting_average(self):
        outs = self.matches_played - (self.catches + self.stumpings)
        return round(self.runs_scored / max(outs, 1), 2)

    @property
    def strike_rate(self):
        return round((self.runs_scored / max(self.balls_faced, 1)) * 100, 2)

    @property
    def bowling_average(self):
        return round(self.runs_conceded / max(self.wickets_taken, 1), 2)

    @property
    def economy_rate(self):
        overs = self.balls_bowled / 6
        return round(self.runs_conceded / max(overs, 1), 2)

    def __str__(self):
        return f"Player: {self.user.username}"
