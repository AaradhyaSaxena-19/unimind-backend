import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes timeout for heavy AI processing
});

// Request interceptor to attach Supabase JWT token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('unimind_access_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please check your network or try again.';
    
    if (error.response) {
      const data = error.response.data;
      if (typeof data?.detail === 'string') {
        message = data.detail;
      } else if (Array.isArray(data?.detail)) {
        // FastAPI validation errors (e.g. 422)
        message = data.detail.map((err) => `${err.loc?.join(' -> ') || 'field'}: ${err.msg}`).join(', ');
      } else if (data?.message) {
        message = data.message;
      } else if (error.response.status === 401) {
        message = 'Your session has expired or is invalid. Please log in again.';
      } else if (error.response.status === 403) {
        message = 'Access denied. You do not have permission for this action.';
      } else if (error.response.status === 429) {
        message = 'Too many requests. Please slow down and wait a minute.';
      } else if (error.response.status === 502) {
        message = 'The AI service could not process this paper. Please check the PDF format and try again.';
      }
    } else if (error.request) {
      const target = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'the API server');
      message = 'Could not reach backend service at ' + target + '. Ensure the API server is running.';
    }

    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.originalError = error;
    return Promise.reject(enhancedError);
  }
);

export default api;
