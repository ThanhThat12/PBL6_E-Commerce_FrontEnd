import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiShield, FiLogOut } from 'react-icons/fi';

import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

/**
 * ProfilePage
 * User profile information and logout
 */
const ProfilePage = () => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get('/user/me');
        if (response.data.code === 200) {
          setUser(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Loading profile..." />
      </div>
    );
  }

  const displayUser = user || authUser;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN':
      case 0:
        return 'bg-red-100 text-red-800';
      case 'SELLER':
      case 1:
        return 'bg-blue-100 text-blue-800';
      case 'BUYER':
      case 2:
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
      case 0:
        return 'Admin';
      case 'SELLER':
      case 1:
        return 'Seller';
      case 'BUYER':
      case 2:
      default:
        return 'Buyer';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Avatar */}
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <FiUser className="w-12 h-12" />
            </div>
            
            <h1 className="text-3xl font-bold mb-2">
              {displayUser?.username || 'User'}
            </h1>
            
            {/* Role Badge */}
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(displayUser?.role)}`}>
              {getRoleLabel(displayUser?.role)}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Information Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Profile Information
          </h2>

          <div className="space-y-6">
            {/* Username */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <FiUser className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Username</p>
                <p className="text-lg font-semibold text-gray-900">
                  {displayUser?.username || 'N/A'}
                </p>
              </div>
            </div>

            {/* Email */}
            {displayUser?.email && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <FiMail className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {displayUser.email}
                  </p>
                </div>
              </div>
            )}

            {/* Phone */}
            {displayUser?.phoneNumber && (
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <FiPhone className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {displayUser.phoneNumber}
                  </p>
                </div>
              </div>
            )}

            {/* Account Status */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <FiShield className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Account Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  displayUser?.activated 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {displayUser?.activated ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Edit Profile (Coming Soon) */}
            <button
              onClick={() => toast.info('Edit profile feature coming soon!')}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <FiUser className="w-6 h-6 text-gray-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Edit Profile</p>
                <p className="text-sm text-gray-600">Update your information</p>
              </div>
            </button>

            {/* Change Password (Coming Soon) */}
            <button
              onClick={() => toast.info('Change password feature coming soon!')}
              className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all"
            >
              <FiShield className="w-6 h-6 text-gray-600" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">Change Password</p>
                <p className="text-sm text-gray-600">Update your password</p>
              </div>
            </button>
          </div>

          {/* Logout Button */}
          <div className="mt-8 pt-8 border-t">
            <Button
              onClick={handleLogout}
              variant="danger"
              className="w-full sm:w-auto"
            >
              <FiLogOut className="w-5 h-5 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
