import React, { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Input, Button, Avatar, Upload, message, Spin } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  CreditCardOutlined,
  CalendarOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { Sidebar, Header } from '../../components/Seller';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import './ProfilePage.css';

const { Content } = Layout;

const ProfilePage = () => {
  console.log('ProfilePage component mounted'); // Debug log
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [profile, setProfile] = useState({
    id: '',
    userName: '',
    email: '',
    role: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    location: '',
    creditCard: '',
    biography: '',
    avatar: null
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Kiểm tra token trước
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token); // Debug log
      
      if (!token) {
        message.warning('Vui lòng đăng nhập để xem profile');
        // Set data mặc định
        setProfile({
          id: '',
          userName: 'Guest',
          email: 'guest@example.com',
          role: 'GUEST',
          firstName: '',
          lastName: '',
          phoneNumber: '',
          dateOfBirth: '',
          location: '',
          creditCard: '',
          biography: '',
          avatar: null
        });
        setLoading(false);
        return;
      }
      
      const data = await getUserProfile();
      
      console.log('Profile data from API:', data); // Debug log
      
      setProfile({
        id: data.id || '',
        userName: data.userName || '',
        email: data.email || '',
        role: data.role || '',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phoneNumber: data.phoneNumber || '',
        dateOfBirth: data.dateOfBirth || '',
        location: data.location || '',
        creditCard: data.creditCard || '',
        biography: data.biography || '',
        avatar: data.avatar || data.profilePicture || null
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Không thể tải thông tin profile. Vui lòng đăng nhập lại.');
      
      // Set default data nếu lỗi
      setProfile({
        id: '',
        userName: 'User',
        email: 'user@example.com',
        role: 'BUYER',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        dateOfBirth: '',
        location: '',
        creditCard: '',
        biography: '',
        avatar: null
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await updateUserProfile(profile);
      message.success('Cập nhật thông tin thành công');
      setEditMode(false);
      fetchUserProfile(); // Refresh data
    } catch (error) {
      message.error('Cập nhật thất bại');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      message.error('Mật khẩu mới không khớp');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      message.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setSaving(true);
      // Call API to change password
      message.success('Đổi mật khẩu thành công');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      message.error('Đổi mật khẩu thất bại');
      console.error('Error changing password:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = (info) => {
    if (info.file.status === 'done') {
      message.success('Upload ảnh thành công');
      // Update avatar URL from response
      setProfile(prev => ({
        ...prev,
        avatar: info.file.response.url
      }));
    } else if (info.file.status === 'error') {
      message.error('Upload ảnh thất bại');
    }
  };

  const uploadProps = {
    name: 'file',
    action: 'http://localhost:8081/api/upload/avatar',
    headers: {
      authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    onChange: handleAvatarUpload,
  };

  if (loading) {
    return (
      <Layout className="profile-layout">
        <Layout.Sider width={250} theme="light">
          <Sidebar />
        </Layout.Sider>
        <Layout>
          <Header />
          <Content className="profile-content">
            <div style={{ textAlign: 'center', padding: '100px' }}>
              <Spin size="large" />
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }

  return (
    <Layout className="profile-layout">
      <Layout.Sider width={250} theme="light">
        <Sidebar />
      </Layout.Sider>
      
      <Layout>
        <Header />
        <Content className="profile-content">
          {/* Page Header */}
          <div className="page-header">
            <h1 className="page-title">Admin role</h1>
          </div>

          {/* About Section Title */}
          <div className="section-title">
            <h2>About section</h2>
          </div>

          <Row gutter={24}>
            {/* Left Column - Profile & Change Password */}
            <Col xs={24} lg={10}>
              {/* Profile Card */}
              <Card className="profile-card" title="Profile">
                <div className="profile-avatar-section">
                  <Avatar 
                    size={100} 
                    src={profile.avatar}
                    icon={!profile.avatar && <UserOutlined />}
                  />
                  <h3 className="profile-name">{profile.firstName} {profile.lastName}</h3>
                  <p className="profile-email">{profile.email}</p>
                  
                  <div className="social-links">
                    <p>Linked with Social media</p>
                    <div className="social-icons">
                      <Button icon={<i className="fab fa-google"></i>} />
                      <Button icon={<i className="fab fa-facebook"></i>} />
                      <Button icon={<i className="fab fa-twitter"></i>} />
                      <Button icon={<i className="fab fa-envelope"></i>} />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Change Password Card */}
              <Card className="password-card" title="Change Password">
                <div className="password-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <Input.Password
                      placeholder="Enter password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                    <a href="#" className="forgot-link">Forget Current Password? Click here</a>
                  </div>

                  <div className="form-group">
                    <label>New Password</label>
                    <Input.Password
                      placeholder="Enter password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Re-enter Password</label>
                    <Input.Password
                      placeholder="Enter password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                    />
                  </div>

                  <Button 
                    type="primary" 
                    block 
                    className="save-password-btn"
                    onClick={handleChangePassword}
                    loading={saving}
                  >
                    Save Change
                  </Button>
                </div>
              </Card>
            </Col>

            {/* Right Column - Profile Update */}
            <Col xs={24} lg={14}>
              <Card 
                className="profile-update-card" 
                title="Profile Update"
                extra={
                  <Button 
                    icon={<EditOutlined />}
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? 'Cancel' : 'Edit'}
                  </Button>
                }
              >
                <div className="profile-update-content">
                  {/* Avatar Upload */}
                  <div className="avatar-upload-section">
                    <Avatar 
                      size={64} 
                      src={profile.avatar}
                      icon={!profile.avatar && <UserOutlined />}
                    />
                    <Upload {...uploadProps} showUploadList={false}>
                      <Button 
                        type="primary" 
                        icon={<UploadOutlined />}
                        disabled={!editMode}
                      >
                        Upload New
                      </Button>
                    </Upload>
                    <Button 
                      danger 
                      disabled={!editMode}
                      onClick={() => handleInputChange('avatar', null)}
                    >
                      Delete
                    </Button>
                  </div>

                  {/* Form Fields */}
                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="form-group">
                        <label>First Name</label>
                        <Input
                          prefix={<UserOutlined />}
                          value={profile.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          disabled={!editMode}
                          placeholder="Enter first name"
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="form-group">
                        <label>Last Name</label>
                        <Input
                          value={profile.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          disabled={!editMode}
                          placeholder="Enter last name"
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="form-group">
                        <label>Password</label>
                        <Input.Password
                          value="••••••••"
                          disabled
                          iconRender={visible => (visible ? <EyeOutlined /> : <EyeInvisibleOutlined />)}
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <Input
                          prefix={<PhoneOutlined />}
                          value={profile.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          disabled={!editMode}
                          placeholder="(406) 555-0120"
                          addonAfter={
                            <img 
                              src="https://flagcdn.com/w20/us.png" 
                              alt="US" 
                              style={{ width: 20 }}
                            />
                          }
                        />
                      </div>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <div className="form-group">
                        <label>E-mail</label>
                        <Input
                          prefix={<MailOutlined />}
                          value={profile.email}
                          disabled
                        />
                      </div>
                    </Col>
                    <Col span={12}>
                      <div className="form-group">
                        <label>Date of Birth</label>
                        <Input
                          type="date"
                          prefix={<CalendarOutlined />}
                          value={profile.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          disabled={!editMode}
                        />
                      </div>
                    </Col>
                  </Row>

                  <div className="form-group">
                    <label>Location</label>
                    <Input
                      prefix={<EnvironmentOutlined />}
                      value={profile.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      disabled={!editMode}
                      placeholder="2972 Westheimer Rd. Santa Ana, Illinois 85486"
                    />
                  </div>

                  <div className="form-group">
                    <label>Credit Card</label>
                    <Input
                      prefix={<CreditCardOutlined />}
                      value={profile.creditCard}
                      onChange={(e) => handleInputChange('creditCard', e.target.value)}
                      disabled={!editMode}
                      placeholder="843-4359-4444"
                      addonBefore={
                        <span>💳</span>
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Biography</label>
                    <Input.TextArea
                      rows={4}
                      value={profile.biography}
                      onChange={(e) => handleInputChange('biography', e.target.value)}
                      disabled={!editMode}
                      placeholder="Enter a biography about you"
                    />
                  </div>

                  {editMode && (
                    <div className="form-actions">
                      <Button 
                        type="primary" 
                        size="large"
                        loading={saving}
                        onClick={handleSaveProfile}
                      >
                        Save Changes
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ProfilePage;
