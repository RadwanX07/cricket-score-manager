from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models_player import Player
from .models_team import Team
from .models_match import Tournament, Match, Innings, BallByBall

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'profile_picture', 'created_at')
        read_only_fields = ('created_at',)

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password_confirm', 'role', 'phone')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'player'),
            phone=validated_data.get('phone', '')
        )
        return user

class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    batting_average = serializers.ReadOnlyField()
    strike_rate = serializers.ReadOnlyField()
    bowling_average = serializers.ReadOnlyField()
    economy_rate = serializers.ReadOnlyField()

    class Meta:
        model = Player
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    captain_name = serializers.CharField(source='captain.username', read_only=True)
    player_count = serializers.ReadOnlyField()

    class Meta:
        model = Team
        fields = '__all__'

class TournamentSerializer(serializers.ModelSerializer):
    organizer_name = serializers.CharField(source='organizer.username', read_only=True)
    match_count = serializers.ReadOnlyField()

    class Meta:
        model = Tournament
        fields = '__all__'

class InningsSerializer(serializers.ModelSerializer):
    batting_team_name = serializers.CharField(source='batting_team.name', read_only=True)
    bowling_team_name = serializers.CharField(source='bowling_team.name', read_only=True)

    class Meta:
        model = Innings
        fields = '__all__'

class BallByBallSerializer(serializers.ModelSerializer):
    batsman_name = serializers.CharField(source='batsman.username', read_only=True)
    bowler_name = serializers.CharField(source='bowler.username', read_only=True)

    class Meta:
        model = BallByBall
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    team_a_name = serializers.CharField(source='team_a.name', read_only=True)
    team_b_name = serializers.CharField(source='team_b.name', read_only=True)
    winner_name = serializers.CharField(source='winner.name', read_only=True, allow_null=True)
    tournament_name = serializers.CharField(source='tournament.name', read_only=True, allow_null=True)
    innings = InningsSerializer(many=True, read_only=True)

    class Meta:
        model = Match
        fields = '__all__'

class MatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'
        read_only_fields = ('created_by',)

class LeaderboardSerializer(serializers.Serializer):
    player_id = serializers.IntegerField()
    username = serializers.CharField()
    matches_played = serializers.IntegerField()
    runs_scored = serializers.IntegerField()
    wickets_taken = serializers.IntegerField()
    batting_average = serializers.FloatField()
    strike_rate = serializers.FloatField()
    bowling_average = serializers.FloatField()
