import { useState, useEffect } from 'react';
import { playerAPI } from '../services/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await playerAPI.getLeaderboard();
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matches</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Runs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wickets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SR</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaderboard.map((player, index) => (
              <tr key={player.player_id} className={index < 3 ? 'bg-primary-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-yellow-400 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{player.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{player.matches_played}</td>
                <td className="px-6 py-4 whitespace-nowrap">{player.runs_scored}</td>
                <td className="px-6 py-4 whitespace-nowrap">{player.wickets_taken}</td>
                <td className="px-6 py-4 whitespace-nowrap">{player.batting_average}</td>
                <td className="px-6 py-4 whitespace-nowrap">{player.strike_rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
