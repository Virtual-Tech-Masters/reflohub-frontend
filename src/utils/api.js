import axios from 'axios';
import { adminAPI } from './adminAPI.js';

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
    // Normalize error responses for better handling
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Provide user-friendly error messages based on status code
      if (status === 401) {
        error.userMessage = 'Your session has expired. Please log in again.';
      } else if (status === 403) {
        error.userMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        error.userMessage = 'The requested resource was not found.';
      } else if (status === 429) {
        error.userMessage = 'Too many requests. Please try again later.';
      } else if (status >= 500) {
        error.userMessage = 'A server error occurred. Please try again later.';
      } else {
        error.userMessage = data?.message || data?.error || 'An error occurred. Please try again.';
      }
    } else if (error.request) {
      // Request made but no response received
      error.userMessage = 'Network error. Please check your connection and try again.';
    } else {
      // Something else happened
      error.userMessage = 'An unexpected error occurred. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  
  register: (role, data) => {
    const endpoint = role.toLowerCase() === 'freelancer' ? '/freelancer/register' : '/business/register';
    return api.post(endpoint, data);
  },
  
  forgotPassword: (role, email) => 
    api.post('/auth/forgot', { role, email }),
  
  resetPassword: (role, token, password) => 
    api.post('/auth/reset', { role, token, password }),
  
  refreshToken: (refreshToken) => 
    api.post('/auth/refresh', { refreshToken }),
  
  getBusinessCategories: () => 
    api.get('/common/business/categories'),
  
  sendEmailVerification: (role, userId, email, regAuthToken) => 
    api.post('/auth/send-email-verification', { role, userId, email, regAuthToken }),
  
  verifyEmail: (role, userId, token) => 
    api.post(`/auth/verify-email?role=${role}&userId=${userId}&token=${token}`),
  
  updateEmail: (role, userId, email, regAuthToken) => {
    return api.post('/auth/update-email', { role, userId, email, regAuthToken });
  },
  
  getUserStatus: (role, userId, regAuthToken) => 
    api.get('/auth/user-status', { params: { role, userId, regAuthToken } }),
};

// Business API
export const commonAPI = {
  // Business subscription plans
  getBusinessSubscriptionPlans: (region = 'GLOBAL') => 
    api.get('/common/business/subscription-plans', { params: { region } }),
  
  // Business categories and locations
  getBusinessCategories: () => 
    api.get('/common/business/categories'),
  
  getBusinessLocations: () => 
    api.get('/common/business/locations'),
  
  // Freelancer subscription plans
  getFreelancerSubscriptionPlans: () => 
    api.get('/common/freelancer/subscription-plans'),
  
  getFreelancerCreditPacks: () => 
    api.get('/common/freelancer/credit-packs'),
  
  // Locations
  getCountries: () => 
    api.get('/common/countries'),
  
  getStates: (countryId) => 
    api.get(`/common/states/${countryId}`),
  
  getCities: (stateId) => 
    api.get(`/common/cities/${stateId}`),
};

export const businessAPI = {
  // Registration
  register: (data) => 
    api.post('/business/register', data),
  
  // Profile
  getProfile: () => 
    api.get('/business/me'),
  
  me: () => 
    api.get('/business/me'),
  
  updateProfile: (data) => 
    api.patch('/business/profile/update', data),
  
  // Billing
  getBillingSummary: () => 
    api.get('/business/billing'),
  
  cancelSubscription: (atPeriodEnd = true) => 
    api.post('/business/subscription/cancel', { atPeriodEnd }),
  
  cancelVerifiedBadge: (atPeriodEnd = true) => 
    api.post('/business/subscription/addons/verified-badge/cancel', { atPeriodEnd }),
  
  // Subscription
  getSubscription: () => 
    api.get('/business/subscription'),
  
  previewSubscription: (data) => 
    api.post('/business/subscription/preview', data),
  
  createCheckoutSession: (data) => 
    api.post('/business/subscription/checkout', data),
  
  startSubscription: (data) => 
    api.post('/business/subscription/start', data),
  
  cancelSubscription: (atPeriodEnd = true) => 
    api.post('/business/subscription/cancel', { atPeriodEnd }),
  
  // Leads
  listLeads: (params = {}) => 
    api.get('/business/leads', { params }),
  
  getLead: (leadId) => 
    api.get(`/business/leads/${leadId}`),
  
  approveLead: (leadId, note) => 
    api.post(`/business/leads/${leadId}/approve`, { note }),
  
  rejectLead: (leadId, reason) => 
    api.post(`/business/leads/${leadId}/reject`, { reason }),
  
  proposeCommission: (leadId, data) => 
    api.post(`/business/leads/${leadId}/propose-commission`, data),
  
  convertLead: (leadId, data) => 
    api.post(`/business/leads/${leadId}/convert`, data),
  
  // Payouts
  createPayout: (leadId, data) => 
    api.post(`/business/leads/${leadId}/payouts`, data),
  
  listPayouts: (params = {}) => 
    api.get('/business/payouts', { params }),
  
  // Dashboard
  getDashboard: (params = {}) => 
    api.get('/business/dashboard', { params }),
  
  // Availability
  checkAvailability: (params) => 
    api.get('/business/slots/availability', { params }),
  
  joinWaitlist: (data) => 
    api.post('/business/waitlist', data),
  
  // Chat with freelancers
  listChatMessages: (freelancerId, params = {}) =>
    api.get(`/business/chat/freelancers/${freelancerId}/messages`, { params }),
  
  // Helper to get WebSocket URL for chat
  getChatWebSocketUrl: (freelancerId) => {
    const token = localStorage.getItem('token');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // VITE_API_URL is like 'http://localhost:5000/api', so we remove 'http://' or 'https://' and '/api' suffix
    let baseUrl = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') || 'localhost:5000/api';
    // Remove trailing /api if it exists (since we'll add it back)
    baseUrl = baseUrl.replace(/\/api$/, '');
    // If no port specified, assume 5000
    if (!baseUrl.includes(':') && baseUrl === 'localhost') {
      baseUrl = 'localhost:5000';
    }
    return `${wsProtocol}//${baseUrl}/api/business/chat/freelancers/${freelancerId}/ws${token ? `?token=${token}` : ''}`;
  },
};

