// Frontend/src/api/authAPI.js
// API client for authentication endpoints

const API_BASE_URL = 'http://localhost:3000/api/auth';

/**
 * Make API requests with error handling
 * Includes credentials: 'include' to automatically send/receive cookies
 */
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      credentials: 'include', // Send and receive cookies with every request
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Register a new user
 * Cookie will be automatically set and persisted by browser
 */
export const registerUser = async (userData) => {
  return apiCall('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
};

/**
 * Login user
 * HTTP-only cookie will be automatically set and persisted by browser
 */
export const loginUser = async (email, password) => {
  return apiCall('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Get user profile
 * Uses cookie-based authentication (no need to pass token)
 */
export const getUserProfile = async () => {
  return apiCall('/profile', {
    method: 'GET',
  });
};

/**
 * Update user profile
 * Uses cookie-based authentication (no need to pass token)
 */
export const updateUserProfile = async (userData) => {
  return apiCall('/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  });
};

/**
 * Logout user
 * Clears authToken cookie on server side
 */
export const logoutUser = async () => {
  return apiCall('/logout', {
    method: 'POST',
  });
};

/**
 * Store token in localStorage (kept for backward compatibility)
 * Note: With HTTP-only cookies, the token is not accessible from JavaScript
 * This function is retained for cases where the token is returned in API response
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  }
};

/**
 * Get token from localStorage (kept for backward compatibility)
 * Note: With HTTP-only cookies, authentication is handled automatically via cookies
 */
export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

/**
 * Remove token from localStorage (kept for backward compatibility)
 */
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

/**
 * Check if user is authenticated
 * With HTTP-only cookies, the server handles authentication verification
 * Frontend can use this for UI state management if needed
 */
export const isAuthenticated = () => {
  return !!getAuthToken();
};
