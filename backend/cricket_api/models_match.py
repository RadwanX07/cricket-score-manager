from django.db import models
from django.conf import settings

class Tournament(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    organizer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='organized_tournaments'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def match_count(self):
        return self.matches.count()

    @property
    def participant_count(self):
        return self.participants.count()

class Match(models.Model):
    MATCH_TYPE_CHOICES = (
        ('single', 'Single Match'),
        ('tournament', 'Tournament Match'),
    )
    MATCH_FORMAT_CHOICES = (
        ('T20', 'T20'),
        ('ODI', 'ODI'),
        ('Test', 'Test'),
    )
    MATCH_STATUS_CHOICES = (
        ('upcoming', 'Upcoming'),
        ('live', 'Live'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    title = models.CharField(max_length=200)
    match_type = models.CharField(max_length=20, choices=MATCH_TYPE_CHOICES, default='single')
    format = models.CharField(max_length=10, choices=MATCH_FORMAT_CHOICES, default='T20')
    status = models.CharField(max_length=20, choices=MATCH_STATUS_CHOICES, default='upcoming')
    date = models.DateTimeField()
    venue = models.CharField(max_length=200, blank=True)
    tournament = models.ForeignKey(
        Tournament,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='matches'
    )
    team_a = models.ForeignKey(
        'Team',
        on_delete=models.CASCADE,
        related_name='team_a_matches'
    )
    team_b = models.ForeignKey(
        'Team',
        on_delete=models.CASCADE,
        related_name='team_b_matches'
    )
    winner = models.ForeignKey(
        'Team',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='won_matches'
    )
    toss_winner = models.ForeignKey(
        'Team',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='toss_won_matches'
    )
    toss_decision = models.CharField(max_length=10, choices=[('bat', 'Bat'), ('bowl', 'Bowl')], blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_matches')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.team_a.name} vs {self.team_b.name}"

class Innings(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='innings')
    batting_team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name='batting_innings')
    bowling_team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name='bowling_innings')
    innings_number = models.IntegerField()
    total_runs = models.IntegerField(default=0)
    total_wickets = models.IntegerField(default=0)
    total_overs = models.DecimalField(max_digits=4, decimal_places=1, default=0.0)
    extras = models.IntegerField(default=0)

    class Meta:
        unique_together = ['match', 'innings_number']
        ordering = ['innings_number']

    def __str__(self):
        return f"{self.batting_team.name} - Innings {self.innings_number}: {self.total_runs}/{self.total_wickets}"

class BallByBall(models.Model):
    innings = models.ForeignKey(Innings, on_delete=models.CASCADE, related_name='deliveries')
    over_number = models.IntegerField()
    ball_number = models.IntegerField()
    batsman = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='balls_faced'
    )
    bowler = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='balls_bowled'
    )
    runs = models.IntegerField(default=0)
    is_wicket = models.BooleanField(default=False)
    wicket_type = models.CharField(
        max_length=20,
        choices=[
            ('bowled', 'Bowled'),
            ('caught', 'Caught'),
            ('lbw', 'LBW'),
            ('run_out', 'Run Out'),
            ('stumped', 'Stumped'),
            ('hit_wicket', 'Hit Wicket'),
        ],
        blank=True
    )
    dismissed_player = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='dismissals'
    )
    is_extra = models.BooleanField(default=False)
    extra_type = models.CharField(
        max_length=20,
        choices=[
            ('wide', 'Wide'),
            ('no_ball', 'No Ball'),
            ('bye', 'Bye'),
            ('leg_bye', 'Leg Bye'),
        ],
        blank=True
    )

    class Meta:
        ordering = ['over_number', 'ball_number']

    def __str__(self):
        return f"Over {self.over_number}.{self.ball_number}: {self.runs} runs"
