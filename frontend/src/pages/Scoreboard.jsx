import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchAPI } from '../services/api';

export default function Scoreboard() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [completedMatches, setCompletedMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      const liveRes = await matchAPI.getAll({ status: 'live' });
      setLiveMatches(liveRes.data.results || liveRes.data);
      const completedRes = await matchAPI.getAll({ status: 'completed' });
      setCompletedMatches((completedRes.data.results || completedRes.data).slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch matches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading scoreboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Live Scoreboard</h1>

        {liveMatches.length > 0 ? (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-green-700 mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              Live Matches
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {liveMatches.map((match) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="block bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition border-l-4 border-green-500"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                      LIVE
                    </span>
                    <span className="text-xs text-gray-500">{match.tournament?.name || 'Friendly'}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">{match.team_a?.name}</span>
                      {match.team_a_score && (
                        <span className="text-lg font-bold text-gray-900">
                          {match.team_a_score.runs}/{match.team_a_score.wickets}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            ({match.team_a_score.overs} ov)
                          </span>
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-800">{match.team_b?.name}</span>
                      {match.team_b_score && (
                        <span className="text-lg font-bold text-gray-900">
                          {match.team_b_score.runs}/{match.team_b_score.wickets}
                          <span className="text-sm font-normal text-gray-500 ml-1">
                            ({match.team_b_score.overs} ov)
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  {match.status_detail && (
                    <p className="mt-3 text-sm text-gray-600 italic">{match.status_detail}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-10 bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No live matches right now</p>
          </div>
        )}

        {completedMatches.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Recently Completed</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {completedMatches.map((match) => (
                <Link
                  key={match.id}
                  to={`/matches/${match.id}`}
                  className="block bg-white rounded-lg shadow p-5 hover:shadow-lg transition border-l-4 border-gray-400"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      COMPLETED
                    </span>
                    <span className="text-xs text-gray-500">{match.tournament?.name || 'Friendly'}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{match.team_a?.name}</span>
                      {match.team_a_score && (
                        <span className="font-bold text-gray-900">
                          {match.team_a_score.runs}/{match.team_a_score.wickets}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">{match.team_b?.name}</span>
                      {match.team_b_score && (
                        <span className="font-bold text-gray-900">
                          {match.team_b_score.runs}/{match.team_b_score.wickets}
                        </span>
                      )}
                    </div>
                  </div>
                  {match.result && (
                    <p className="mt-3 text-sm text-green-700 font-medium">{match.result}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
