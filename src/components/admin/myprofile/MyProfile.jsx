import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Shield, Calendar, Edit2, Save, X, Camera, Key, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import './MyProfile.css';
import { getAdminMyProfile, updateAdminMyProfile, changeAdminPassword, updateAdminAvatar, resetUserPassword } from '../../../services/adminService';
import Toast from '../common/Toast';
import Confirm from '../common/Confirm';
import ImageUploadService from '../../../services/ImageUploadService';

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileData, setProfileData] = useState({
    id: '',
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    activated: false,
    createdAt: '',
    avatar: ''
  });

  const [editedData, setEditedData] = useState({ ...profileData });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profileData.avatar);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminMyProfile();
      
      if (response.status === 200 && response.data) {
        setProfileData(response.data);
        setAvatarPreview(response.data.avatar || 'https://via.placeholder.com/120');
        console.log('✅ Profile data loaded:', response.data);
      }
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setError(error.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...profileData });
    setAvatarPreview(profileData.avatar);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({ ...profileData });
    setAvatarFile(null);
    setAvatarPreview(profileData.avatar);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Upload avatar to Cloudinary if changed
      let uploadedAvatarUrl = null;
      if (avatarFile) {
        try {
          console.log('📤 Uploading avatar to Cloudinary...');
          const uploadResponse = await ImageUploadService.uploadAvatar(avatarFile);
          console.log('✅ Avatar uploaded to Cloudinary:', uploadResponse);
          
          if (uploadResponse && uploadResponse.data && uploadResponse.data.url) {
            uploadedAvatarUrl = uploadResponse.data.url;
            console.log('🖼️ Avatar URL:', uploadedAvatarUrl);
          } else {
            throw new Error('Invalid upload response format');
          }
        } catch (uploadError) {
          console.error('❌ Error uploading avatar:', uploadError);
          setToast({
            show: true,
            message: 'Failed to upload avatar: ' + (uploadError.message || 'Unknown error'),
            type: 'error'
          });
          setLoading(false);
          return;
        }
      }

      // 2. Update avatar URL in backend if uploaded
      if (uploadedAvatarUrl) {
        try {
          console.log('📡 Updating avatar URL in backend...');
          const avatarResponse = await updateAdminAvatar(uploadedAvatarUrl);
          console.log('✅ Avatar URL updated in backend:', avatarResponse);
          
          if (avatarResponse && avatarResponse.data) {
            setAvatarPreview(avatarResponse.data.avatar || uploadedAvatarUrl);
          }
        } catch (avatarError) {
          console.error('❌ Error updating avatar URL:', avatarError);
          setToast({
            show: true,
            message: 'Avatar uploaded but failed to save URL: ' + (avatarError.message || 'Unknown error'),
            type: 'error'
          });
          setLoading(false);
          return;
        }
      }

      // 3. Update profile data (username, fullName, email, phoneNumber)
      const profileUpdateData = {
        username: editedData.username,
        fullName: editedData.fullName,
        email: editedData.email,
        phoneNumber: editedData.phoneNumber
      };

      const response = await updateAdminMyProfile(profileUpdateData);
      
      if (response.status === 200 && response.data) {
        setProfileData(response.data);
        // Keep the uploaded avatar URL if it was changed, otherwise use the one from response
        if (uploadedAvatarUrl) {
          setProfileData(prev => ({ ...prev, avatar: uploadedAvatarUrl }));
          setAvatarPreview(uploadedAvatarUrl);
        } else {
          setAvatarPreview(response.data.avatar);
        }
        setIsEditing(false);
        setAvatarFile(null);
        setToast({
          show: true,
          message: 'Profile updated successfully!',
          type: 'success'
        });
        console.log('✅ Profile updated:', response.data);
      }
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setError(error.message || 'Failed to update profile');
      setToast({
        show: true,
        message: error.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({
        show: true,
        message: 'New passwords do not match',
        type: 'error'
      });
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setToast({
        show: true,
        message: 'New password must be at least 6 characters',
        type: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await changeAdminPassword(passwordData);
      
      if (response.status === 200) {
        setToast({
          show: true,
          message: 'Password changed successfully!',
          type: 'success'
        });
        console.log('✅ Password changed:', response.data);
        
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowChangePassword(false);
      }
    } catch (error) {
      console.error('❌ Error changing password:', error);
      setError(error.message || 'Failed to change password');
      setToast({
        show: true,
        message: error.message || 'Failed to change password',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = () => {
    setShowConfirm(true);
  };

  const confirmResetPassword = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔑 Resetting password for admin ID:', profileData.id);
      const response = await resetUserPassword(profileData.id);
      
      if (response.status === 200) {
        setToast({
          show: true,
          message: '✅ Password reset successfully! New password: Admin123@ - Please save this and change it after logging in.',
          type: 'success'
        });
        console.log('✅ Password reset response:', response);
      }
    } catch (error) {
      console.error('❌ Error resetting password:', error);
      setError(error.message || 'Failed to reset password');
      setToast({
        show: true,
        message: error.message || 'Failed to reset password',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle keyboard events
  const handleKeyDown = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'save') {
        handleSave();
      } else if (action === 'password') {
        handleChangePasswordSubmit();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (action === 'save') {
        handleCancel();
      } else if (action === 'password') {
        setShowChangePassword(false);
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !profileData.id) {
    return (
      <div className="myprofile-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          Loading profile...
        </div>
      </div>
    );
  }

  if (error && !profileData.id) {
    return (
      <div className="myprofile-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
          {error}
          <button 
            onClick={fetchProfileData}
            style={{ marginLeft: '10px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="myprofile-container">
      {/* Header */}
      <div className="myprofile-header">
        <h1 className="myprofile-title">My Profile</h1>
      </div>

      <div className="myprofile-content">
        {/* Profile Card */}
        <div className="myprofile-card">
          {/* Avatar Section */}
          <div className="myprofile-avatar-section">
            <div className="myprofile-avatar-container">
              <img 
                src={avatarPreview} 
                alt={profileData.fullName}
                className="myprofile-avatar"
              />
              {isEditing && (
                <button 
                  className="myprofile-avatar-change-btn" 
                  onClick={handleAvatarClick}
                  type="button"
                >
                  <Camera size={20} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="myprofile-basic-info">
              <h2 className="myprofile-name">{profileData.fullName}</h2>
              <span className={`myprofile-status-badge ${profileData.activated ? 'status-active' : 'status-inactive'}`}>
                {profileData.activated ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {profileData.activated ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Edit Button */}
          <div className="myprofile-actions">
            {!isEditing ? (
              <button className="myprofile-btn-edit" onClick={handleEdit}>
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <div className="myprofile-edit-actions">
                <button className="myprofile-btn-cancel" onClick={handleCancel}>
                  <X size={18} />
                  Cancel
                </button>
                <button 
                  className="myprofile-btn-save" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="myprofile-info-grid">
            {/* User ID (Read-only) */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <Shield size={18} />
                User ID
              </label>
              <p className="myprofile-info-value">{profileData.id}</p>
            </div>

            {/* Account Status (Read-only) */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <CheckCircle size={18} />
                Account Status
              </label>
              <p className="myprofile-info-value">
                {profileData.activated ? 'Active' : 'Inactive'}
              </p>
            </div>

            {/* Username */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <User size={18} />
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={editedData.username}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'save')}
                  className="myprofile-info-input"
                />
              ) : (
                <p className="myprofile-info-value">{profileData.username}</p>
              )}
            </div>

            {/* Full Name */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <User size={18} />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={editedData.fullName}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'save')}
                  className="myprofile-info-input"
                />
              ) : (
                <p className="myprofile-info-value">{profileData.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <Mail size={18} />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedData.email}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'save')}
                  className="myprofile-info-input"
                />
              ) : (
                <p className="myprofile-info-value">{profileData.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <Phone size={18} />
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editedData.phoneNumber}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'save')}
                  className="myprofile-info-input"
                />
              ) : (
                <p className="myprofile-info-value">{profileData.phoneNumber}</p>
              )}
            </div>

            {/* Created At (Read-only) */}
            <div className="myprofile-info-group full-width">
              <label className="myprofile-info-label">
                <Calendar size={18} />
                Account Created
              </label>
              <p className="myprofile-info-value">{formatDate(profileData.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="myprofile-security">
          <h3 className="myprofile-security-title">Security Settings</h3>
          
          {/* Change Password Section */}
          {!showChangePassword ? (
            <div className="myprofile-security-actions">
              <button 
                className="myprofile-btn-change-password"
                onClick={() => setShowChangePassword(true)}
              >
                <Key size={18} />
                Change Password
              </button>
              <button 
                className="myprofile-btn-reset-password"
                onClick={handleResetPassword}
              >
                <RotateCcw size={18} />
                Reset Password
              </button>
            </div>
          ) : (
            <div className="myprofile-password-form">
              <div className="myprofile-password-header">
                <h4 className="myprofile-password-title">Change Password</h4>
                <button 
                  className="myprofile-password-close"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="myprofile-password-inputs">
                <div className="myprofile-password-group">
                  <label className="myprofile-password-label">
                    <Key size={16} />
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    onKeyDown={(e) => handleKeyDown(e, 'password')}
                    className="myprofile-password-input"
                    placeholder="Enter current password"
                  />
                </div>

                <div className="myprofile-password-group">
                  <label className="myprofile-password-label">
                    <Key size={16} />
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    onKeyDown={(e) => handleKeyDown(e, 'password')}
                    className="myprofile-password-input"
                    placeholder="Enter new password"
                  />
                </div>

                <div className="myprofile-password-group">
                  <label className="myprofile-password-label">
                    <Key size={16} />
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    onKeyDown={(e) => handleKeyDown(e, 'password')}
                    className="myprofile-password-input"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="myprofile-password-actions">
                <button 
                  className="myprofile-btn-password-cancel"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  <X size={18} />
                  Cancel
                </button>
                <button 
                  className="myprofile-btn-password-save"
                  onClick={handleChangePasswordSubmit}
                  disabled={loading}
                >
                  <Save size={18} />
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={6000}
      />

      {/* Confirm Modal */}
      <Confirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmResetPassword}
        title="Reset Password"
        message="Are you sure you want to reset your password to default (Admin123@)?\n\nYou will need to change it after logging in again."
        confirmText="Reset Password"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
};

export default MyProfile;
