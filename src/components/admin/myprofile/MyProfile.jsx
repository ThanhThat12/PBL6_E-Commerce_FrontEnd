import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save, X, Camera } from 'lucide-react';
import './MyProfile.css';

const MyProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: 'admin_user',
    fullName: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, New York, NY 10001',
    role: 'Super Admin',
    department: 'IT Department',
    joinDate: '2024-01-15',
    bio: 'Experienced system administrator with a passion for maintaining secure and efficient systems.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
  });

  const [editedData, setEditedData] = useState({ ...profileData });

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData({ ...profileData });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({ ...profileData });
  };

  const handleSave = () => {
    setProfileData({ ...editedData });
    setIsEditing(false);
    console.log('Profile updated:', editedData);
    // TODO: Implement API call to update profile
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = () => {
    console.log('Change avatar');
    // TODO: Implement avatar upload
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getRoleBadgeClass = (role) => {
    if (role.includes('Super')) return 'role-super';
    if (role.includes('Admin')) return 'role-admin';
    return 'role-default';
  };

  return (
    <div className="myprofile-container">
      {/* Header */}
      <div className="myprofile-header">
        <h1 className="myprofile-title">My Profile</h1>
        <p className="myprofile-subtitle">Manage your personal information and settings</p>
      </div>

      <div className="myprofile-content">
        {/* Profile Card */}
        <div className="myprofile-card">
          {/* Avatar Section */}
          <div className="myprofile-avatar-section">
            <div className="myprofile-avatar-container">
              <img 
                src={profileData.avatar} 
                alt={profileData.fullName}
                className="myprofile-avatar"
              />
              {isEditing && (
                <button className="myprofile-avatar-change-btn" onClick={handleAvatarChange}>
                  <Camera size={20} />
                </button>
              )}
            </div>
            <div className="myprofile-basic-info">
              <h2 className="myprofile-name">{profileData.fullName}</h2>
              <p className="myprofile-username">@{profileData.username}</p>
              <span className={`myprofile-role-badge ${getRoleBadgeClass(profileData.role)}`}>
                <Shield size={14} />
                {profileData.role}
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
                <button className="myprofile-btn-save" onClick={handleSave}>
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="myprofile-info-grid">
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
                  name="phone"
                  value={editedData.phone}
                  onChange={handleChange}
                  className="myprofile-info-input"
                />
              ) : (
                <p className="myprofile-info-value">{profileData.phone}</p>
              )}
            </div>

            {/* Department */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <Shield size={18} />
                Department
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="department"
                  value={editedData.department}
                  onChange={handleChange}
                  className="myprofile-info-input"
                />
              ) : (
                <p className="myprofile-info-value">{profileData.department}</p>
              )}
            </div>

            {/* Address */}
            <div className="myprofile-info-group full-width">
              <label className="myprofile-info-label">
                <MapPin size={18} />
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={editedData.address}
                  onChange={handleChange}
                  className="myprofile-info-input"
                />
              ) : (
                <p className="myprofile-info-value">{profileData.address}</p>
              )}
            </div>

            {/* Bio */}
            <div className="myprofile-info-group full-width">
              <label className="myprofile-info-label">
                <User size={18} />
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={editedData.bio}
                  onChange={handleChange}
                  className="myprofile-info-textarea"
                  rows="3"
                />
              ) : (
                <p className="myprofile-info-value">{profileData.bio}</p>
              )}
            </div>

            {/* Join Date (Read-only) */}
            <div className="myprofile-info-group">
              <label className="myprofile-info-label">
                <Calendar size={18} />
                Member Since
              </label>
              <p className="myprofile-info-value">{formatDate(profileData.joinDate)}</p>
            </div>
          </div>

          
        </div>

        {/* Additional Stats/Info Card */}
        <div className="myprofile-stats">
          <h3 className="myprofile-stats-title">Account Statistics</h3>
          <div className="myprofile-stats-grid">
            <div className="myprofile-stat-item">
              <div className="myprofile-stat-icon blue">
                <User size={24} />
              </div>
              <div className="myprofile-stat-content">
                <p className="myprofile-stat-label">Total Logins</p>
                <p className="myprofile-stat-value">342</p>
              </div>
            </div>
            <div className="myprofile-stat-item">
              <div className="myprofile-stat-icon green">
                <Shield size={24} />
              </div>
              <div className="myprofile-stat-content">
                <p className="myprofile-stat-label">Actions Performed</p>
                <p className="myprofile-stat-value">1,248</p>
              </div>
            </div>
            <div className="myprofile-stat-item">
              <div className="myprofile-stat-icon purple">
                <Calendar size={24} />
              </div>
              <div className="myprofile-stat-content">
                <p className="myprofile-stat-label">Days Active</p>
                <p className="myprofile-stat-value">285</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
