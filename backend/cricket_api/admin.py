from django.contrib import admin
from .models import User, Player, Team, Tournament, Match, Innings, BallByBall

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email')

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ('user', 'matches_played', 'runs_scored', 'wickets_taken', 'batting_average')
    search_fields = ('user__username',)

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'captain', 'player_count')
    search_fields = ('name',)

@admin.register(Tournament)
class TournamentAdmin(admin.ModelAdmin):
    list_display = ('name', 'organizer', 'start_date', 'end_date', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('title', 'team_a', 'team_b', 'status', 'date', 'match_type')
    list_filter = ('status', 'match_type', 'format')
    search_fields = ('title',)

@admin.register(Innings)
class InningsAdmin(admin.ModelAdmin):
    list_display = ('match', 'batting_team', 'innings_number', 'total_runs', 'total_wickets')

@admin.register(BallByBall)
class BallByBallAdmin(admin.ModelAdmin):
    list_display = ('innings', 'over_number', 'ball_number', 'batsman', 'bowler', 'runs', 'is_wicket')
    list_filter = ('is_wicket', 'is_extra')
