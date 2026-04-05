import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchAPI } from '../services/api';

export default function Matches() {
  const { isOrganizer } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        if (typeFilter) params.type = typeFilter;
        const { data } = await matchAPI.getAll(params);
        setMatches(data.results || data);
      } catch (error) {
        console.error('Failed to fetch matches', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [statusFilter, typeFilter]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'live':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
        {isOrganizer && (
          <Link
            to="/matches/create"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
          >
            Create Match
          </Link>
        )}
      </div>

      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 bg-white"
        >
          <option value="">All Types</option>
          <option value="single">Single</option>
          <option value="tournament">Tournament</option>
        </select>
      </div>

      {matches.length === 0 ? (
        <p className="text-gray-500">No matches found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-lg shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <p className="font-semibold text-lg">{match.team_a_name}</p>
                  <p className="text-sm text-gray-500">vs</p>
                  <p className="font-semibold text-lg">{match.team_b_name}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(match.status)}`}>
                  {match.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p>{new Date(match.date).toLocaleDateString()}</p>
                {match.venue && <p>{match.venue}</p>}
                {match.type && <p className="capitalize">Type: {match.type}</p>}
              </div>
              <Link
                to={`/matches/${match.id}`}
                className="mt-4 inline-block text-primary-600 hover:text-primary-700 font-medium"
              >
                View
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
