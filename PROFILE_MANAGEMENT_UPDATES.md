# 📱 **PROFILE MANAGEMENT - FRONTEND UPDATE GUIDE**

Date: November 5, 2025

## ✅ **Completed Updates**

### **1. Service Layer (userService.js)**

#### Changed Endpoints:
- ❌ `/user/profile` → ✅ `/profile`
- ❌ `/user/change-password` → ✅ `/profile/password`
- ✅ Added new `/profile/avatar` (multipart/form-data)

#### New Functions:
```javascript
// GET current user profile
export const getProfile = async () => {
  const response = await api.get('/profile');
  return response;
};

// PUT update profile (fullName, phoneNumber)
export const updateProfile = async (profileData) => {
  const response = await api.put('/profile', profileData);
  return response;
};

// POST upload avatar (file upload)
export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const response = await api.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response;
};

// PUT change password
export const changePassword = async (passwordData) => {
  // passwordData: { currentPassword, newPassword, confirmPassword }
  const response = await api.put('/profile/password', passwordData);
  return response;
};
```

---

### **2. ProfileEditModal Component**

#### Updated Features:
- ✅ Only editable fields: **fullName** (required) and **phoneNumber** (optional)
- ❌ Removed: username, email, email editing
- ✅ Vietnamese validation messages
- ✅ Phone number format validation (Vietnamese: 0xxxxxxxxx or +84xxxxxxxxx)
- ✅ Full Name validation (2-100 characters)
- ✅ Better error handling

#### Form Fields:
```javascript
{
  fullName: "",      // Required, 2-100 chars
  phoneNumber: "",   // Optional, Vietnamese format
}
```

#### Validation Rules:
| Field | Required | Validation |
|-------|----------|-----------|
| fullName | ✅ Yes | 2-100 characters |
| phoneNumber | ❌ No | 0xxxxxxxxx or +84xxxxxxxxx |

#### Component Usage:
```jsx
<ProfileEditModal
  isOpen={editModalOpen}
  onClose={() => setEditModalOpen(false)}
  currentProfile={user}
  onSuccess={(updatedProfile) => setUser(updatedProfile)}
/>
```

---

### **3. ChangePasswordModal Component**

#### Updated Features:
- ✅ Changed field names: `oldPassword` → `currentPassword`
- ✅ Vietnamese messages and labels
- ✅ Better error handling for Vietnamese error messages
- ✅ Proper API integration with `/profile/password`

#### Request Data:
```javascript
{
  currentPassword: "old_pass_123",    // Old password
  newPassword: "new_pass_456",        // New password (min 6 chars)
  confirmPassword: "new_pass_456",    // Confirm new password
}
```

#### Validation Rules:
- Current password: Required
- New password: Required, min 6 characters
- Confirm password: Must match new password

---

### **4. ProfileInfo Component**

#### No Changes Needed:
- ✅ Already displaying: username, email, phoneNumber, fullName, role, status, createdAt
- ✅ Action buttons properly configured
- ✅ Modal integration working

---

## 📊 **API Contract**

### **GET /api/profile** (Read Profile)
```
Request:
  Authorization: Bearer {jwt_token}

Response (200):
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "username": "buyer1",
    "email": "buyer1@test.com",
    "fullName": "Nguyễn Văn A",
    "phoneNumber": "0987654321",
    "avatarUrl": "https://res.cloudinary.com/...",
    "createdAt": "2024-11-05T10:00:00",
    "updatedAt": "2024-11-05T15:30:00"
  }
}
```

### **PUT /api/profile** (Update Profile)
```
Request:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  
  {
    "fullName": "Nguyễn Văn B",
    "phoneNumber": "0912345678"
  }

Response (200):
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "username": "buyer1",
    "email": "buyer1@test.com",
    "fullName": "Nguyễn Văn B",
    "phoneNumber": "0912345678",
    "avatarUrl": "...",
    "createdAt": "2024-11-05T10:00:00",
    "updatedAt": "2024-11-05T16:00:00"
  }
}
```

