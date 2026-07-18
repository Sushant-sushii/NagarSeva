import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Configure axios instance with base URL and CORS
const api = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
  withCredentials: true, // Include cookies in requests for CORS
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/profile');
      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.log('User not authenticated');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/login', {
        email,
        password,
      });

      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Store token in localStorage if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        return response.data;
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // FIX: Accept the userData object directly so all fields map accurately to the request body
  const signup = async (userData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Spreading or passing the object directly assigns properties to req.body root level
      const response = await api.post('/register', userData);

      if (response.data && response.data.user) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Store token in localStorage if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
        }
        return response.data;
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Sign up failed. Please try again.';
      setError(errorMessage);
      setIsAuthenticated(false);
      setUser(null);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await api.post('/logout');
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};