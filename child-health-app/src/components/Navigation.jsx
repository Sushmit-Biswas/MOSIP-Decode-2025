import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Plus, List, Upload, Settings, BarChart3, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoWithoutBg from '../images/logo_without_bg.png';

const Navigation = () => {
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  // Hide navigation on login pages and landing page
  const hideNavigation = [
    '/',
    '/login/field-representative',
    '/login/admin'
  ].includes(location.pathname);

  if (hideNavigation) {
    return null;
  }

  // Define navigation items based on user role
  const getNavItems = () => {
    if (!isAuthenticated || !user) return [];

    const commonItems = [
      { path: '/dashboard', icon: Heart, label: 'Dashboard' }
    ];

    if (user.role === 'admin') {
      return [
        ...commonItems,
        { path: '/admin/dashboard', icon: Settings, label: 'Admin Portal' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' },
        { path: '/records', icon: List, label: 'All Records' },
      ];
    } else if (user.role === 'field_representative') {
      return [
        ...commonItems,
        { path: '/add-child', icon: Plus, label: 'Add Child' },
        { path: '/records', icon: List, label: 'My Records' },
        { path: '/sync', icon: Upload, label: 'Sync Data' },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <img src={logoWithoutBg} alt="Sehat Saathi" className="h-10 w-10" />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">Sehat Saathi</span>
                <span className="text-xs text-gray-600">Child Health Records</span>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-4">
              {navItems.map(({ path, icon: IconComponent, label }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Authentication Status */}
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">{user.name}</span>
                  <span className="text-xs text-gray-500 capitalize">({user.role.replace('_', ' ')})</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Not logged in
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;