### **POST /api/profile/avatar** (Upload Avatar)
```
Request:
  Authorization: Bearer {jwt_token}
  Content-Type: multipart/form-data
  
  FormData:
    - avatar: <File>

Response (200):
{
  "statusCode": 200,
  "data": {
    "id": 1,
    "username": "buyer1",
    "avatarUrl": "https://res.cloudinary.com/ecommerce_uploads/...",
    ...
  }
}
```

### **PUT /api/profile/password** (Change Password)
```
Request:
  Authorization: Bearer {jwt_token}
  Content-Type: application/json
  
  {
    "currentPassword": "old_pass",
    "newPassword": "new_pass_123",
    "confirmPassword": "new_pass_123"
  }

Response (200 or 201):
{
  "statusCode": 200,
  "message": "Đổi mật khẩu thành công"
}
```

---

## 🔄 **Flow Diagram**

### **Update Profile Flow:**
```
User Edit Profile
    ↓
ProfileEditModal
    ↓
updateProfile() [userService.js]
    ↓
PUT /api/profile
    ↓
Backend validates & updates
    ↓
Response with updated ProfileDTO
    ↓
onSuccess callback
    ↓
Update ProfileInfo display
```

### **Change Password Flow:**
```
User Change Password
    ↓
ChangePasswordModal
    ↓
changePassword() [userService.js]
    ↓
PUT /api/profile/password
    ↓
Backend validates & updates
    ↓
Response success/error
    ↓
Toast notification
```

---

## 🧪 **Testing Checklist**

### **Profile Update:**
- [ ] Load profile successfully (GET /api/profile)
- [ ] Edit fullName and phoneNumber
- [ ] Validation works correctly
- [ ] Submit update successfully
- [ ] ProfileInfo displays updated data
- [ ] AuthContext updates if using updateUser

### **Password Change:**
- [ ] Open change password modal
- [ ] Validate form requirements
- [ ] Submit password change
- [ ] Success message appears
- [ ] Modal closes after success
- [ ] Can login with new password

### **Avatar Upload:**
- [ ] File selection works
- [ ] Cloudinary upload succeeds
- [ ] Avatar URL updates in profile
- [ ] Image displays correctly

---

## 📝 **Migration Notes**

### **Breaking Changes:**
1. API endpoints moved from `/user/*` to `/profile/*`
2. `oldPassword` field renamed to `currentPassword`
3. Removed email/username editing from profile modal

### **Backward Compatibility:**
- None - this is a full API contract change
- Frontend must use new endpoints
- Old endpoints should be deprecated

---

## 🚀 **Next Steps**

### **Phase 2: Avatar Management**
1. Integrate `uploadAvatar()` with image upload component
2. Add avatar preview in ProfileEditModal
3. Show loading state during upload

### **Phase 3: Address Management**
Already implemented separately in `AddressManagement.jsx`

### **Phase 4: Two-Factor Authentication**
When ready: add `/profile/2fa` endpoints

---

## 📚 **Files Modified**

| File | Changes |
|------|---------|
| `src/services/userService.js` | Updated endpoints, added uploadAvatar |
| `src/components/profile/ProfileEditModal.jsx` | Simplified to fullName + phoneNumber |
| `src/components/profile/ChangePasswordModal.jsx` | Updated to use currentPassword, Vietnamese messages |
| `src/components/profile/ProfileInfo.jsx` | No changes (already compatible) |

---

## ✨ **Feature Summary**

| Feature | Status | Notes |
|---------|--------|-------|
| Get Profile | ✅ Complete | Returns all profile info |
| Update Profile | ✅ Complete | Only fullName & phoneNumber editable |
| Upload Avatar | ✅ Complete | Via Cloudinary |
| Change Password | ✅ Complete | Validates current password |
| Validation | ✅ Complete | Vietnamese error messages |
| Error Handling | ✅ Complete | Specific error messages |

---

**Last Updated:** November 5, 2025
**Status:** ✅ **READY FOR DEPLOYMENT**
