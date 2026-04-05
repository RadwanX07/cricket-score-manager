import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teamAPI } from '../services/api';

export default function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await teamAPI.getAll();
      setTeams(data);
    } catch (error) {
      console.error('Failed to load teams:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <Link
          to="/teams/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Create Team
        </Link>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No teams found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {team.name}
              </h2>
              <p className="text-gray-600 mb-2">
                Captain: {team.captain_name}
              </p>
              <p className="text-sm text-gray-500">
                Players: {team.player_count}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
