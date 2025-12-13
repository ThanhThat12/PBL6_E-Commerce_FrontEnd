# Frontend Guide: User Profile Management

**Updated**: 2025-12-13  
**Backend Version**: Spring Boot 3.5.4+, Java 21

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [API Endpoints](#api-endpoints)
3. [Data Models (DTOs)](#data-models-dtos)
4. [React Implementation](#react-implementation)
5. [Avatar Upload](#avatar-upload)
6. [Error Handling](#error-handling)
7. [Testing Checklist](#testing-checklist)

---

## Overview

This guide covers the complete user profile management feature (excluding address management). The profile system includes:
- ✅ View current user profile
- ✅ Update profile fields (name, email, phone)
- ✅ Upload/delete avatar images
- ✅ Validation and duplicate checks
- ❌ Address management (separate API)

**Base URL**: `/api/profile`

---

## API Endpoints

### 1. Get Current User Profile
```
GET /api/profile/me
Authorization: Bearer <JWT_TOKEN>
```

**Response 200 OK**:
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin hồ sơ thành công",
  "data": {
    "id": 123,
    "username": "user123",
    "email": "user@example.com",
    "phoneNumber": "+84912345678",
    "fullName": "Nguyen Van A",
    "role": "BUYER",
    "avatarUrl": "https://res.cloudinary.com/.../avatar.jpg",
    "activated": true,
    "createdAt": "2025-01-01T10:00:00",
    "updatedAt": "2025-12-13T15:30:00"
  }
}
```

### 2. Update User Profile
```
PUT /api/profile/me
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "fullName": "Nguyen Van A Updated",
  "email": "newemail@example.com",
  "phone": "+84987654321",
  "avatarUrl": "https://res.cloudinary.com/.../new-avatar.jpg"
}
```

**Validation Rules**:
- `fullName`: Required, 2-100 characters
- `email`: Optional, valid email format
- `phone`: Optional, 9-20 characters
- `avatarUrl`: Optional, valid URL

**Response 200 OK**:
```json
{
  "statusCode": 200,
  "message": "Cập nhật hồ sơ thành công",
  "data": {
    "id": 123,
    "username": "user123",
    "email": "newemail@example.com",
    "phoneNumber": "+84987654321",
    "fullName": "Nguyen Van A Updated",
    "role": "BUYER",
    "avatarUrl": "https://res.cloudinary.com/.../new-avatar.jpg",
    "activated": true,
    "createdAt": "2025-01-01T10:00:00",
    "updatedAt": "2025-12-13T16:00:00"
  }
}
```

**Error 400 Bad Request** (Duplicate Email):
```json
{
  "statusCode": 400,
  "error": "Email đã được sử dụng bởi tài khoản khác",
  "message": "Cập nhật hồ sơ thất bại"
}
```

**Error 400 Bad Request** (Duplicate Phone):
```json
{
  "statusCode": 400,
  "error": "Số điện thoại đã được sử dụng bởi tài khoản khác",
  "message": "Cập nhật hồ sơ thất bại"
}
```

### 3. Upload Avatar
```
POST /api/profile/avatar
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

**Request Body** (FormData):
```
file: <image file> (jpg, png, gif)
```

**Response 200 OK**:
```json
{
  "statusCode": 200,
  "message": "Tải lên ảnh đại diện thành công",
  "data": {
    "avatarUrl": "https://res.cloudinary.com/.../avatar_abc123.jpg",
    "publicId": "avatars/avatar_abc123"
  }
}
```

### 4. Delete Avatar
```
DELETE /api/profile/avatar
Authorization: Bearer <JWT_TOKEN>
```

**Response 200 OK**:
```json
{
  "statusCode": 200,
  "message": "Xóa ảnh đại diện thành công",
  "data": true
}
```

**Error 400 Bad Request**:
```json
{
  "statusCode": 400,
  "error": "Không có ảnh đại diện để xóa",
  "message": "Thất bại"
}
```

---

## Data Models (DTOs)

### UserProfile (Response)
```typescript
export type UserProfile = {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  role: 'BUYER' | 'SELLER' | 'ADMIN';
  avatarUrl?: string;
  activated: boolean;
  createdAt: string; // ISO 8601 format
  updatedAt: string;
};
```

### UpdateUserProfile (Request)
```typescript
export type UpdateUserProfile = {
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
};
```

### AvatarUploadResponse
```typescript
export type AvatarUploadResponse = {
  avatarUrl: string;
  publicId: string;
};
```

---

## React Implementation

### Complete Profile Hook with Avatar Upload

```typescript
// hooks/useUserProfile.ts
import { useState, useCallback } from 'react';
import axios from 'axios';

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  activated: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserProfile = {
  fullName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
};

export type AvatarUploadResponse = {
  avatarUrl: string;
  publicId: string;
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/profile/me');
      setProfile(res.data.data);
      return res.data.data as UserProfile;
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || 'Không thể tải thông tin hồ sơ';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update profile
  const updateProfile = useCallback(async (payload: UpdateUserProfile) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.put('/api/profile/me', payload);
      setProfile(res.data.data);
      return res.data.data as UserProfile;
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || 'Không thể cập nhật hồ sơ';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload avatar
  const uploadAvatar = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post<{ data: AvatarUploadResponse }>('/api/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        },
      });

      // Update local profile with new avatar
      if (profile) {
        setProfile({ ...profile, avatarUrl: res.data.data.avatarUrl });
      }

      setUploadProgress(100);
      return res.data.data;
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || 'Không thể tải lên ảnh đại diện';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  // Delete avatar
  const deleteAvatar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete('/api/profile/avatar');
      
      // Update local profile (remove avatar)
      if (profile) {
        setProfile({ ...profile, avatarUrl: undefined });
      }
      
      return true;
    } catch (e: any) {
      const errorMsg = e?.response?.data?.error || 'Không thể xóa ảnh đại diện';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  return {
    profile,
    loading,
    error,
    uploadProgress,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    deleteAvatar,
  };
}
```

---

## Avatar Upload

### Avatar Upload Component

```tsx
// components/AvatarUpload.tsx
import React, { useRef, useState } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';

export function AvatarUpload() {
  const { profile, uploadAvatar, deleteAvatar, uploadProgress, loading } = useUserProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
      alert('Chỉ chấp nhận file ảnh (jpg, png, gif)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước file tối đa 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      await uploadAvatar(file);
      alert('Tải lên ảnh đại diện thành công');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc muốn xóa ảnh đại diện?')) return;

    try {
      await deleteAvatar();
      setPreviewUrl(null);
      alert('Xóa ảnh đại diện thành công');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="avatar-upload">
      <div className="avatar-preview">
        <img
          src={previewUrl || profile?.avatarUrl || '/default-avatar.png'}
          alt="Avatar"
          className="w-32 h-32 rounded-full object-cover"
        />
      </div>

      {loading && (
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
          <span>{uploadProgress}%</span>
        </div>
      )}

      <div className="avatar-actions">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="btn-primary"
        >
          {profile?.avatarUrl ? 'Thay đổi ảnh' : 'Tải lên ảnh'}
        </button>

        {profile?.avatarUrl && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="btn-danger"
          >
            Xóa ảnh
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
}
```

---

## Error Handling

### Common Error Scenarios

```typescript
// utils/profileErrors.ts
export const PROFILE_ERRORS = {
  DUPLICATE_EMAIL: 'Email đã được sử dụng bởi tài khoản khác',
  DUPLICATE_PHONE: 'Số điện thoại đã được sử dụng bởi tài khoản khác',
  INVALID_EMAIL: 'Email không hợp lệ',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',
  FILE_TOO_LARGE: 'Kích thước file quá lớn (tối đa 5MB)',
  INVALID_FILE_TYPE: 'Chỉ chấp nhận file ảnh (jpg, png, gif)',
  NETWORK_ERROR: 'Lỗi kết nối mạng',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn',
};

export function handleProfileError(error: any): string {
  const statusCode = error?.response?.status;
  const errorMessage = error?.response?.data?.error;

  if (statusCode === 401) return PROFILE_ERRORS.UNAUTHORIZED;
  if (statusCode === 400) {
    if (errorMessage?.includes('Email')) return PROFILE_ERRORS.DUPLICATE_EMAIL;
    if (errorMessage?.includes('điện thoại')) return PROFILE_ERRORS.DUPLICATE_PHONE;
    return errorMessage || 'Dữ liệu không hợp lệ';
  }
  if (!error?.response) return PROFILE_ERRORS.NETWORK_ERROR;

  return errorMessage || 'Đã xảy ra lỗi';
}
```

### Error Toast Component

```tsx
// components/ProfileForm.tsx (excerpt)
import { toast } from 'react-hot-toast'; // or your toast library
import { handleProfileError } from '../utils/profileErrors';

const handleSubmit = async (data: UpdateUserProfile) => {
  try {
    await updateProfile(data);
    toast.success('Cập nhật hồ sơ thành công');
  } catch (err: any) {
    const errorMsg = handleProfileError(err);
    toast.error(errorMsg);
  }
};
```

---

## Testing Checklist

### Backend API Tests
- [ ] GET `/api/profile/me` returns authenticated user profile
- [ ] PUT `/api/profile/me` updates profile correctly
- [ ] PUT `/api/profile/me` rejects duplicate email (400)
- [ ] PUT `/api/profile/me` rejects duplicate phone (400)
- [ ] PUT `/api/profile/me` validates email format
- [ ] POST `/api/profile/avatar` uploads image to Cloudinary
- [ ] POST `/api/profile/avatar` deletes old avatar before uploading new one
- [ ] DELETE `/api/profile/avatar` removes avatar from Cloudinary
- [ ] All endpoints return 401 for unauthenticated requests

### Frontend Integration Tests
- [ ] Profile form loads current user data on mount
- [ ] Form submission updates profile and shows success message
- [ ] Duplicate email error displays correct Vietnamese message
- [ ] Duplicate phone error displays correct Vietnamese message
- [ ] Avatar upload shows progress bar during upload
- [ ] Avatar preview updates immediately after upload
- [ ] Avatar delete confirmation dialog appears
- [ ] File size validation prevents >5MB uploads
- [ ] File type validation rejects non-image files
- [ ] Error messages clear when user retries

### Manual Testing Scenarios
1. **Update Profile**: Change name, email, phone → verify updates persist
2. **Duplicate Email**: Try using another user's email → see error
3. **Duplicate Phone**: Try using another user's phone → see error
4. **Avatar Upload**: Upload 1MB image → see progress → verify Cloudinary URL
5. **Avatar Delete**: Delete avatar → verify null in profile
6. **Large File**: Try uploading 10MB image → see validation error
7. **Wrong File Type**: Try uploading PDF → see validation error
8. **Session Expiry**: Let token expire → try update → see 401 redirect

---

## Example: Complete Profile Page

```tsx
// pages/ProfilePage.tsx
import React, { useEffect, useState } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';
import { AvatarUpload } from '../components/AvatarUpload';
import { toast } from 'react-hot-toast';

export function ProfilePage() {
  const { profile, loading, error, fetchProfile, updateProfile } = useUserProfile();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phoneNumber || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Cập nhật hồ sơ thành công');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading && !profile) return <div>Đang tải...</div>;
  if (error && !profile) return <div>Lỗi: {error}</div>;

  return (
    <div className="profile-page max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Thông tin cá nhân</h1>

      <div className="mb-8">
        <AvatarUpload />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên đầy đủ</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            minLength={2}
            maxLength={100}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Số điện thoại</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            minLength={9}
            maxLength={20}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## Additional Notes

### Backend Validations
- Email uniqueness checked across all users
- Phone uniqueness checked across all users
- Old avatar automatically deleted when uploading new one
- User entity updated in transaction (rollback on error)

### Frontend Best Practices
- Always trim whitespace before submitting
- Validate file size/type before upload
- Show upload progress for better UX
- Use optimistic UI updates where appropriate
- Handle network errors gracefully
- Clear error messages on retry

### Security Considerations
- All endpoints require JWT authentication
- Avatar uploads go through Cloudinary (not stored locally)
- Old avatars deleted to prevent orphaned files
- Validation prevents malicious file uploads

---

**Last Updated**: 2025-12-13  
**Status**: ✅ Ready for Integration  
**Backend**: Java 21 + Spring Boot 3.5.4+  
**Frontend**: React 18 + TypeScript + Axios

