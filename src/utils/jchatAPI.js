import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized access to jchat API');
    }
    return Promise.reject(error);
  }
);

export const jchatAPI = {
  // Get all chats for current user
  getChats: () => api.get('/jchat/chats'),

  // Get or create a chat with a recipient
  createChat: (data) => api.post('/jchat/chats/create', data),

  // Get a specific chat with messages
  getChat: (chatId) => api.get(`/jchat/chats/${chatId}`),

  // Send a message
  sendMessage: (data) => api.post('/jchat/messages', data),

  // Mark messages as read
  markAsRead: (chatId) => api.post(`/jchat/chats/${chatId}/read`),
};

