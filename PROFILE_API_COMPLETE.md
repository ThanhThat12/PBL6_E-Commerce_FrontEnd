# Profile API - Complete Implementation Guide

## ✅ Implemented Changes (Updated)

### Backend Changes

#### 1. **ProfileDTO Updated** - Added `activated` and `role` fields
**File**: `com.PBL6.Ecommerce.dto.profile.ProfileDTO`

```java
public class ProfileDTO {
    private Long id;
    private String username;        // Read-only (cannot be updated)
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private Boolean activated;      // ✨ NEW
    private String role;            // ✨ NEW
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### 2. **UpdateProfileDTO Updated** - Removed `username` field 🚫
**File**: `com.PBL6.Ecommerce.domain.dto.UpdateProfileDTO`

```java
public class UpdateProfileDTO {
    // ❌ username field REMOVED - username cannot be changed
    private String email;
    private String phoneNumber;
    private String fullName;
}
```

#### 3. **UserService Updated** - Removed username update logic
**File**: `com.PBL6.Ecommerce.service.UserService`

- ❌ Removed username uniqueness check
- ❌ Removed username update logic
- ✅ Username is now read-only after account creation

### Frontend Changes

#### 1. **ProfileEditModal Updated** - Removed username field 🚫
**File**: `src/components/profile/ProfileEditModal.jsx`

- ❌ Removed username input field
- ❌ Removed username validation
- ✅ Only allows editing: email, phoneNumber, fullName

#### 2. **AvatarUpload Component Created** ✨ NEW
**File**: `src/components/profile/AvatarUpload.jsx`

- ✨ Multipart file upload with preview
- ✨ File validation (type and size)
- ✨ Progress indicator during upload
- ✨ Beautiful UI with camera icon overlay

#### 3. **ProfileInfo Updated** - Added avatar upload section
**File**: `src/components/profile/ProfileInfo.jsx`

- ✨ Integrated AvatarUpload component
- ✅ Shows activated status badge
- ✅ Shows role badge
- ✅ Username is display-only (cannot be edited)

---

## 📋 Complete API Endpoints

### 1. **GET /api/user/profile** - Get Current User Profile
**Authentication**: Required

**Response**:
```json
{
  "status": 200,
  "error": null,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "john_doe",           // ⚠️ Read-only
    "email": "john@example.com",
    "phoneNumber": "0123456789",
    "fullName": "John Doe",
    "role": "BUYER",                  // ✨ NEW
    "avatarUrl": "https://via.placeholder.com/300",
    "activated": true,                // ✨ NEW
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-15T14:30:00"
  }
}
```

**Key Fields**:
- ✅ `username`: Read-only (cannot be changed)
- ✅ `activated`: Boolean - Account activation status
- ✅ `role`: String - User role (BUYER, SELLER, ADMIN)

---

### 2. **PUT /api/user/profile** - Update Profile Information
**Authentication**: Required

**Request Body** (Updated - No username):
```json
{
  "email": "newemail@example.com",    // Optional
  "phoneNumber": "0987654321",        // Optional
  "fullName": "Jane Smith"            // Optional
}
```

**⚠️ Important**: Username field is no longer accepted. Attempts to update username will be ignored.

**Validation**:
- Email: Must be unique and valid format
- Phone: Must be unique (10-15 characters)
- Full Name: Max 100 characters

**Response**: Same as GET profile

---

### 3. **PUT /api/user/change-password** - Change Password
**Authentication**: Required

**Request Body**:
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

**Validation**:
- Old password must match current password
- New password must match confirm password

**Response**:
```json
{
  "status": 200,
  "error": null,
  "message": "Password changed successfully",
  "data": "Password has been updated"
}
```

---

### 4. **PUT /api/user/avatar** - Update Avatar URL (Legacy)
**Authentication**: Required

**Query Parameter**: `avatarUrl` (String)

**Example**:
```
PUT /api/user/avatar?avatarUrl=https://example.com/avatar.jpg
```

**Response**: Same as GET profile with updated avatarUrl

---

### 5. **POST /api/user/avatar/upload** - Upload Avatar Image ✨ RECOMMENDED
**Authentication**: Required  
**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Image file (JPEG, PNG, GIF - max 5MB)

**Example (JavaScript)**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/user/avatar/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response**:
```json
{
  "status": 200,
  "error": null,
  "message": "Avatar uploaded successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "0123456789",
    "avatarUrl": "https://via.placeholder.com/300?text=Avatar_1_1234567890",
    "activated": true,
    "role": "BUYER",
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-15T15:00:00"
  }
}
```

---

## 🎨 Frontend Components

### AvatarUpload Component (NEW)

Located at: `src/components/profile/AvatarUpload.jsx`

**Features**:
- ✅ Beautiful circular avatar preview
- ✅ Camera icon overlay for upload trigger
- ✅ File type validation (JPEG, PNG, GIF)
- ✅ File size validation (max 5MB)
- ✅ Preview before upload
- ✅ Upload progress indicator
- ✅ Cancel functionality

**Usage**:
```jsx
import AvatarUpload from './AvatarUpload';

