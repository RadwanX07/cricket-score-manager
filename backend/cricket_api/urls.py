from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    UserViewSet, AuthView, PlayerViewSet, TeamViewSet,
    TournamentViewSet, MatchViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'tournaments', TournamentViewSet)
router.register(r'matches', MatchViewSet)

urlpatterns = [
    path('auth/register/', AuthView.as_view(), name='auth_register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
]
