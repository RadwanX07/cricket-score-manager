import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });
        localStorage.setItem('access_token', data.access);
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
};

export const playerAPI = {
  getAll: () => api.get('/players/'),
  getMyProfile: () => api.get('/players/me/'),
  updateProfile: (id, data) => api.put(`/players/${id}/`, data),
  getLeaderboard: () => api.get('/players/leaderboard/'),
};

export const matchAPI = {
  getAll: (params) => api.get('/matches/', { params }),
  getById: (id) => api.get(`/matches/${id}/`),
  create: (data) => api.post('/matches/', data),
  updateScore: (id, data) => api.post(`/matches/${id}/update_score/`, data),
  addDelivery: (id, data) => api.post(`/matches/${id}/add_delivery/`, data),
  getScoreboard: (id) => api.get(`/matches/${id}/scoreboard/`),
  exportCSV: (id) => api.get(`/matches/${id}/export_csv/`, { responseType: 'blob' }),
};

export const tournamentAPI = {
  getAll: () => api.get('/tournaments/'),
  getById: (id) => api.get(`/tournaments/${id}/`),
  create: (data) => api.post('/tournaments/', data),
  update: (id, data) => api.put(`/tournaments/${id}/`, data),
  delete: (id) => api.delete(`/tournaments/${id}/`),
};

export const teamAPI = {
  getAll: () => api.get('/teams/'),
  getById: (id) => api.get(`/teams/${id}/`),
  create: (data) => api.post('/teams/', data),
  addPlayer: (id, data) => api.post(`/teams/${id}/add_player/`, data),
  removePlayer: (id, data) => api.post(`/teams/${id}/remove_player/`, data),
};

export default api;