// Business directory API (for freelancers)
export const businessDirectoryAPI = {
  listBusinesses: (params = {}) => 
    api.get('/freelancer/businesses', { params }),
  
  getBusiness: (businessId) => 
    api.get(`/freelancer/businesses/${businessId}`),
};

// Freelancer API
export const freelancerAPI = {
  // Registration
  register: (data) => 
    api.post('/freelancer/register', data),
  
  // Profile
  getProfile: () => 
    api.get('/freelancer/me'),
  
  updateProfile: (data) => 
    api.put('/freelancer/me', data),
  
  // Leads
  submitLead: (data) => 
    api.post('/freelancer/submit-lead', data),
  
  listLeads: (params = {}) => 
    api.get('/freelancer/leads', { params }),
  
  getLead: (leadId) => 
    api.get(`/freelancer/leads/${leadId}`),
  
  acknowledgeCommission: (leadId) => 
    api.patch(`/freelancer/leads/${leadId}/ack-commission`),
  
  // Credits
  listCreditPacks: () => 
    api.get('/freelancer/credit-packs'),
  
  purchaseCredits: (packKey) => 
    api.post('/freelancer/credits/purchase', { packKey }),
  
  // Subscription
  previewSubscription: (planName) => 
    api.get('/freelancer/subscription/preview', { params: { planName } }),
  
  startSubscription: (data) => 
    api.post('/freelancer/subscription/start', data),
  
  cancelSubscription: () => 
    api.post('/freelancer/subscription/cancel'),
  
  renewSubscription: () => 
    api.post('/freelancer/subscription/renew'),
  
  // Get businesses freelancer has submitted leads to (for chat list)
  getBusinesses: () =>
    api.get('/freelancer/businesses'),
  
  // Dashboard
  getDashboard: (params = {}) => 
    api.get('/freelancer/dashboard', { params }),
  
  // Chat with businesses
  getChatBusinesses: () =>
    api.get('/freelancer/chat/businesses'),
  
  listChatMessages: (businessId, params = {}) =>
    api.get(`/freelancer/chat/businesses/${businessId}/messages`, { params }),
  
  // Helper to get WebSocket URL for chat
  getChatWebSocketUrl: (businessId) => {
    const token = localStorage.getItem('token');
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // VITE_API_URL is like 'http://localhost:5000/api', so we remove 'http://' or 'https://' and '/api' suffix
    let baseUrl = import.meta.env.VITE_API_URL?.replace(/^https?:\/\//, '') || 'localhost:5000/api';
    // Remove trailing /api if it exists (since we'll add it back)
    baseUrl = baseUrl.replace(/\/api$/, '');
    // If no port specified, assume 5000
    if (!baseUrl.includes(':') && baseUrl === 'localhost') {
      baseUrl = 'localhost:5000';
    }
    return `${wsProtocol}//${baseUrl}/api/freelancer/chat/businesses/${businessId}/ws${token ? `?token=${token}` : ''}`;
  },
};

// Media API
export const mediaAPI = {
  uploadMedia: (formData, config = {}) => 
    api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file uploads
      ...config,
    }),
  
  fetchMedia: (mediaType) => 
    api.get('/media/fetch', { params: { mediaType } }),
};

// Export adminAPI
export { adminAPI };

export default api;
