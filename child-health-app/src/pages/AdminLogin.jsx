import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Eye, EyeOff, Key, Phone } from 'lucide-react';
import notificationService from '../services/notificationService';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nationalId: '',
    otp: ''
  });
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('auth_token');
    const userInfo = localStorage.getItem('user_info');
    const expires = localStorage.getItem('auth_expires');
    
    if (token && userInfo && expires && Date.now() < parseInt(expires)) {
      const user = JSON.parse(userInfo);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Auto-show OTP field when nationalId is entered
    if (e.target.name === 'nationalId' && e.target.value.trim()) {
      setOtpSent(true);
    }
  };
    e.preventDefault();

    if (!formData.nationalId || !formData.otp) {
      notificationService.error('Please enter both National ID and OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Simple mock authentication for demo
      const adminAccounts = ['ADMIN001', 'ADMIN123', 'admin'];
      
      if (adminAccounts.includes(formData.nationalId.toUpperCase()) && 
          (formData.otp === '123456' || formData.otp === '000000')) {
        
        // Mock auth success
        const authData = {
          success: true,
          user: {
            nationalId: formData.nationalId,
            name: formData.nationalId === 'ADMIN001' ? 'Dr. Sarah Johnson' : 
                  formData.nationalId === 'ADMIN123' ? 'Dr. Rajesh Patel' : 
                  'System Administrator',
            role: 'admin',
            email: 'admin@sehat-saathi.org',
            loginTime: new Date().toISOString()
          },
          accessToken: `admin_token_${Date.now()}`,
          expiresIn: 3600
        };
        
        // Store auth data
        localStorage.setItem('auth_token', authData.accessToken);
        localStorage.setItem('user_info', JSON.stringify(authData.user));
        localStorage.setItem('auth_expires', (Date.now() + (authData.expiresIn * 1000)).toString());
        
        // Log activity
        const activityLog = {
          timestamp: new Date().toISOString(),
          userId: authData.user.nationalId,
          userName: authData.user.name,
          userRole: authData.user.role,
          action: 'login',
          sessionId: `session_${Date.now()}`,
          userAgent: navigator.userAgent
        };
        
        const existingLogs = JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');
        existingLogs.push(activityLog);
        localStorage.setItem('auth_activity_logs', JSON.stringify(existingLogs));
        
        notificationService.success(`Welcome, ${authData.user.name}!`);
        navigate('/admin/dashboard');
      } else {
        notificationService.error('Invalid credentials. Use ADMIN001/ADMIN123/admin with OTP 123456 for demo.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      notificationService.error('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Administrator Login
            </h1>
            <p className="text-gray-600">
              Access admin dashboard with eSignet authentication
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* National ID */}
            <div>
              <label className="form-label">Admin National ID</label>
              <div className="relative">
                <input
                  type="text"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your Admin National ID"
                  required
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Send OTP Button */}
            {!otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading || !formData.nationalId}
                className="w-full btn-secondary flex items-center justify-center space-x-2"
              >
                <Phone className="h-4 w-4" />
                <span>{isLoading ? 'Sending OTP...' : 'Send OTP'}</span>
              </button>
            )}

            {/* OTP Input */}
            {otpSent && (
              <div>
                <label className="form-label">One-Time Password</label>
                <div className="relative">
                  <input
                    type={showOtp ? 'text' : 'password'}
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="form-input pr-10"
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOtp ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  OTP sent to your registered mobile/email
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || !formData.nationalId || !formData.otp}
              className="w-full btn-primary disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Access Admin Dashboard'}
            </button>

            {/* Resend OTP */}
            {otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Resend OTP
              </button>
            )}
          </form>

          {/* Development Info */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Development Mode (Admin):</strong><br />
                • Use Admin ID: ADMIN001, ADMIN123, or admin<br />
                • Use OTP: 123456 or 000000<br />
                • Real eSignet integration available for testing
              </p>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Security Notice:</strong> Admin access requires authorized credentials. 
              All login attempts are monitored and logged.
            </p>
          </div>

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;