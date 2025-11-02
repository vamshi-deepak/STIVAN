// Centralized API configuration for frontend to call backend
// NOTE: The backend server defaults to PORT 5050 (can be overridden in .env)
// Use REACT_APP_API_BASE_URL to override in development. Default to 5050 to match backend default.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5050';

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
  evaluate: `${API_BASE_URL}/api/ideas/evaluate`,
  ideas: `${API_BASE_URL}/api/ideas`,
  ideaById: (id) => `${API_BASE_URL}/api/ideas/${id}`,
  reEvaluateIdea: (id) => `${API_BASE_URL}/api/ideas/${id}/re-evaluate`,
  deleteIdea: (id) => `${API_BASE_URL}/api/ideas/${id}`,
  IDEAS: {
    GET_USER_IDEAS: `${API_BASE_URL}/api/ideas`,
    DELETE: `${API_BASE_URL}/api/ideas`,
    CLEAR: `${API_BASE_URL}/api/ideas/clear`,
  },

  // Vision routes (NEW - STIVAN Analyst Zero with real-world market intelligence)
  visionEvaluate: `${API_BASE_URL}/api/vision/evaluate`,
  visionAnalysis: (id) => `${API_BASE_URL}/api/vision/analysis/${id}`,
  visionAnalyses: `${API_BASE_URL}/api/vision/analyses`,
  
  // Chat routes
  CHAT: `${API_BASE_URL}/api/chat`,
  CHAT_CLEAR: `${API_BASE_URL}/api/chat/clear`,
  CHAT_HISTORY: `${API_BASE_URL}/api/chat/history`,
  chat: `${API_BASE_URL}/api/chat`,
  ideasClear: `${API_BASE_URL}/api/ideas/clear`,
  chatClear: `${API_BASE_URL}/api/chat/clear`,
  chatHistory: `${API_BASE_URL}/api/chat/history`,
  CHAT: {
    SEND: `${API_BASE_URL}/api/chat`,
    HISTORY: `${API_BASE_URL}/api/chat/history`,
    CLEAR: `${API_BASE_URL}/api/chat/clear`,
    GET_THREADS: `${API_BASE_URL}/api/chat/history`,
  },

  // Community routes
  communityFeed: `${API_BASE_URL}/api/community/feed`,
  communityPosts: `${API_BASE_URL}/api/community/posts`,
  communityActiveMembers: `${API_BASE_URL}/api/community/active-members`,
  communityComments: (postId) => `${API_BASE_URL}/api/community/posts/${postId}/comments`,
  communityLike: (postId) => `${API_BASE_URL}/api/community/posts/${postId}/like`,
  
  // User routes
  userData: `${API_BASE_URL}/api/users/data`,
  userContent: `${API_BASE_URL}/api/users/content`,
  deleteUserContent: (id) => `${API_BASE_URL}/api/users/content/${id}`,
  userPrivateData: (userId) => `${API_BASE_URL}/api/users/${userId}/private-data`,
  userSettings: (userId) => `${API_BASE_URL}/api/users/${userId}/settings`,
  
  // Admin routes
  adminUsers: `${API_BASE_URL}/api/admin/users`,
  adminUserById: (userId) => `${API_BASE_URL}/api/admin/users/${userId}`,
  adminUserRole: (userId) => `${API_BASE_URL}/api/admin/users/${userId}/role`,
  adminUserStatus: (userId) => `${API_BASE_URL}/api/admin/users/${userId}/status`,
  deleteUser: (userId) => `${API_BASE_URL}/api/admin/users/${userId}`,
  
  // Health check
  health: `${API_BASE_URL}/api/health`,
};

export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  // include credentials if your backend uses cookies/sessions
  credentials: 'include',
};