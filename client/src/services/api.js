import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const normalizedBaseUrl = String(rawBaseUrl).trim().replace(/\/+$/, '');

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach JWT bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('krishisetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on protected route, clean up token
      if (window.location.pathname.startsWith('/portal')) {
        localStorage.removeItem('krishisetu_token');
        localStorage.removeItem('krishisetu_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
