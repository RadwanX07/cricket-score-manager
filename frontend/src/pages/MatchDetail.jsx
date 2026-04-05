import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function MatchDetail() {
  const { id } = useParams();
  const { isOrganizer } = useAuth();
  const [match, setMatch] = useState(null);
  const [scoreboard, setScoreboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const { data } = await matchAPI.getById(id);
        setMatch(data);
      } catch (error) {
        toast.error('Failed to fetch match details');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  useEffect(() => {
    const fetchScoreboard = async () => {
      try {
        const { data } = await matchAPI.getScoreboard(id);
        setScoreboard(data);
      } catch (error) {
        toast.error('Failed to fetch scoreboard');
      }
    };
    fetchScoreboard();
  }, [id]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const response = await matchAPI.exportCSV(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `match-${id}-scorecard.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('CSV exported successfully');
    } catch (error) {
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

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

  if (!match) return <div className="p-8">Match not found.</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Link to="/matches" className="text-primary-600 hover:text-primary-700 font-medium">
          &larr; Back to Matches
        </Link>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {match.team_a_name} vs {match.team_b_name}
            </h1>
            <span className={`inline-block mt-1 px-2 py-1 rounded text-xs font-medium ${getStatusBadgeClass(match.status)}`}>
              {match.status.toUpperCase()}
            </span>
          </div>
          {match.status === 'live' && isOrganizer && (
            <Link
              to={`/matches/${id}/score`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
            >
              Input Score
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">{new Date(match.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Venue</p>
            <p className="font-medium">{match.venue || 'TBD'}</p>
          </div>
          <div>
            <p className="text-gray-500">Format</p>
            <p className="font-medium capitalize">{match.format || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500">Toss</p>
            <p className="font-medium">
              {match.toss_winner && match.toss_decision
                ? `${match.toss_winner} elected to ${match.toss_decision}`
                : 'TBD'}
            </p>
          </div>
        </div>
      </div>

      {scoreboard && scoreboard.innings && scoreboard.innings.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Scorecard</h2>
          {scoreboard.innings.map((inning, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Innings {index + 1}: {inning.batting_team}
              </h3>
              <div className="flex items-center gap-6 mb-4">
                <div className="text-2xl font-bold">
                  {inning.runs}/{inning.wickets}
                </div>
                <div className="text-gray-500">
                  ({inning.overs} overs)
                </div>
              </div>

              {inning.batsmen && inning.batsmen.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-600">Batter</th>
                        <th className="text-right py-2 font-medium text-gray-600">R</th>
                        <th className="text-right py-2 font-medium text-gray-600">B</th>
                        <th className="text-right py-2 font-medium text-gray-600">4s</th>
                        <th className="text-right py-2 font-medium text-gray-600">6s</th>
                        <th className="text-right py-2 font-medium text-gray-600">SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inning.batsmen.map((batsman, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{batsman.player_name}</td>
                          <td className="py-2 text-right font-medium">{batsman.runs}</td>
                          <td className="py-2 text-right">{batsman.balls}</td>
                          <td className="py-2 text-right">{batsman.fours}</td>
                          <td className="py-2 text-right">{batsman.sixes}</td>
                          <td className="py-2 text-right">{batsman.strike_rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {inning.bowlers && inning.bowlers.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <h4 className="font-medium text-gray-700 mb-2">Bowling</h4>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 font-medium text-gray-600">Bowler</th>
                        <th className="text-right py-2 font-medium text-gray-600">O</th>
                        <th className="text-right py-2 font-medium text-gray-600">M</th>
                        <th className="text-right py-2 font-medium text-gray-600">R</th>
                        <th className="text-right py-2 font-medium text-gray-600">W</th>
                        <th className="text-right py-2 font-medium text-gray-600">Econ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inning.bowlers.map((bowler, i) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{bowler.player_name}</td>
                          <td className="py-2 text-right">{bowler.overs}</td>
                          <td className="py-2 text-right">{bowler.maidens}</td>
                          <td className="py-2 text-right">{bowler.runs}</td>
                          <td className="py-2 text-right">{bowler.wickets}</td>
                          <td className="py-2 text-right">{bowler.economy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {inning.deliveries && inning.deliveries.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Ball by Ball</h4>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {inning.deliveries.map((delivery, i) => (
                      <div key={i} className="flex items-center gap-4 text-sm py-1 border-b">
                        <span className="text-gray-500 w-16">
                          {delivery.over}.{delivery.ball}
                        </span>
                        <span className="flex-1">
                          {delivery.bowler} to {delivery.batsman}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          delivery.runs === 4 ? 'bg-blue-100 text-blue-800' :
                          delivery.runs === 6 ? 'bg-purple-100 text-purple-800' :
                          delivery.is_wicket ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {delivery.is_wicket ? 'W' : delivery.runs}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(!scoreboard || !scoreboard.innings || scoreboard.innings.length === 0) && (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No scorecard data available yet.
        </div>
      )}
    </div>
  );
}
