import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tournamentAPI } from '../services/api';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const data = await tournamentAPI.getAll();
      setTournaments(data);
    } catch (error) {
      console.error('Failed to load tournaments:', error);
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
        <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
        <Link
          to="/tournaments/create"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Create Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tournaments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              to={`/tournaments/${tournament.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {tournament.name}
              </h2>
              <p className="text-gray-600 mb-2">
                Organizer: {tournament.organizer_name}
              </p>
              <div className="space-y-1 text-sm text-gray-500">
                <p>Start: {new Date(tournament.start_date).toLocaleDateString()}</p>
                <p>End: {new Date(tournament.end_date).toLocaleDateString()}</p>
                <p>Matches: {tournament.match_count}</p>
              </div>
              <div className="mt-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    tournament.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {tournament.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
