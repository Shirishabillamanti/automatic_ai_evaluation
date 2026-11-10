import axios from 'axios';

/**
 * Axios instance configured for future FastAPI backend integration.
 * Base URL defaults to localhost:8000 (FastAPI standard), or can be overridden via VITE_API_BASE_URL.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT token to headers if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smarteval_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unified error messages & 401 unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or unauthorized
      localStorage.removeItem('smarteval_token');
      localStorage.removeItem('smarteval_user');
    }
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

/**
 * Authentication service endpoints mapped to future FastAPI routes.
 */
export const authService = {
  /**
   * Login user with credentials
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    return api.post('/auth/login', credentials);
  },

  /**
   * Register new user (Teacher/Admin or Student)
   * @param {Object} userData - { fullName, email, username, password, role }
   */
  async register(userData) {
    return api.post('/auth/register', userData);
  },

  /**
   * Send password reset instructions to email
   * @param {Object} data - { email }
   */
  async forgotPassword(data) {
    return api.post('/auth/forgot-password', data);
  },

  /**
   * Fetch current authenticated user profile
   */
  async getCurrentUser() {
    return api.get('/auth/me');
  },
};

export default api;
