import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('slotta_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('slotta_token');
      localStorage.removeItem('slotta_master');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// AUTHENTICATION
// =============================================================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  
  // Helper methods
  setToken: (token) => {
    localStorage.setItem('slotta_token', token);
  },
  setMaster: (master) => {
    localStorage.setItem('slotta_master', JSON.stringify(master));
  },
  getToken: () => localStorage.getItem('slotta_token'),
  getMaster: () => {
    const master = localStorage.getItem('slotta_master');
    return master ? JSON.parse(master) : null;
  },
  isAuthenticated: () => !!localStorage.getItem('slotta_token'),
  logout: () => {
    localStorage.removeItem('slotta_token');
    localStorage.removeItem('slotta_master');
    window.location.href = '/login';
  }
};

// =============================================================================
// MASTERS
// =============================================================================

export const mastersAPI = {
  create: (data) => api.post('/masters', data),
  getBySlug: (slug) => api.get(`/masters/${slug}`),
  getById: (id) => api.get(`/masters/id/${id}`),
  update: (id, data) => api.put(`/masters/${id}`, data),
};

// =============================================================================
// SERVICES
// =============================================================================

export const servicesAPI = {
  create: (data) => api.post('/services', data),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
  getById: (id) => api.get(`/services/${id}`),
  getByMaster: (masterId, activeOnly = false) => 
    api.get(`/services/master/${masterId}`, { params: { active_only: activeOnly } }),
};

// =============================================================================
// CLIENTS
// =============================================================================

export const clientsAPI = {
  create: (data) => api.post('/clients', data),
  getById: (id) => api.get(`/clients/${id}`),
  getByEmail: (email) => api.get(`/clients/email/${email}`),
  getByMaster: (masterId) => api.get(`/clients/master/${masterId}`),
};

// =============================================================================
// BOOKINGS
// =============================================================================

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  createWithPayment: (data) => api.post('/bookings/with-payment', data),
  getById: (id) => api.get(`/bookings/${id}`),
  getByMaster: (masterId, status = null) => 
    api.get(`/bookings/master/${masterId}`, { params: { status } }),
  getByClient: (clientId) => api.get(`/bookings/client/${clientId}`),
  getByClientEmail: (email) => api.get(`/bookings/client/email/${email}`),
  complete: (id) => api.put(`/bookings/${id}/complete`),
  noShow: (id) => api.put(`/bookings/${id}/no-show`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
  reschedule: (id, newDate) => api.put(`/bookings/${id}/reschedule`, { new_date: newDate }),
};

// =============================================================================
// MESSAGES
// =============================================================================

export const messagesAPI = {
  sendToClient: (data) => api.post('/messages/send', data),
};

// =============================================================================
// CALENDAR BLOCKS
// =============================================================================

export const calendarAPI = {
  createBlock: (data) => api.post('/calendar/blocks', data),
  getBlocksByMaster: (masterId) => api.get(`/calendar/blocks/master/${masterId}`),
  deleteBlock: (blockId) => api.delete(`/calendar/blocks/${blockId}`),
};

// =============================================================================
// GOOGLE CALENDAR
// =============================================================================

export const googleCalendarAPI = {
  getAuthUrl: () => api.get('/google/auth-url'),
  callback: (code) => api.post('/google/oauth/callback', { code }),
  syncStatus: (masterId) => api.get(`/google/sync-status/${masterId}`),
  disconnect: (masterId) => api.post(`/google/disconnect/${masterId}`),
  syncNow: (masterId) => api.post(`/google/sync/${masterId}`),
  importEvents: (masterId) => api.post(`/google/import-events/${masterId}`),
};

// =============================================================================
// ANALYTICS
// =============================================================================

export const analyticsAPI = {
  getMasterAnalytics: (masterId) => api.get(`/analytics/master/${masterId}`),
};

// =============================================================================
// WALLET / TRANSACTIONS
// =============================================================================

export const walletAPI = {
  getWallet: (masterId) => api.get(`/wallet/master/${masterId}`),
  getTransactions: (masterId, limit = 50, offset = 0) => 
    api.get(`/transactions/master/${masterId}`, { params: { limit, offset } }),
};

// =============================================================================
// HEALTH CHECK
// =============================================================================

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
