import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Matches from './pages/Matches';
import MatchDetail from './pages/MatchDetail';
import CreateMatch from './pages/CreateMatch';
import ScoreInput from './pages/ScoreInput';
import Leaderboard from './pages/Leaderboard';
import Tournaments from './pages/Tournaments';
import CreateTournament from './pages/CreateTournament';
import Teams from './pages/Teams';
import CreateTeam from './pages/CreateTeam';
import Scoreboard from './pages/Scoreboard';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/scoreboard" element={<Scoreboard />} />
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/matches" element={<ProtectedRoute><Matches /></ProtectedRoute>} />
        <Route path="/matches/:id" element={<ProtectedRoute><MatchDetail /></ProtectedRoute>} />
        <Route path="/matches/create" element={<ProtectedRoute><CreateMatch /></ProtectedRoute>} />
        <Route path="/matches/:id/score" element={<ProtectedRoute><ScoreInput /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/tournaments" element={<ProtectedRoute><Tournaments /></ProtectedRoute>} />
        <Route path="/tournaments/create" element={<ProtectedRoute><CreateTournament /></ProtectedRoute>} />
        <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
        <Route path="/teams/create" element={<ProtectedRoute><CreateTeam /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
