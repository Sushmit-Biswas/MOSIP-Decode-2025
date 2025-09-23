import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft, Eye, EyeOff, Key, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';

const FieldRepresentativeLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    nationalId: '',
    username: '',
    otp: ''
  });
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated as field representative
    if (isAuthenticated && user?.role === 'field_representative') {
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    // Auto-show OTP field when nationalId and username are entered
    if ((e.target.name === 'nationalId' || e.target.name === 'username') && 
        formData.nationalId.trim() && formData.username.trim()) {
      setOtpSent(true);
    }
  };

  const handleSendOtp = async () => {
    if (!formData.nationalId || !formData.username) {
      notificationService.error('Please enter both National ID and Username first');
      return;
    }

    setIsLoading(true);
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      notificationService.success('OTP sent to your registered mobile/email');
    } catch (err) {
      console.error('OTP send error:', err);
      notificationService.error('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.nationalId || !formData.otp) {
      notificationService.error('Please enter both National ID and OTP');
      return;
    }

    setIsLoading(true);
    try {
      // Simple mock authentication for demo
      const validOTPs = ['123456', '000000'];
      
      if (validOTPs.includes(formData.otp)) {
        // Mock auth success
        const authData = {
          success: true,
          user: {
            nationalId: formData.nationalId,
            name: formData.username || 
                  (formData.nationalId === '2304715938' ? 'Priya Sharma' : 
                  formData.nationalId === '1234567890' ? 'Amit Kumar' : 
                  'Field Representative'),
            username: formData.username,
            role: 'field_representative',
            email: 'field@sehat-saathi.org',
            loginTime: new Date().toISOString()
          },
          accessToken: `field_token_${Date.now()}`,
          expiresIn: 3600
        };
        
        // Use AuthContext login method
        const loginSuccess = login(authData.user, authData.accessToken, authData.expiresIn);
        
        if (!loginSuccess) {
          notificationService.error('Failed to complete login');
          return;
        }
        
        notificationService.success(`Welcome, ${authData.user.name}!`);
        navigate('/dashboard');
      } else {
        notificationService.error('Invalid OTP. Use 123456 or 000000 for demo.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      notificationService.error('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
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
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Field Representative Login
            </h1>
            <p className="text-gray-600">
              Authenticate using your National ID and eSignet OTP
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* National ID */}
            <div>
              <label className="form-label">National ID</label>
              <div className="relative">
                <input
                  type="text"
                  name="nationalId"
                  value={formData.nationalId}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your National ID"
                  required
                />
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="form-label">Username</label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input pl-10"
                  placeholder="Enter your full name (e.g., Dr. Sarah Johnson)"
                  required
                />
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
              {isLoading ? 'Authenticating...' : 'Login'}
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
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Development Mode:</strong><br />
                • Use any National ID<br />
                • Use OTP: 123456 or 000000<br />
                • Real eSignet integration available for testing
              </p>
            </div>
          )}

          {/* Help */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Need help? Contact your system administrator
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldRepresentativeLogin;