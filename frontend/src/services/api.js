import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

export const snippetsAPI = {
  getSnippets: (params) => api.get('/snippets', { params }),
  getMySnippets: (params) => api.get('/snippets/my', { params }),
  getSnippet: (id) => api.get(`/snippets/${id}`),
  createSnippet: (snippetData) => api.post('/snippets', snippetData),
  updateSnippet: (id, snippetData) => api.put(`/snippets/${id}`, snippetData),
  deleteSnippet: (id) => api.delete(`/snippets/${id}`),
  forkSnippet: (id) => api.post(`/snippets/${id}/fork`),
  likeSnippet: (id) => api.post(`/snippets/${id}/like`),
  getLanguages: () => api.get('/snippets/languages/list'),
  getTags: () => api.get('/snippets/tags/list'),
};

export const usersAPI = {
  getUserProfile: (username, params) => api.get(`/users/profile/${username}`, { params }),
  searchUsers: (params) => api.get('/users/search', { params }),
  getUserStats: (userId) => api.get(`/users/stats/${userId}`),
  getLikedSnippets: (params) => api.get('/users/liked-snippets', { params }),
};

export default api;
