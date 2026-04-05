import { useState, useEffect } from 'react';
import { playerAPI } from '../services/api';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await playerAPI.getMyProfile();
        setProfile(data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!profile) return <div className="p-8">Profile not found</div>;

  const battingData = {
    labels: ['Matches', 'Runs', 'Balls Faced', 'Highest Score'],
    datasets: [{
      label: 'Batting Stats',
      data: [profile.matches_played, profile.runs_scored, profile.balls_faced, profile.highest_score],
      backgroundColor: ['rgba(34, 197, 94, 0.5)', 'rgba(59, 130, 246, 0.5)', 'rgba(249, 115, 22, 0.5)', 'rgba(168, 85, 247, 0.5)'],
    }],
  };

  const bowlingData = {
    labels: ['Wickets', 'Runs Conceded', 'Balls Bowled', 'Catches'],
    datasets: [{
      label: 'Bowling Stats',
      data: [profile.wickets_taken, profile.runs_conceded, profile.balls_bowled, profile.catches],
      backgroundColor: ['rgba(239, 68, 68, 0.5)', 'rgba(236, 72, 153, 0.5)', 'rgba(14, 165, 233, 0.5)', 'rgba(99, 102, 241, 0.5)'],
    }],
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Player Profile</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-primary-600">
              {profile.user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile.user?.username}</h2>
            <p className="text-gray-600">{profile.user?.email}</p>
            <p className="text-sm text-primary-600 capitalize">{profile.playing_role || 'Player'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.matches_played}</p>
            <p className="text-sm text-gray-600">Matches</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.runs_scored}</p>
            <p className="text-sm text-gray-600">Runs</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.wickets_taken}</p>
            <p className="text-sm text-gray-600">Wickets</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">{profile.catches}</p>
            <p className="text-sm text-gray-600">Catches</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-lg font-bold">{profile.batting_average}</p>
            <p className="text-sm text-gray-600">Batting Avg</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-lg font-bold">{profile.strike_rate}</p>
            <p className="text-sm text-gray-600">Strike Rate</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-lg font-bold">{profile.bowling_average}</p>
            <p className="text-sm text-gray-600">Bowling Avg</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-lg font-bold">{profile.economy_rate}</p>
            <p className="text-sm text-gray-600">Economy</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="h-64">
            <Bar data={battingData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
          <div className="h-64">
            <Bar data={bowlingData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
}
