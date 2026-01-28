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
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  getByMaster: (masterId, activeOnly = true) => 
    api.get(`/services/master/${masterId}`, { params: { active_only: activeOnly } }),
  getById: (id) => api.get(`/services/${id}`),
  update: (id, data) => api.put(`/services/${id}`, data),
  delete: (id) => api.delete(`/services/${id}`),
};

// =============================================================================
// CLIENTS
// =============================================================================

export const clientsAPI = {
  create: (data) => api.post('/clients', data),
  getById: (id) => api.get(`/clients/${id}`),
  getByEmail: (email) => api.get(`/clients/email/${email}`),
};

// =============================================================================
// BOOKINGS
// =============================================================================

export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getById: (id) => api.get(`/bookings/${id}`),
  getByMaster: (masterId, status = null) => 
    api.get(`/bookings/master/${masterId}`, { params: { status } }),
  getByClient: (clientId) => api.get(`/bookings/client/${clientId}`),
  complete: (id) => api.put(`/bookings/${id}/complete`),
  noShow: (id) => api.put(`/bookings/${id}/no-show`),
  update: (id, data) => api.put(`/bookings/${id}`, data),
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
// ANALYTICS
// =============================================================================

export const analyticsAPI = {
  getMasterAnalytics: (masterId) => api.get(`/analytics/master/${masterId}`),
};

// =============================================================================
// HEALTH CHECK
// =============================================================================

export const healthAPI = {
  check: () => api.get('/health'),
};

export default api;
