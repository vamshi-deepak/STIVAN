// Centralized API configuration for frontend to call backend
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5051';

export const API_ENDPOINTS = {
  // Auth routes (match backend Server.js mounting)
  login: `${API_BASE_URL}/api/auth/login`,
  signup: `${API_BASE_URL}/api/auth/signup`,
  me: `${API_BASE_URL}/api/auth/me`,
  requestOtp: `${API_BASE_URL}/api/auth/request-otp`,
  verifyOtp: `${API_BASE_URL}/api/auth/verify-otp`,
  resetPassword: `${API_BASE_URL}/api/auth/reset-password`,
  changePassword: `${API_BASE_URL}/api/auth/me/password`,

  // Idea routes (match backend ideaRoutes.js)
  evaluate: `${API_BASE_URL}/api/ideas/evaluate`, // <-- ADDED THIS LINE
  ideas: `${API_BASE_URL}/api/ideas`,             // <-- Also added for the History page
  chat: `${API_BASE_URL}/api/chat`,
  ideasClear: `${API_BASE_URL}/api/ideas/clear`,
  chatClear: `${API_BASE_URL}/api/chat/clear`,
  chatHistory: `${API_BASE_URL}/api/chat/history`,
  // Community
  communityFeed: `${API_BASE_URL}/api/community/feed`,
  communityPosts: `${API_BASE_URL}/api/community/posts`,
  communityLike: (postId) => `${API_BASE_URL}/api/community/posts/${postId}/like`,
  communityComments: (postId) => `${API_BASE_URL}/api/community/posts/${postId}/comments`,
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  // include credentials if your backend uses cookies/sessions
  credentials: 'include',
};