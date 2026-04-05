import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { matchAPI } from '../services/api'
import toast from 'react-hot-toast'

export default function ScoreInput() {
  const { id } = useParams()
  const [match, setMatch] = useState(null)
  const [scoreboard, setScoreboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    innings_number: 1,
    over_number: 0,
    ball_number: 1,
    batsman: '',
    bowler: '',
    runs: 0,
    is_wicket: false,
    wicket_type: 'bowled',
    is_extra: false,
    extra_type: 'wide',
  })

  const fetchData = async () => {
    try {
      const [matchData, scoreboardData] = await Promise.all([
        matchAPI.getById(id),
        matchAPI.getScoreboard(id),
      ])
      setMatch(matchData)
      setScoreboard(scoreboardData)
    } catch (error) {
      toast.error('Failed to fetch match data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.batsman.trim()) {
      toast.error('Batsman name is required')
      return
    }
    if (!formData.bowler.trim()) {
      toast.error('Bowler name is required')
      return
    }

    try {
      await matchAPI.addDelivery(id, formData)
      toast.success('Delivery added successfully')
      setFormData((prev) => ({
        ...prev,
        ball_number: prev.ball_number + 1,
        batsman: '',
        is_wicket: false,
        is_extra: false,
      }))
      await fetchData()
    } catch (error) {
      toast.error('Failed to add delivery')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Match not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/matches" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Matches
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{match.title || `Match #${id}`}</h1>
        </div>

        {scoreboard && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Score</h2>
            <div className="grid grid-cols-2 gap-4">
              {scoreboard.innings?.map((inning, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-700 mb-2">Inning {inning.innings_number}</h3>
                  <div className="text-3xl font-bold text-gray-900">
                    {inning.runs}/{inning.wickets}
                  </div>
                  <div className="text-gray-600 mt-1">
                    Overs: {inning.overs}.{inning.balls}
                  </div>
                  {inning.run_rate && (
                    <div className="text-sm text-gray-500 mt-1">
                      Run Rate: {inning.run_rate}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add Delivery</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Innings Number
                </label>
                <select
                  name="innings_number"
                  value={formData.innings_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Over Number
                </label>
                <input
                  type="number"
                  name="over_number"
                  value={formData.over_number}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ball Number
                </label>
                <input
                  type="number"
                  name="ball_number"
                  value={formData.ball_number}
                  onChange={handleChange}
                  min="1"
                  max="6"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batsman
                </label>
                <input
                  type="text"
                  name="batsman"
                  value={formData.batsman}
                  onChange={handleChange}
                  placeholder="Batsman name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bowler
                </label>
                <input
                  type="text"
                  name="bowler"
                  value={formData.bowler}
                  onChange={handleChange}
                  placeholder="Bowler name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Runs
              </label>
              <select
                name="runs"
                value={formData.runs}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={6}>6</option>
              </select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_wicket"
                  checked={formData.is_wicket}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Is Wicket?
                </label>
              </div>
              {formData.is_wicket && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wicket Type
                  </label>
                  <select
                    name="wicket_type"
                    value={formData.wicket_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bowled">Bowled</option>
                    <option value="caught">Caught</option>
                    <option value="lbw">LBW</option>
                    <option value="run_out">Run Out</option>
                    <option value="stumped">Stumped</option>
                    <option value="hit_wicket">Hit Wicket</option>
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_extra"
                  checked={formData.is_extra}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Is Extra?
                </label>
              </div>
              {formData.is_extra && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extra Type
                  </label>
                  <select
                    name="extra_type"
                    value={formData.extra_type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="wide">Wide</option>
                    <option value="no_ball">No Ball</option>
                    <option value="bye">Bye</option>
                    <option value="leg_bye">Leg Bye</option>
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add Delivery
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
