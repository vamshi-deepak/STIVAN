// Centralized API configuration for frontend to call backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5050';

export const API_ENDPOINTS = {
  // Auth routes (match backend Server.js mounting)
  login: `${API_BASE_URL}/api/auth/login`,
  signup: `${API_BASE_URL}/api/auth/signup`,
  // other endpoints can be added here, for example:
  me: `${API_BASE_URL}/api/users/me`,
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  // include credentials if your backend uses cookies/sessions
  credentials: 'include',
};
