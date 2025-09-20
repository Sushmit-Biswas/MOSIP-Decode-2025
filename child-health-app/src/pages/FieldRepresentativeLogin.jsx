import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Users, ArrowLeft, Eye, EyeOff, Key, Phone } from 'lucide-react';
import eSignetService from '../services/eSignetService';
import notificationService from '../services/notificationService';

const FieldRepresentativeLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nationalId: '',
    otp: ''
  });
  const [showOtp, setShowOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [transactionId, setTransactionId] = useState(null);

  useEffect(() => {
    // Check if already authenticated
    if (eSignetService.isAuthenticated()) {
      const authData = eSignetService.getStoredAuthData();
      if (authData.user.role === 'field_representative') {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleSendOtp = async () => {
    if (!formData.nationalId) {
      notificationService.error('Please enter your National ID');
      return;
    }

    setIsLoading(true);
    try {
      // Initialize OAuth transaction
      const initResult = await eSignetService.initializeOAuthTransaction('field_representative');
      
      if (!initResult.success) {
        notificationService.error(initResult.error);
        return;
      }

      setTransactionId(initResult.transactionId);

      // Send OTP
      const otpResult = await eSignetService.sendOTP(initResult.transactionId, formData.nationalId);
      
      if (otpResult.success) {
        setOtpSent(true);
        notificationService.success('OTP sent to your registered mobile/email');
        
        // In development, show test OTP
        if (import.meta.env.DEV) {
          notificationService.info('Development: Use OTP 123456 for testing');
        }
      } else {
        notificationService.error(otpResult.error);
      }
    } catch (err) {
      console.error('Send OTP error:', err);
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
      let result;
      
      if (transactionId) {
        // Use existing transaction for real eSignet flow
        result = await eSignetService.completeAuthentication(
          formData.nationalId, 
          formData.otp, 
          'field_representative'
        );
      } else {
        // Fallback for development/testing
        if (formData.otp === '123456' || formData.otp === '000000') {
          result = {
            success: true,
            user: {
              nationalId: formData.nationalId,
              name: 'Field Representative',
              role: 'field_representative'
            },
            accessToken: 'mock_token_' + Date.now()
          };
          
          // Store mock auth data
          eSignetService.storeAuthData({
            accessToken: result.accessToken,
            user: result.user,
            expiresIn: 3600
          });
        } else {
          result = {
            success: false,
            error: 'Invalid OTP. Use 123456 for testing.'
          };
        }
      }

      if (result.success) {
        notificationService.success(`Welcome, ${result.user.name}!`);
        navigate('/dashboard');
      } else {
        notificationService.error(result.error);
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