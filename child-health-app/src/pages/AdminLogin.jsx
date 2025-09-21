import React, { useState, useEffect } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { Shield, ArrowLeft, Eye, EyeOff, Key } from 'lucide-react';

import notificationService from '../services/notificationService';



const AdminLogin = () => {const AdminLogin = () => {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({  const [formData, setFormData] = useState({

    nationalId: '',

    otp: ''    otp: ''

  });  });

  const [showOtp, setShowOtp] = useState(false);  const [showOtp, setShowOtp] = useState(false);

  const [isLoading, setIsLoading] = useState(false);  const [isLoading, setIsLoading] = useState(false);

  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {

    // Check if already authenticated  useEffect(() => {

    const token = localStorage.getItem('auth_token');    // Check if already authenticated

    const userInfo = localStorage.getItem('user_info');    const token = localStorage.getItem('auth_token');

    const expires = localStorage.getItem('auth_expires');    const userInfo = localStorage.getItem('user_info');

        const expires = localStorage.getItem('auth_expires');

    if (token && userInfo && expires && Date.now() < parseInt(expires)) {    

      const user = JSON.parse(userInfo);    if (token && userInfo && expires && Date.now() < parseInt(expires)) {

      if (user.role === 'admin') {      const user = JSON.parse(userInfo);

        navigate('/admin/dashboard');      if (user.role === 'admin') {

      }        navigate('/admin/dashboard');

    }      }

  }, [navigate]);    }

  }, [navigate]);

  const handleLogin = async (e) => {

    e.preventDefault();  const handleInputChange = (e) => {

    setFormData(prev => ({

    if (!formData.nationalId || !formData.otp) {      ...prev,

      notificationService.error('Please enter both National ID and OTP');      [e.target.name]: e.target.value

      return;    }));

    }    

    // Auto-show OTP field when nationalId is entered

    setIsLoading(true);    if (e.target.name === 'nationalId' && e.target.value.trim()) {

    try {      setOtpSent(true);

      // Simple mock authentication for demo    }

      const adminAccounts = ['ADMIN001', 'ADMIN123', 'admin'];  };

          e.preventDefault();

      if (adminAccounts.includes(formData.nationalId.toUpperCase()) && 

          (formData.otp === '123456' || formData.otp === '000000')) {    if (!formData.nationalId || !formData.otp) {

              notificationService.error('Please enter both National ID and OTP');

        // Mock auth success      return;

        const authData = {    }

          success: true,

          user: {    setIsLoading(true);

            nationalId: formData.nationalId,    try {

            name: formData.nationalId === 'ADMIN001' ? 'Dr. Sarah Johnson' :       // Simple mock authentication for demo

                  formData.nationalId === 'ADMIN123' ? 'Dr. Rajesh Patel' :       const adminAccounts = ['ADMIN001', 'ADMIN123', 'admin'];

                  'System Administrator',      

            role: 'admin',      if (adminAccounts.includes(formData.nationalId.toUpperCase()) && 

            email: 'admin@sehat-saathi.org',          (formData.otp === '123456' || formData.otp === '000000')) {

            loginTime: new Date().toISOString()        

          },        // Mock auth success

          accessToken: `admin_token_${Date.now()}`,        const authData = {

          expiresIn: 3600          success: true,

        };          user: {

                    nationalId: formData.nationalId,

        // Store auth data            name: formData.nationalId === 'ADMIN001' ? 'Dr. Sarah Johnson' : 

        localStorage.setItem('auth_token', authData.accessToken);                  formData.nationalId === 'ADMIN123' ? 'Dr. Rajesh Patel' : 

        localStorage.setItem('user_info', JSON.stringify(authData.user));                  'System Administrator',

        localStorage.setItem('auth_expires', (Date.now() + (authData.expiresIn * 1000)).toString());            role: 'admin',

                    email: 'admin@sehat-saathi.org',

        // Log activity            loginTime: new Date().toISOString()

        const activityLog = {          },

          timestamp: new Date().toISOString(),          accessToken: `admin_token_${Date.now()}`,

          userId: authData.user.nationalId,          expiresIn: 3600

          userName: authData.user.name,        };

          userRole: authData.user.role,        

          action: 'login',        // Store auth data

          sessionId: `session_${Date.now()}`,        localStorage.setItem('auth_token', authData.accessToken);

          userAgent: navigator.userAgent        localStorage.setItem('user_info', JSON.stringify(authData.user));

        };        localStorage.setItem('auth_expires', (Date.now() + (authData.expiresIn * 1000)).toString());

                

        const existingLogs = JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');        // Log activity

        existingLogs.push(activityLog);        const activityLog = {

        localStorage.setItem('auth_activity_logs', JSON.stringify(existingLogs));          timestamp: new Date().toISOString(),

                  userId: authData.user.nationalId,

        notificationService.success(`Welcome, ${authData.user.name}!`);          userName: authData.user.name,

        navigate('/admin/dashboard');          userRole: authData.user.role,

      } else {          action: 'login',

        notificationService.error('Invalid credentials. Use ADMIN001/ADMIN123/admin with OTP 123456 for demo.');          sessionId: `session_${Date.now()}`,

      }          userAgent: navigator.userAgent

    } catch (err) {        };

      console.error('Authentication error:', err);        

      notificationService.error('Authentication failed. Please try again.');        const existingLogs = JSON.parse(localStorage.getItem('auth_activity_logs') || '[]');

    } finally {        existingLogs.push(activityLog);

      setIsLoading(false);        localStorage.setItem('auth_activity_logs', JSON.stringify(existingLogs));

    }        

  };        notificationService.success(`Welcome, ${authData.user.name}!`);

        navigate('/admin/dashboard');

  const handleInputChange = (e) => {      } else {

    setFormData(prev => ({        notificationService.error('Invalid credentials. Use ADMIN001/ADMIN123/admin with OTP 123456 for demo.');

      ...prev,      }

      [e.target.name]: e.target.value    } catch (err) {

    }));      console.error('Authentication error:', err);

  };      notificationService.error('Authentication failed. Please try again.');

    } finally {

  return (      setIsLoading(false);

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">    }

      <div className="max-w-md w-full">  };

        {/* Back Button */}

        <Link  const handleInputChange = (e) => {

          to="/"    setFormData(prev => ({

          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"      ...prev,

        >      [e.target.name]: e.target.value

          <ArrowLeft className="h-4 w-4 mr-2" />    }));

          Back to Home  };

        </Link>

  return (

        <div className="bg-white rounded-xl shadow-lg p-8">    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">

          {/* Header */}      <div className="max-w-md w-full">

          <div className="text-center mb-8">        {/* Back Button */}

            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">        <Link

              <Shield className="h-8 w-8 text-blue-600" />          to="/"

            </div>          className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6"

            <h1 className="text-2xl font-bold text-gray-900 mb-2">        >

              Administrator Login          <ArrowLeft className="h-4 w-4 mr-2" />

            </h1>          Back to Home

            <p className="text-gray-600">        </Link>

              Access admin dashboard with Sehat Saathi authentication

            </p>        <div className="bg-white rounded-xl shadow-lg p-8">

          </div>          {/* Header */}

          <div className="text-center mb-8">

          <form onSubmit={handleLogin} className="space-y-6">            <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">

            {/* National ID */}              <Shield className="h-8 w-8 text-blue-600" />

            <div>            </div>

              <label className="form-label">Admin National ID</label>            <h1 className="text-2xl font-bold text-gray-900 mb-2">

              <div className="relative">              Administrator Login

                <input            </h1>

                  type="text"            <p className="text-gray-600">

                  name="nationalId"              Access admin dashboard with eSignet authentication

                  value={formData.nationalId}            </p>

                  onChange={handleInputChange}          </div>

                  className="form-input pl-10"

                  placeholder="Enter your Admin National ID"          <form onSubmit={handleLogin} className="space-y-6">

                  required            {/* National ID */}

                />            <div>

                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />              <label className="form-label">Admin National ID</label>

              </div>              <div className="relative">

            </div>                <input

                  type="text"

            {/* OTP Input */}                  name="nationalId"

            <div>                  value={formData.nationalId}

              <label className="form-label">One-Time Password</label>                  onChange={handleInputChange}

              <div className="relative">                  className="form-input pl-10"

                <input                  placeholder="Enter your Admin National ID"

                  type={showOtp ? 'text' : 'password'}                  required

                  name="otp"                />

                  value={formData.otp}                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

                  onChange={handleInputChange}              </div>

                  className="form-input pr-10"            </div>

                  placeholder="Enter 6-digit OTP"

                  maxLength="6"            {/* Send OTP Button */}

                  required            {!otpSent && (

                />              <button

                <button                type="button"

                  type="button"                onClick={handleSendOtp}

                  onClick={() => setShowOtp(!showOtp)}                disabled={isLoading || !formData.nationalId}

                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"                className="w-full btn-secondary flex items-center justify-center space-x-2"

                >              >

                  {showOtp ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}                <Phone className="h-4 w-4" />

                </button>                <span>{isLoading ? 'Sending OTP...' : 'Send OTP'}</span>

              </div>              </button>

              <p className="text-sm text-gray-500 mt-1">            )}

                Use OTP: 123456 or 000000 for demo

              </p>            {/* OTP Input */}

            </div>            {otpSent && (

              <div>

            {/* Login Button */}                <label className="form-label">One-Time Password</label>

            <button                <div className="relative">

              type="submit"                  <input

              disabled={isLoading || !formData.nationalId || !formData.otp}                    type={showOtp ? 'text' : 'password'}

              className="w-full btn-primary disabled:opacity-50"                    name="otp"

            >                    value={formData.otp}

              {isLoading ? 'Authenticating...' : 'Access Admin Dashboard'}                    onChange={handleInputChange}

            </button>                    className="form-input pr-10"

          </form>                    placeholder="Enter 6-digit OTP"

                    maxLength="6"

          {/* Development Info */}                    required

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">                  />

            <p className="text-sm text-blue-800">                  <button

              <strong>Demo Credentials:</strong><br />                    type="button"

              • Admin ID: ADMIN001, ADMIN123, or admin<br />                    onClick={() => setShowOtp(!showOtp)}

              • OTP: 123456 or 000000<br />                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"

              • Sehat Saathi mock authentication system                  >

            </p>                    {showOtp ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}

          </div>                  </button>

                </div>

          {/* Security Notice */}                <p className="text-sm text-gray-500 mt-1">

          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">                  OTP sent to your registered mobile/email

            <p className="text-sm text-amber-800">                </p>

              <strong>Security Notice:</strong> Admin access requires authorized credentials.               </div>

              All login attempts are monitored and logged.            )}

            </p>

          </div>            {/* Login Button */}

            <button

          {/* Help */}              type="submit"

          <div className="mt-6 text-center">              disabled={isLoading || !formData.nationalId || !formData.otp}

            <p className="text-sm text-gray-600">              className="w-full btn-primary disabled:opacity-50"

              Need help? Contact system administrator            >

            </p>              {isLoading ? 'Authenticating...' : 'Access Admin Dashboard'}

          </div>            </button>

        </div>

      </div>            {/* Resend OTP */}

    </div>            {otpSent && (

  );              <button

};                type="button"

                onClick={handleSendOtp}

export default AdminLogin;                disabled={isLoading}
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