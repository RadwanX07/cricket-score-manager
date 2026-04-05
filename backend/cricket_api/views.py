from rest_framework import viewsets, status, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg
from .models_player import Player
from .models_team import Team
from .models_match import Tournament, Match, Innings, BallByBall
from .serializers import (
    UserSerializer, UserCreateSerializer, PlayerSerializer,
    TeamSerializer, TournamentSerializer, MatchSerializer,
    MatchCreateSerializer, InningsSerializer, BallByBallSerializer,
    LeaderboardSerializer
)
from .permissions import IsOrganizerOrAdmin, IsMatchCreatorOrAdmin

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

class AuthView(generics.CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)

class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return Player.objects.all()
        return Player.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        players = Player.objects.annotate(
            total_runs=Sum('runs_scored'),
            total_wickets=Sum('wickets_taken'),
            total_matches=Sum('matches_played')
        ).order_by('-runs_scored')[:50]
        
        data = []
        for player in players:
            data.append({
                'player_id': player.id,
                'username': player.user.username,
                'matches_played': player.matches_played,
                'runs_scored': player.runs_scored,
                'wickets_taken': player.wickets_taken,
                'batting_average': player.batting_average,
                'strike_rate': player.strike_rate,
                'bowling_average': player.bowling_average,
            })
        
        serializer = LeaderboardSerializer(data, many=True)
        return Response(serializer.data)

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['post'])
    def add_player(self, request, pk=None):
        team = self.get_object()
        player_id = request.data.get('player_id')
        if not player_id:
            return Response({'error': 'player_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            player = User.objects.get(id=player_id)
            team.players.add(player)
            return Response({'status': 'player added'})
        except User.DoesNotExist:
            return Response({'error': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def remove_player(self, request, pk=None):
        team = self.get_object()
        player_id = request.data.get('player_id')
        if not player_id:
            return Response({'error': 'player_id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            player = User.objects.get(id=player_id)
            team.players.remove(player)
            return Response({'status': 'player removed'})
        except User.DoesNotExist:
            return Response({'error': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role in ['admin', 'organizer']:
            return Tournament.objects.all()
        return Tournament.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)

class MatchViewSet(viewsets.ModelViewSet):
    queryset = Match.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return MatchCreateSerializer
        return MatchSerializer

    def get_queryset(self):
        queryset = Match.objects.all()
        status_param = self.request.query_params.get('status')
        match_type = self.request.query_params.get('type')
        
        if status_param:
            queryset = queryset.filter(status=status_param)
        if match_type:
            queryset = queryset.filter(match_type=match_type)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def update_score(self, request, pk=None):
        match = self.get_object()
        if match.status != 'live':
            return Response({'error': 'Match is not live'}, status=status.HTTP_400_BAD_REQUEST)
        
        innings_data = request.data.get('innings')
        if innings_data:
            innings, _ = Innings.objects.get_or_create(
                match=match,
                innings_number=innings_data.get('innings_number', 1)
            )
            innings.total_runs = innings_data.get('total_runs', innings.total_runs)
            innings.total_wickets = innings_data.get('total_wickets', innings.total_wickets)
            innings.total_overs = innings_data.get('total_overs', innings.total_overs)
            innings.extras = innings_data.get('extras', innings.extras)
            innings.save()
        
        return Response({'status': 'score updated'})

    @action(detail=True, methods=['post'])
    def add_delivery(self, request, pk=None):
        match = self.get_object()
        if match.status != 'live':
            return Response({'error': 'Match is not live'}, status=status.HTTP_400_BAD_REQUEST)
        
        delivery_data = request.data
        innings_number = delivery_data.get('innings_number', 1)
        
        try:
            innings = Innings.objects.get(match=match, innings_number=innings_number)
        except Innings.DoesNotExist:
            return Response({'error': 'Innings not found'}, status=status.HTTP_404_NOT_FOUND)
        
        delivery = BallByBall.objects.create(
            innings=innings,
            over_number=delivery_data.get('over_number'),
            ball_number=delivery_data.get('ball_number'),
            batsman_id=delivery_data.get('batsman_id'),
            bowler_id=delivery_data.get('bowler_id'),
            runs=delivery_data.get('runs', 0),
            is_wicket=delivery_data.get('is_wicket', False),
            wicket_type=delivery_data.get('wicket_type', ''),
            is_extra=delivery_data.get('is_extra', False),
            extra_type=delivery_data.get('extra_type', ''),
        )
        
        serializer = BallByBallSerializer(delivery)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def scoreboard(self, request, pk=None):
        match = self.get_object()
        innings = Innings.objects.filter(match=match).order_by('innings_number')
        deliveries = BallByBall.objects.filter(innings__in=innings).order_by('over_number', 'ball_number')
        
        return Response({
            'match': MatchSerializer(match).data,
            'innings': InningsSerializer(innings, many=True).data,
            'deliveries': BallByBallSerializer(deliveries, many=True).data,
        })

    @action(detail=True, methods=['get'])
    def export_csv(self, request, pk=None):
        import csv
        from django.http import HttpResponse
        
        match = self.get_object()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="match_{match.id}_stats.csv"'
        
        writer = csv.writer(response)
        writer.writerow(['Match', f'{match.team_a.name} vs {match.team_b.name}'])
        writer.writerow(['Date', match.date])
        writer.writerow(['Venue', match.venue])
        writer.writerow(['Result', match.winner.name if match.winner else 'TBD'])
        writer.writerow([])
        writer.writerow(['Innings', 'Team', 'Runs', 'Wickets', 'Overs', 'Extras'])
        
        for inning in Innings.objects.filter(match=match).order_by('innings_number'):
            writer.writerow([
                inning.innings_number,
                inning.batting_team.name,
                inning.total_runs,
                inning.total_wickets,
                inning.total_overs,
                inning.extras
            ])
        
        return response
