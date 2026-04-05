import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { matchAPI, teamAPI, tournamentAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function CreateMatch() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    match_type: 'single',
    format: 'T20',
    date: '',
    venue: '',
    team_a: '',
    team_b: '',
    tournament: '',
    toss_winner: '',
    toss_decision: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [teamsRes, tournamentsRes] = await Promise.all([
          teamAPI.getAll(),
          tournamentAPI.getAll(),
        ]);
        setTeams(teamsRes.data || []);
        setTournaments(tournamentsRes.data || []);
      } catch {
        toast.error('Failed to load teams and tournaments');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.venue || !formData.team_a || !formData.team_b) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.team_a === formData.team_b) {
      toast.error('Team A and Team B cannot be the same');
      return;
    }

    setLoading(true);

    try {
      const { created_by, ...dataToSubmit } = formData;
      const payload = Object.fromEntries(
        Object.entries(dataToSubmit).filter(([, v]) => v !== '')
      );
      await matchAPI.create(payload);
      toast.success('Match created successfully');
      navigate('/matches');
    } catch {
      toast.error('Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Match</h1>
          <Link to="/matches" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Back to Matches
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Enter match title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="match_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Match Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="match_type"
                  name="match_type"
                  value={formData.match_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                >
                  <option value="single">Single</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>

              <div>
                <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-1">
                  Format <span className="text-red-500">*</span>
                </label>
                <select
                  id="format"
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                >
                  <option value="T20">T20</option>
                  <option value="ODI">ODI</option>
                  <option value="Test">Test</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-1">
                Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                placeholder="Enter venue"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="team_a" className="block text-sm font-medium text-gray-700 mb-1">
                  Team A <span className="text-red-500">*</span>
                </label>
                <select
                  id="team_a"
                  name="team_a"
                  value={formData.team_a}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                >
                  <option value="">Select Team A</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="team_b" className="block text-sm font-medium text-gray-700 mb-1">
                  Team B <span className="text-red-500">*</span>
                </label>
                <select
                  id="team_b"
                  name="team_b"
                  value={formData.team_b}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                >
                  <option value="">Select Team B</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tournament" className="block text-sm font-medium text-gray-700 mb-1">
                Tournament <span className="text-gray-400">(optional)</span>
              </label>
              <select
                id="tournament"
                name="tournament"
                value={formData.tournament}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
              >
                <option value="">Select Tournament</option>
                {tournaments.map((tournament) => (
                  <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Toss Details (optional)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="toss_winner" className="block text-sm font-medium text-gray-700 mb-1">
                    Toss Winner
                  </label>
                  <select
                    id="toss_winner"
                    name="toss_winner"
                    value={formData.toss_winner}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  >
                    <option value="">Select Toss Winner</option>
                    {teams
                      .filter((t) => t.id === formData.team_a || t.id === formData.team_b)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="toss_decision" className="block text-sm font-medium text-gray-700 mb-1">
                    Toss Decision
                  </label>
                  <select
                    id="toss_decision"
                    name="toss_decision"
                    value={formData.toss_decision}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition bg-white"
                  >
                    <option value="">Select Decision</option>
                    <option value="bat">Bat</option>
                    <option value="bowl">Bowl</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3">
            <Link
              to="/matches"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Match'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
