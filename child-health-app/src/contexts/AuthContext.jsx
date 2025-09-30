import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/apiService';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import childHealthDB from '../services/indexedDB';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // Will be true until user is verified
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    try {
      await childHealthDB.clearAllData();
      notificationService.info('Local data cleared for security.');
    } catch (dbError) {
      console.error('Error clearing IndexedDB on logout:', dbError);
    }
    notificationService.info('You have been logged out.');
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          // Set the token for the API call
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await api.get('/auth/me');
          setUser(response.data);
          console.log('User verified:', response.data);
        } catch (error) {
          console.error('Token verification failed:', error);
          // Token is invalid, perform a logout
          logout();
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token, logout]);

  const login = async (nationalId, otpOrPassword, role) => {
    try {
      let response;
      if (role === 'admin') {
        response = await api.post('/auth/login/admin', { nationalId, password: otpOrPassword });
      } else {
        response = await api.post('/auth/login/representative', { nationalId, otp: otpOrPassword });
      }
      
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      setToken(newToken);
      setUser(userData); // Set user immediately on login
      notificationService.success(`Welcome, ${userData.name || userData.nationalId}!`);
      return true;
    } catch (error) {
      notificationService.error(error.response?.data?.message || 'Login failed.');
      return false;
    }
  };

  const value = {
    user,
    token,
    loading, // Use this to prevent rendering until user is known
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  // Render children only when not loading, or wrap them in a loading screen
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};