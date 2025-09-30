import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor for error handling, e.g., redirect on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., logout the user
      console.error('Unauthorized access - logging out');
      localStorage.removeItem('token');
      // Optionally, redirect to login page
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

// Add new API calls here
export default {
  // For authentication
  loginRepresentative: (nationalId, otp) => api.post('/auth/login/representative', { nationalId, otp }),
  loginAdmin: (nationalId, password) => api.post('/auth/login/admin', { nationalId, password }),
  getMe: () => api.get('/auth/me'),

  // For child records (admin & representative)
  getChildRecords: () => api.get('/children'),
  getChildRecordById: (id) => api.get(`/children/${id}`),
  // createChildRecord: (record) => api.post('/children', record), // This route is not used directly by client form, but by batch sync if needed.

  // For syncing records from IndexedDB to server (called by syncService)
  // This method will handle uploading a batch of records.
  uploadRecordsBatch: async (records) => {
    try {
      const response = await api.post('/children/batch', { records }); // New batch endpoint
      return { success: true, data: response.data };
    } catch (error) {
      console.error('API Service: Error uploading records batch', error.response?.data || error.message);
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // For admin stats
  getAdminStats: () => api.get('/children/stats'),

  // Generic request for other needs
  request: (method, url, data = {}) => api.request({ method, url, data }),
};