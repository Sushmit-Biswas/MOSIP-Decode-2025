import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Users, UserCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-600 rounded-full p-4">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Child Health Record System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Empowering healthcare workers to capture critical child health data anywhere, 
            with secure eSignet authentication and offline capabilities.
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Field Representative Login */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Field Representative
              </h2>
              <p className="text-gray-600 mb-6">
                Collect child health data in the field, work offline, and sync when connected.
              </p>
              <Link
                to="/login/field-representative"
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <UserCheck className="h-5 w-5" />
                <span>Login as Field Representative</span>
              </Link>
            </div>
          </div>

          {/* Admin Login */}
          <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Administrator
              </h2>
              <p className="text-gray-600 mb-6">
                Access admin dashboard, view analytics, and manage collected health data.
              </p>
              <Link
                to="/login/admin"
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                <Shield className="h-5 w-5" />
                <span>Login as Administrator</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Key Features
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-purple-600 text-xl">📱</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Offline First</h4>
              <p className="text-gray-600 text-sm">
                Work without internet connectivity and sync when available
              </p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🔐</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">eSignet Secure</h4>
              <p className="text-gray-600 text-sm">
                MOSIP eSignet authentication ensures data security
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Analytics</h4>
              <p className="text-gray-600 text-sm">
                Comprehensive dashboards and health insights
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>&copy; 2025 Child Health Record System. Built for MOSIP Decode Challenge.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;