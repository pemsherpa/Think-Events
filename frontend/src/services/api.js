const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  signup: (userData) => apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  login: (credentials) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  googleAuth: (idToken) => apiRequest('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  }),
  
  getProfile: () => apiRequest('/api/auth/profile'),
  
  updateProfile: (profileData) => apiRequest('/api/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),
  
  logout: () => apiRequest('/api/auth/logout', {
    method: 'POST',
  }),
};

// Events APIs
export const eventsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/events${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/api/events/${id}`),
  
  getCategories: () => apiRequest('/api/events/categories'),
  
  getVenues: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/events/venues${queryString ? `?${queryString}` : ''}`);
  },
  
  getVenueById: (id) => apiRequest(`/api/events/venues/${id}`),
};

// Bookings APIs
export const bookingsAPI = {
  create: (bookingData) => apiRequest('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  }),
  
  getUserBookings: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/bookings${queryString ? `?${queryString}` : ''}`);
  },
  
  getById: (id) => apiRequest(`/api/bookings/${id}`),
  
  updateStatus: (id, statusData) => apiRequest(`/api/bookings/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify(statusData),
  }),
  
  cancel: (id) => apiRequest(`/api/bookings/${id}`, {
    method: 'DELETE',
  }),
  
  getAvailableSeats: (eventId) => apiRequest(`/api/bookings/seats/${eventId}`),
  
  getStats: () => apiRequest('/api/bookings/stats/summary'),
};

// Health check
export const healthCheck = () => apiRequest('/health');

export default {
  auth: authAPI,
  events: eventsAPI,
  bookings: bookingsAPI,
  health: healthCheck,
};
