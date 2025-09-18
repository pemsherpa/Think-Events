const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) errorMessage = errorData.message;
    } catch (_) {}

    // Handle auth errors globally
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        // Redirect to login non-interactively
        window.location.href = '/login?reason=expired';
      }
    }

    throw new Error(errorMessage);
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
  
  forgotPassword: (email) => apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  }),
  
  resetPassword: (token, newPassword) => apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  }),
  
  getProfile: () => apiRequest('/api/auth/profile'),
  
  updateProfile: (profileData) => {
    console.log('API: Updating profile with data:', profileData);
    return apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  
  logout: () => apiRequest('/api/auth/logout', {
    method: 'POST',
  }),
  
  deleteAccount: () => apiRequest('/api/auth/account', {
    method: 'DELETE',
  }),
};

// Events APIs
export const eventsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/api/events${queryString ? `?${queryString}` : ''}`);
  },
  update: (id, jsonBody) => apiRequest(`/api/events/${id}`, {
    method: 'PUT',
    body: JSON.stringify(jsonBody),
  }),
  create: (eventData) => apiRequest('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  }),
  delete: (id) => apiRequest(`/api/events/${id}`, { method: 'DELETE' }),
  getMine: () => apiRequest('/api/events/me/list'),
  
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

// Seat Layout APIs
export const seatLayoutAPI = {
  getCategories: () => apiRequest('/api/seat-layout/categories'),
  
  createCategory: (categoryData) => apiRequest('/api/seat-layout/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  }),
  
  getLayout: (eventId) => apiRequest(`/api/seat-layout/event/${eventId}`),
  
  getAvailableSeats: (eventId) => apiRequest(`/api/seat-layout/event/${eventId}/available`),
  
  createLayout: (eventId, layoutData) => apiRequest(`/api/seat-layout/event/${eventId}`, {
    method: 'POST',
    body: JSON.stringify(layoutData),
  }),
  
  updateLayout: (layoutId, layoutData) => apiRequest(`/api/seat-layout/layout/${layoutId}`, {
    method: 'PUT',
    body: JSON.stringify(layoutData),
  }),
  
  deleteLayout: (layoutId) => apiRequest(`/api/seat-layout/layout/${layoutId}`, {
    method: 'DELETE',
  }),
  
  bookSeats: (eventId, seatSelections) => apiRequest(`/api/seat-layout/event/${eventId}/book`, {
    method: 'POST',
    body: JSON.stringify({ seatSelections }),
  }),
};

// Health check
export const healthCheck = () => apiRequest('/health');

export default {
  auth: authAPI,
  events: eventsAPI,
  bookings: bookingsAPI,
  health: healthCheck,
};
