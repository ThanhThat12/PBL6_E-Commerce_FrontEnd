import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { getProfile, updateProfile, changePassword, updateAvatar } from '../services/userService';
import { useAuth } from './useAuth';

/**
 * useProfile Hook
 * T016 - Phase 3 (US1) - Personal Profile Management
 * 
 * Wraps userService profile functions with state management,
 * loading states, error handling, and toast notifications
 * 
 * Reuses existing:
 * - getProfile() from userService
 * - updateProfile() from userService
 * - changePassword() from userService
 * - updateAvatar() from userService
 * - useAuth() hook for global auth state sync
 */
export const useProfile = () => {
  const { user: authUser, updateUser: updateAuthUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch current user profile
   * Uses existing getProfile() from userService
   */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getProfile();
      if (response.statusCode === 200 || response.status === 200) {
        const userData = response.data;
        setProfile(userData);
        // Sync with AuthContext
        if (updateAuthUser) {
          updateAuthUser(userData);
        }
        return userData;
      } else {
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải thông tin tài khoản';
      setError(errorMsg);
      toast.error(errorMsg);
      // Fallback to authUser if available
      if (authUser) {
        setProfile(authUser);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [authUser, updateAuthUser]);

  /**
   * Update user profile
   * Uses existing updateProfile() from userService
   * @param {Object} profileData - { fullName, phoneNumber, email, etc. }
   */
  const updateUserProfile = useCallback(async (profileData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateProfile(profileData);
      if (response.statusCode === 200 || response.status === 200) {
        const updatedUser = response.data;
        setProfile(updatedUser);
        // Sync with AuthContext
        if (updateAuthUser) {
          updateAuthUser(updatedUser);
        }
        toast.success('Cập nhật thông tin thành công');
        return updatedUser;
      } else {
        throw new Error(response.message || 'Failed to update profile');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Cập nhật thông tin thất bại';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAuthUser]);

  /**
   * Change user password
   * Uses existing changePassword() from userService
   * @param {Object} passwordData - { oldPassword, newPassword, confirmPassword }
   */
  const changeUserPassword = useCallback(async (passwordData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await changePassword(passwordData);
      if (response.statusCode === 200 || response.status === 200) {
        toast.success('Đổi mật khẩu thành công');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to change password');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Đổi mật khẩu thất bại';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user avatar URL
   * Uses existing updateAvatar() from userService
   * Note: For file upload to Cloudinary, use uploadAvatarFile() in ProfileInfo component
   * @param {string} avatarUrl - Cloudinary URL
   */
  const updateUserAvatar = useCallback(async (avatarUrl) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateAvatar(avatarUrl);
      if (response.statusCode === 200 || response.status === 200) {
        const updatedUser = response.data;
        setProfile(updatedUser);
        // Sync with AuthContext
        if (updateAuthUser) {
          updateAuthUser(updatedUser);
        }
        toast.success('Cập nhật ảnh đại diện thành công');
        return updatedUser;
      } else {
        throw new Error(response.message || 'Failed to update avatar');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Cập nhật ảnh đại diện thất bại';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAuthUser]);

  return {
    profile: profile || authUser,
    loading,
    error,
    fetchProfile,
    updateProfile: updateUserProfile,
    changePassword: changeUserPassword,
    updateAvatar: updateUserAvatar
  };
};

export default useProfile;