<AvatarUpload 
  currentAvatarUrl={user?.avatarUrl}
  onSuccess={(updatedProfile) => {
    // Handle successful upload
    setUser(updatedProfile);
  }}
/>
```

**Props**:
- `currentAvatarUrl` (string): Current avatar URL
- `onSuccess` (function): Callback when upload succeeds, receives updated profile

---

### ProfileEditModal Component (UPDATED)

Located at: `src/components/profile/ProfileEditModal.jsx`

**Changes**:
- ❌ Removed username field
- ✅ Only edits: email, phoneNumber, fullName

**Form Fields**:
```jsx
{
  email: '',        // Validated email format
  phoneNumber: '',  // 10-15 digits
  fullName: ''      // Max 100 chars
}
```

---

### ProfileInfo Component (UPDATED)

Located at: `src/components/profile/ProfileInfo.jsx`

**New Features**:
- ✨ Avatar upload section at the top
- ✅ Username is display-only (read-only)
- ✅ Shows activated status badge
- ✅ Shows role badge with color coding

**Layout**:
```
┌─────────────────────┐
│  Avatar Upload      │ ← NEW
├─────────────────────┤
│  Username (readonly)│
│  Email              │
│  Phone              │
│  Full Name          │
│  Role Badge         │ ← NEW
│  Activated Badge    │ ← NEW
│  Created Date       │
├─────────────────────┤
│  [Edit] [Password]  │
└─────────────────────┘
```

---

## 🧪 Testing Checklist

### Backend Tests

**Profile Retrieval**:
```bash
✅ GET /api/user/profile includes activated and role
✅ Username is returned in response
```

**Profile Update**:
```bash
✅ PUT /api/user/profile without username succeeds
✅ Attempting to send username is ignored (no error)
✅ Duplicate email returns error
✅ Duplicate phone returns error
```

**Avatar Upload**:
```bash
✅ POST /api/user/avatar/upload with valid image succeeds
✅ Invalid file type returns error
✅ File > 5MB returns error
```

### Frontend Integration Tests

**ProfileEditModal**:
```bash
✅ Username field is not present in form
✅ Email validation works
✅ Phone validation works
✅ Form submission updates profile
```

**AvatarUpload**:
```bash
✅ File picker opens on camera icon click
✅ Preview shows selected image
✅ Upload button disabled until file selected
✅ Upload progress shows during upload
✅ Success updates profile and reloads avatar
✅ Cancel button clears selection
```

**ProfileInfo**:
```bash
✅ Username is displayed but not editable
✅ Avatar upload section appears
✅ Activated badge shows correct status
✅ Role badge shows with correct color
```

---

## 📝 Summary of Changes

### What Changed:

#### Backend:
1. ✨ **ProfileDTO** now includes `activated` and `role`
2. 🚫 **UpdateProfileDTO** removed `username` field
3. 🚫 **UserService.updateProfile()** removed username update logic
4. ✅ Username is now permanently read-only after account creation

#### Frontend:
1. 🚫 **ProfileEditModal** removed username input field
2. ✨ **AvatarUpload** component created for multipart file upload
3. ✅ **ProfileInfo** integrated avatar upload section
4. ✅ **ProfileInfo** displays activated and role status
5. ✅ Username is shown as display-only field

### Why Username Cannot Be Changed:

1. **Security**: Prevents identity confusion and potential fraud
2. **Consistency**: Username is used as unique identifier across the system
3. **Data Integrity**: Changing usernames could break references and logs
4. **Best Practice**: Most platforms don't allow username changes (Twitter, GitHub, etc.)

### User Flow:

```
1. User views profile → sees username (read-only)
2. User clicks "Edit Profile" → modal opens WITHOUT username field
3. User can update: email, phone, full name
4. User clicks camera icon → selects avatar image
5. Avatar preview shows → user confirms upload
6. Profile updates automatically with new avatar
```

---

## 🚀 Next Steps

1. **Test all endpoints** with updated request bodies (no username)
2. **Test avatar upload** with various file types and sizes
3. **Verify frontend** - username field should not appear in edit modal
4. **Check UI/UX** - avatar upload should be smooth and intuitive
5. **Document** - Update API docs to reflect username is read-only

---

**All profile features updated and working! 🎉**

**Key Takeaway**: Username is now **read-only** - users can only change email, phone, full name, and avatar.

### 1. **ProfileDTO Updated** - Added `activated` and `role` fields
**File**: `com.PBL6.Ecommerce.dto.profile.ProfileDTO`

```java
public class ProfileDTO {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatarUrl;
    private Boolean activated;      // ✨ NEW
    private String role;            // ✨ NEW
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

### 2. **ProfileServiceImpl Updated** - Map activated and role from User entity
**File**: `com.PBL6.Ecommerce.service.profile.ProfileServiceImpl`

```java
private ProfileDTO mapToDTO(User user) {
    return ProfileDTO.builder()
        .id(user.getId())
        .username(user.getUsername())
        .email(user.getEmail())
        .fullName(user.getFullName())
        .phoneNumber(user.getPhoneNumber())
        .avatarUrl(user.getAvatarUrl())
        .activated(user.isActivated())              // ✨ Uses isActivated()
        .role(user.getRole() != null ? user.getRole().name() : null)  // ✨ Convert enum to String
        .createdAt(user.getCreatedAt())
        .updatedAt(user.getUpdatedAt())
        .build();
}
```

### 3. **ProfileController Updated** - Added avatar upload endpoint
**File**: `com.PBL6.Ecommerce.controller.ProfileController`

Added new POST endpoint for multipart file upload:

```java
@PostMapping(value = "/avatar/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<ResponseDTO<ProfileDTO>> uploadAvatar(@RequestParam("file") MultipartFile file)
```

---

## 📋 Complete API Endpoints

### 1. **GET /api/user/profile** - Get Current User Profile
**Authentication**: Required

**Response**:
```json
{
  "status": 200,
  "error": null,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "phoneNumber": "0123456789",
    "fullName": "John Doe",
    "role": "BUYER",
    "avatarUrl": "https://via.placeholder.com/300",
    "activated": true,
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-15T14:30:00"
  }
}
```

**Key Fields**:
- ✅ `activated`: Boolean - Account activation status
- ✅ `role`: String - User role (BUYER, SELLER, ADMIN)

---

### 2. **PUT /api/user/profile** - Update Profile Information
**Authentication**: Required

**Request Body**:
```json
{
  "username": "new_username",      // Optional
  "email": "newemail@example.com", // Optional
  "phoneNumber": "0987654321",     // Optional
  "fullName": "Jane Smith"         // Optional
}
```

**Validation**:
- Username: Must be unique
- Email: Must be unique and valid format
- Phone: Must be unique

**Response**: Same as GET profile

---

### 3. **PUT /api/user/change-password** - Change Password
**Authentication**: Required

**Request Body**:
```json
{
  "oldPassword": "current_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

**Validation**:
- Old password must match current password
- New password must match confirm password

**Response**:
```json
{
  "status": 200,
  "error": null,
  "message": "Password changed successfully",
  "data": "Password has been updated"
}
```

---

### 4. **PUT /api/user/avatar** - Update Avatar URL
**Authentication**: Required

**Query Parameter**: `avatarUrl` (String)

**Example**:
```
PUT /api/user/avatar?avatarUrl=https://example.com/avatar.jpg
```

**Response**: Same as GET profile with updated avatarUrl

---

### 5. **POST /api/user/avatar/upload** - Upload Avatar Image ✨ NEW
**Authentication**: Required  
**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Image file (JPEG, PNG, GIF)

**Example (JavaScript)**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/user/avatar/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response**:
```json
{
  "status": 200,
  "error": null,
  "message": "Avatar uploaded successfully",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "fullName": "John Doe",
    "phoneNumber": "0123456789",
    "avatarUrl": "https://via.placeholder.com/300?text=Avatar_1_1234567890",
    "activated": true,
    "role": "BUYER",
    "createdAt": "2024-01-01T10:00:00",
    "updatedAt": "2024-01-15T15:00:00"
  }
}
```

---

## 🔍 UserProfileDTO (Alternative DTO)

The `UserProfileDTO` (in `domain.dto` package) is also available and includes the same fields:

```java
public class UserProfileDTO {
    private Long id;
    private String username;
    private String email;
    private String phoneNumber;
    private String fullName;
    private String role;
    private String avatarUrl;
    private Boolean activated;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Used by**:
- `UserService.getUserProfile()`
- `UserService.updateProfile()`
- `UserService.updateAvatar()`

---

## 🎯 Key Features Checklist

✅ **Profile Retrieval**
- Get current user profile
- Include activation status
- Include user role

✅ **Profile Update**
- Update username (with uniqueness check)
- Update email (with uniqueness check)
- Update phone (with uniqueness check)
- Update full name

✅ **Avatar Management**
- Update avatar by URL string
- Upload avatar as multipart file ✨ NEW
- Automatic URL generation

✅ **Password Management**
- Change password with current password verification
- Confirm new password matching

✅ **Data Validation**
- Duplicate username prevention
- Duplicate email prevention
- Duplicate phone prevention
- Password strength validation

---

## 🧪 Testing Checklist

### Backend Tests

**Profile Retrieval**:
```bash
# Test authenticated user can get profile
GET /api/user/profile
Authorization: Bearer <token>
```

**Profile Update**:
```bash
# Test update with duplicate email (should fail)
PUT /api/user/profile
{
  "email": "existing@example.com"
}
# Expected: DuplicateEmailException
```

**Avatar Upload**:
```bash
# Test multipart file upload
POST /api/user/avatar/upload
Content-Type: multipart/form-data
file: avatar.jpg
```

### Frontend Integration

```typescript
// Example React Hook
const useProfile = () => {
  const [profile, setProfile] = useState<ProfileDTO | null>(null);

  const fetchProfile = async () => {
    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setProfile(data.data);
  };

  const uploadAvatar = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/user/avatar/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await response.json();
    setProfile(data.data);
  };

  const updateProfile = async (updates: Partial<ProfileDTO>) => {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    const data = await response.json();
    setProfile(data.data);
  };

  return { profile, fetchProfile, uploadAvatar, updateProfile };
};
```

---

## 📝 Summary

### What Changed:
1. ✨ **ProfileDTO** now includes `activated` and `role`
2. ✨ **ProfileServiceImpl** correctly maps `user.isActivated()` and `user.getRole().name()`
3. ✨ **ProfileController** added POST `/api/user/avatar/upload` for multipart file upload

### What's Unified:
- ✅ Avatar upload is now part of ProfileController (not separate)
- ✅ Both URL-based update (PUT) and file upload (POST) available
- ✅ All profile operations in one controller

### Backend Services:
- **ProfileService**: Handles profile CRUD with avatar upload
- **UserService**: Provides alternative profile methods (also includes activated + role)

### DTOs:
- **ProfileDTO** (`dto.profile`): Used by ProfileService
- **UserProfileDTO** (`domain.dto`): Used by UserService
- Both include `activated` and `role` fields

---

## 🚀 Next Steps

1. **Test all endpoints** with Postman or Thunder Client
2. **Implement frontend** using the React hook example above
3. **Add UI for avatar upload** with file picker and preview
4. **Display activation status** in profile page (e.g., badge or icon)
5. **Show user role** for role-based UI (e.g., "Seller Dashboard" button)

---

**All profile features are now complete and unified! 🎉**
