import React, { createContext, useContext, useState, useEffect } from 'react';
import notificationService from '../services/notificationService';

// Create Authentication Context
const AuthContext = createContext(null);

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = React.useCallback(() => {
    try {
      const token = localStorage.getItem('auth_token');
      const userInfo = localStorage.getItem('user_info');
      const expires = localStorage.getItem('auth_expires');

      if (token && userInfo && expires && Date.now() < parseInt(expires)) {
        const userData = JSON.parse(userInfo);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Clear expired or invalid auth data
        clearAuth();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = (userData, token, expiresIn) => {
    try {
      // Store auth data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_info', JSON.stringify(userData));
      localStorage.setItem('auth_expires', (Date.now() + (expiresIn * 1000)).toString());

      // Update state
      setUser(userData);
      setIsAuthenticated(true);

      // Log activity
      logActivity('login', userData);

      return true;
    } catch (error) {
      console.error('Error during login:', error);
      notificationService.error('Failed to complete login');
      return false;
    }
  };

  const logout = () => {
    try {
      // Log activity before clearing data
      if (user) {
        logActivity('logout', user);
      }

      clearAuth();
      notificationService.info('You have been logged out');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('auth_expires');
    setUser(null);
    setIsAuthenticated(false);
  };

  const logActivity = (action, userData) => {
    try {
      const activityLog = {
        timestamp: new Date().toISOString(),
        userId: userData.nationalId,
        userName: userData.name,
        userRole: userData.role,
        action,
        sessionId: `session_${Date.now()}`,
        userAgent: navigator.userAgent
      };

      const existingLogs = JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');
      existingLogs.push(activityLog);
      
      // Keep only last 1000 logs to prevent localStorage bloat
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }
      
      localStorage.setItem('auth_activity_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const refreshAuth = () => {
    checkAuthStatus();
  };

  const hasRole = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
    hasRole,
    hasAnyRole,
    checkAuthStatus
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;