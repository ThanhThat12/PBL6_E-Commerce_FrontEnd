import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiShield, FiEdit2, FiLock, FiCalendar } from 'react-icons/fi';
import Button from '../common/Button';
import Loading from '../common/Loading';
import ProfileEditModal from './ProfileEditModal';
import ChangePasswordModal from './ChangePasswordModal';
import AvatarUpload from './AvatarUpload';
import { useAuth } from '../../hooks/useAuth';
import { getProfile } from '../../services/userService';

/**
 * ProfileInfo
 * Thông tin tài khoản người dùng
 */
const ProfileInfo = () => {
  const { user: authUser, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Interceptor returns response.data (ResponseDTO) directly
        // So response = { status: 200, message: "...", data: {...} }
        const response = await getProfile();
        console.log('getProfile response:', response);
        
        if (response.status === 200 && response.data) {
          setUser(response.data);
          // Update AuthContext once (not in dependencies to avoid loop)
          if (updateUser) {
            updateUser(response.data);
          }
        } else {
          console.warn('Unexpected profile response:', response);
          // Fallback to authUser
          if (authUser) {
            setUser(authUser);
          }
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Fallback to authUser if API fails
        if (authUser) {
          setUser(authUser);
        } else {
          toast.error('Không thể tải thông tin tài khoản');
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleProfileUpdate = (updatedProfile) => {
    setUser(updatedProfile);
    // Update AuthContext if available
    if (updateUser) {
      updateUser(updatedProfile);
    }
  };

  const handleAvatarUpdate = (avatarUrl) => {
    // Update local user state with new avatar
    const updatedUser = { ...displayUser, avatarUrl };
    setUser(updatedUser);
    // Update AuthContext if available
    if (updateUser) {
      updateUser(updatedUser);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Đang tải thông tin..." />
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
      case 'CUSTOMER':
      case 2:
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
      case 0:
        return 'Quản trị viên';
      case 'SELLER':
      case 1:
        return 'Người bán';
      case 'BUYER':
      case 'CUSTOMER':
      case 2:
      default:
        return 'Khách hàng';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Hồ Sơ Của Tôi</h2>
        <p className="text-sm text-gray-600 mt-1">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
      </div>

      {/* Avatar Section */}
      <div className="mb-8 pb-6 border-b">
        <AvatarUpload
          currentAvatar={displayUser?.avatarUrl}
          onAvatarUpdate={handleAvatarUpdate}
        />
      </div>

      {/* Profile Information */}
      <div className="space-y-6">
        {/* Username */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
            <FiUser className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Tên đăng nhập</p>
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
              <p className="text-sm text-gray-600 mb-1">Số điện thoại</p>
              <p className="text-lg font-semibold text-gray-900">
                {displayUser.phoneNumber}
              </p>
            </div>
          </div>
        )}

        {/* Full Name */}
        {displayUser?.fullName && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <FiUser className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Họ và tên</p>
              <p className="text-lg font-semibold text-gray-900">
                {displayUser.fullName}
              </p>
            </div>
          </div>
        )}

        {/* Role */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
            <FiShield className="w-6 h-6 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Vai trò</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleBadgeColor(displayUser?.role)}`}>
              {getRoleLabel(displayUser?.role)}
            </span>
          </div>
        </div>

        {/* Account Status */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
            <FiShield className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Trạng thái tài khoản</p>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              displayUser?.activated 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {displayUser?.activated ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
            </span>
          </div>
        </div>

        {/* Created At */}
        {displayUser?.createdAt && (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
              <FiCalendar className="w-6 h-6 text-pink-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-1">Ngày tham gia</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(displayUser.createdAt).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t">
        <Button
          onClick={() => setEditModalOpen(true)}
          variant="primary"
          className="flex items-center justify-center gap-2"
        >
          <FiEdit2 className="w-5 h-5" />
          Chỉnh Sửa Hồ Sơ
        </Button>

        <Button
          onClick={() => setPasswordModalOpen(true)}
          variant="outline"
          className="flex items-center justify-center gap-2"
        >
          <FiLock className="w-5 h-5" />
          Đổi Mật Khẩu
        </Button>
      </div>

      {/* Modals */}
      <ProfileEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        currentProfile={displayUser}
        onSuccess={handleProfileUpdate}
      />
      
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
};

export default ProfileInfo;
