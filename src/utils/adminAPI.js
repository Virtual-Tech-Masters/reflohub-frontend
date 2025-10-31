import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'x-admin-subdomain': 'true', // Required for development mode admin access
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const token = adminToken || localStorage.getItem('token'); // prefer admin
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
      console.log('AdminAPI: 401 error, but not redirecting automatically');
      // Don't redirect automatically - let components handle it
    }
    return Promise.reject(error);
  }
);

// Complete Admin/Operator API with correct schema variables
export const adminAPI = {
  // ===== AUTHENTICATION =====
  login: (email, password) => 
    api.post('/operator/auth/login', { email, password }),
  
  changePassword: (email, oldPassword, newPassword) => 
    api.post('/operator/auth/change-password', { email, oldPassword, newPassword }),
  
  resetPassword: (token, password) => 
    api.post('/operator/auth/reset-password', { token, password }),
  
  forgotPassword: (email) => 
    api.post('/operator/auth/forgot', { email }),

  // ===== OPERATOR MANAGEMENT =====
  createOperator: (email, fullName, role) => 
    api.post('/operator/create', { email, fullName, role }),

  // ===== VERIFICATIONS =====
  getPendingFreelancers: (params = {}) => 
    api.get('/operator/verifications/freelancers', { params }),
  
  getPendingBusinesses: (params = {}) => 
    api.get('/operator/verifications/businesses', { params }),
  
  verifyFreelancer: (id, data) => 
    api.post(`/operator/verifications/freelancer/${id}`, data),
  
  verifyBusiness: (id, data) => 
    api.post(`/operator/verifications/business/${id}`, data),
  
  bulkVerifyFreelancers: (list) => 
    api.post('/operator/verifications/freelancers/bulk', { list }),
  
  bulkVerifyBusinesses: (list) => 
    api.post('/operator/verifications/businesses/bulk', { list }),

  // ===== MEDIA/DOCUMENTS =====
  fetchMedia: (userId, mediaType) => 
    api.get(`/media/fetch/${userId}`, { 
      params: { mediaType },
      responseType: 'blob' // Important for file download
    }),

  // ===== BUSINESS MANAGEMENT =====
  searchBusinesses: (params = {}) => 
    api.get('/operator/businesses', { params }),
  
  getBusiness: (id) => 
    api.get(`/operator/businesses/${id}`),
  
  updateBusiness: (id, data) => 
    api.patch(`/operator/businesses/${id}`, data),
  
  softDeleteBusiness: (id, deleteReason) => 
    api.delete(`/operator/businesses/${id}`, { data: { deleteReason } }),
  
  restoreBusiness: (id) => 
    api.post(`/operator/businesses/${id}/restore`),
  
  impersonateBusiness: (id) => 
    api.post(`/operator/businesses/${id}/impersonate`),

  // ===== FREELANCER MANAGEMENT =====
  searchFreelancers: (params = {}) => 
    api.get('/operator/freelancers', { params }),
  
  getFreelancer: (id) => 
    api.get(`/operator/freelancers/${id}`),
  
  updateFreelancer: (id, data) => 
    api.patch(`/operator/freelancers/${id}`, data),
  
  softDeleteFreelancer: (id, deleteReason) => 
    api.delete(`/operator/freelancers/${id}`, { data: { deleteReason } }),
  
  restoreFreelancer: (id) => 
    api.post(`/operator/freelancers/${id}/restore`),
  
  impersonateFreelancer: (id) => 
    api.post(`/operator/freelancers/${id}/impersonate`),

  // ===== LOCATIONS & CATEGORIES =====
  listBusinessLocations: (params = {}) => 
    api.get('/operator/business-locations', { params }),
  
  createBusinessLocation: (data) => 
    api.post('/operator/business-locations', data),
  
  listBusinessCategories: (params = {}) => 
    api.get('/operator/business-categories', { params }),
  
  createBusinessCategory: (data) => 
    api.post('/operator/business-categories', data),
  
  getBusinessCapacity: () => 
    api.get('/operator/business-capacity'),
  
  updateBusinessCapacity: (region, data) => 
    api.patch(`/operator/business-capacity/${region}`, data),
  
  listWaitlist: (params = {}) => 
    api.get('/operator/waitlist', { params }),
  
  createWaitlist: (data) => 
    api.post('/operator/waitlist', data),
  
  deleteWaitlist: (id) => 
    api.delete(`/operator/waitlist/${id}`),

  // ===== COUPONS =====
  listCoupons: (params = {}) => 
    api.get('/operator/coupons', { params }),
  
  createCoupon: (data) => 
    api.post('/operator/coupons', data),
  
  updateCoupon: (id, data) => 
    api.patch(`/operator/coupons/${id}`, data),
  
  listCouponRedemptions: (params = {}) => 
    api.get('/operator/coupon-redemptions', { params }),

  // ===== BUSINESS PLANS & VERSIONS =====
  listBizPlans: (params = {}) => 
    api.get('/operator/biz-plans', { params }),
  
  createBizPlan: (data) => 
    api.post('/operator/biz-plans', data),
  
  listBizPlanVersions: (id, params = {}) => 
    api.get(`/operator/biz-plans/${id}/versions`, { params }),
  
  createBizPlanVersion: (id, data) => 
    api.post(`/operator/biz-plans/${id}/versions`, data),
  
  updateBizPlanVersion: (id, data) => 
    api.patch(`/operator/biz-plan-versions/${id}`, data),

  // ===== FREELANCER PLANS & VERSIONS =====
  listFrPlans: (params = {}) => 
    api.get('/operator/fr-plans', { params }),
  
  createFrPlan: (data) => 
    api.post('/operator/fr-plans', data),
  
  listFrPlanVersions: (id, params = {}) => 
    api.get(`/operator/fr-plans/${id}/versions`, { params }),
  
  createFrPlanVersion: (id, data) => 
    api.post(`/operator/fr-plans/${id}/versions`, data),
  
  updateFrPlanVersion: (id, data) => 
    api.patch(`/operator/fr-plan-versions/${id}`, data),

  // ===== BUSINESS SUBSCRIPTIONS & CYCLES =====
  listBizSubscriptions: (params = {}) => 
    api.get('/operator/biz-subscriptions', { params }),
  
  getBizSubscription: (id) => 
    api.get(`/operator/biz-subscriptions/${id}`),
  
  updateBizSubscription: (id, data) => 
    api.patch(`/operator/biz-subscriptions/${id}`, data),
  
  listBizSubscriptionCycles: (id, params = {}) => 
    api.get(`/operator/biz-subscriptions/${id}/cycles`, { params }),
  
  updateBizCycle: (id, data) => 
    api.patch(`/operator/biz-cycles/${id}`, data),
  
  issueFreeCycles: (id, count) => 
    api.post(`/operator/biz-subscriptions/${id}/issue-free-cycles`, { count }),
  
  toggleVerifiedBadgeAddon: (id) => 
    api.post(`/operator/biz-subscriptions/${id}/toggle-badge`),
  
  cancelBizSubscription: (id, atPeriodEnd = true) => 
    api.post(`/operator/biz-subscriptions/${id}/cancel`, { atPeriodEnd }),

  // ===== FREELANCER SUBSCRIPTIONS & CYCLES =====
  listFrSubscriptions: (params = {}) => 
    api.get('/operator/fr-subscriptions', { params }),
  
  getFrSubscription: (id) => 
    api.get(`/operator/fr-subscriptions/${id}`),
  
  updateFrSubscription: (id, data) => 
    api.patch(`/operator/fr-subscriptions/${id}`, data),
  
  listFrSubscriptionCycles: (id, params = {}) => 
    api.get(`/operator/fr-subscriptions/${id}/cycles`, { params }),
  
  updateFrCycle: (id, data) => 
    api.patch(`/operator/fr-cycles/${id}`, data),

  // ===== LEADS & PAYOUTS =====
  listLeads: (params = {}) => 
    api.get('/operator/leads', { params }),
  
  getLead: (id) => 
    api.get(`/operator/leads/${id}`),
  
  updateLead: (id, data) => 
    api.patch(`/operator/leads/${id}`, data),
  
  listPayouts: (params = {}) => 
    api.get('/operator/payouts', { params }),
  
  updatePayout: (id, data) => 
    api.patch(`/operator/payouts/${id}`, data),

  // ===== INVOICES & PAYMENTS =====
  listInvoices: (params = {}) => 
    api.get('/operator/invoices', { params }),
  
  getInvoice: (id) => 
    api.get(`/operator/invoices/${id}`),
  
  updateInvoice: (id, data) => 
    api.patch(`/operator/invoices/${id}`, data),
  
  listInvoiceLines: (id, params = {}) => 
    api.get(`/operator/invoices/${id}/lines`, { params }),
  
  addInvoiceLine: (id, data) => 
    api.post(`/operator/invoices/${id}/lines`, data),
  
  listPayments: (params = {}) => 
    api.get('/operator/payments', { params }),
  
  getPayment: (id) => 
    api.get(`/operator/payments/${id}`),
  
  updatePayment: (id, data) => 
    api.patch(`/operator/payments/${id}`, data),
  
  refundPayment: (id, amountCents) => 
    api.post(`/operator/payments/${id}/refund`, { amountCents }),

  // ===== EMAIL LOGS, JOBS, WEBHOOKS =====
  listEmailLogs: (params = {}) => 
    api.get('/operator/email-logs', { params }),
  
  sendEmail: (data) => 
    api.post('/operator/email/send', data),
  
  listJobs: (params = {}) => 
    api.get('/operator/jobs', { params }),
  
  triggerJob: (data) => 
    api.post('/operator/jobs/trigger', data),
  
  listProcessedEvents: (params = {}) => 
    api.get('/operator/webhooks/processed-events', { params }),
  
  replayWebhookEvent: (data) => 
    api.post('/operator/webhooks/replay', data),

  // ===== REPORTS =====
  reportRevenue: (params = {}) => 
    api.get('/operator/reports/revenue', { params }),
  
  reportSubscriptions: (params = {}) => 
    api.get('/operator/reports/subscriptions', { params }),
  
  reportLeadsFunnel: (params = {}) => 
    api.get('/operator/reports/leads-funnel', { params }),
  
  reportPayouts: (params = {}) => 
    api.get('/operator/reports/payouts', { params }),
  
  reportCreditUsage: (params = {}) => 
    api.get('/operator/reports/credit-usage', { params }),
};

export default adminAPI;
