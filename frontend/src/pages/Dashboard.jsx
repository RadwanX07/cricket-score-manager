import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { playerAPI, matchAPI } from '../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Trophy, Target, Users, Activity } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const { user, isPlayer, isOrganizer } = useAuth();
  const [stats, setStats] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isPlayer) {
          const { data } = await playerAPI.getMyProfile();
          setStats(data);
        }
        const { data: matchesData } = await matchAPI.getAll();
        setMatches(matchesData.results || matchesData);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isPlayer]);

  if (loading) return <div className="p-8">Loading...</div>;

  const statCards = isPlayer && stats ? [
    { label: 'Matches', value: stats.matches_played, icon: Trophy },
    { label: 'Runs', value: stats.runs_scored, icon: Target },
    { label: 'Wickets', value: stats.wickets_taken, icon: Users },
    { label: 'Strike Rate', value: stats.strike_rate, icon: Activity },
  ] : [];

  const chartData = isPlayer && stats ? {
    labels: ['Runs', 'Wickets', 'Catches', 'Matches'],
    datasets: [{
      label: 'Player Stats',
      data: [stats.runs_scored, stats.wickets_taken, stats.catches, stats.matches_played],
      backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(59, 130, 246, 0.5)', 'rgba(249, 115, 22, 0.5)', 'rgba(168, 85, 247, 0.5)'],
    }],
  } : null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.username}</h1>
      
      {statCards.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-primary-500" />
              </div>
            </div>
          ))}
        </div>
      )}

      {chartData && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
          <div className="h-64">
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Matches</h2>
        <div className="space-y-3">
          {matches.slice(0, 5).map((match) => (
            <div key={match.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">{match.team_a_name}</span>
                <span className="mx-2 text-gray-500">vs</span>
                <span className="font-medium">{match.team_b_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  match.status === 'live' ? 'bg-green-100 text-green-800' :
                  match.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {match.status}
                </span>
                <span className="text-sm text-gray-500">{new Date(match.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
