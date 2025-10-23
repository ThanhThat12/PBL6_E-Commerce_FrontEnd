# 🧪 Hướng dẫn Test Hệ thống Đăng nhập & Phân quyền

## 📋 Checklist Test

### 1. Chuẩn bị Test
- [ ] Backend đang chạy tại `http://localhost:8081`
- [ ] Frontend đang chạy tại `http://localhost:3000`
- [ ] Tài khoản test đã tồn tại trong database với role khác nhau

### 2. Test Cases cho Đăng nhập

#### ✅ Test Case 1: Đăng nhập thành công với SELLER (role = 1)
```
1. Mở http://localhost:3000/login
2. Nhập username/password của seller
3. Click "Đăng nhập"
4. Mở Developer Tools → Console
5. Kiểm tra logs:
   - ✅ "🔐 Attempting login with: {username: 'xxx', password: '***'}"
   - ✅ "✅ Login response:" (status 200)
   - ✅ "🔑 Token received:" (JWT token)
   - ✅ "👤 Extracted user:" (user object với role: 1)
   - ✅ "🎭 User role: 1 (SELLER)"
   - ✅ "→ Redirecting to seller dashboard"
6. Kết quả mong đợi:
   - Được redirect tới "/seller/dashboard"
   - Không có lỗi hiển thị
```

#### ✅ Test Case 2: Đăng nhập thành công với BUYER (role = 2)
```
1. Đăng nhập với tài khoản buyer
2. Kiểm tra logs có "🎭 User role: 2 (BUYER)"
3. Kết quả: Redirect tới "/customer/home"
```

#### ✅ Test Case 3: Đăng nhập thành công với ADMIN (role = 0)
```
1. Đăng nhập với tài khoản admin
2. Kiểm tra logs có "🎭 User role: 0 (ADMIN)"
3. Kết quả: Redirect tới "/admin/dashboard"
```

#### ❌ Test Case 4: Đăng nhập thất bại
```
1. Nhập sai username/password
2. Kiểm tra logs có "❌ Login error:"
3. Kết quả: Hiển thị thông báo lỗi phù hợp
```

### 3. Test Cases cho JWT Token

#### ✅ Test Case 5: JWT Token Structure
```
1. Đăng nhập thành công
2. Mở Developer Tools → Application → Local Storage
3. Kiểm tra:
   - ✅ Key "token" có giá trị JWT
   - ✅ Key "user" có object user với role number
4. Copy JWT token
5. Paste vào https://jwt.io để decode
6. Kiểm tra payload có:
   - ✅ "sub": username
   - ✅ "authorities": "SELLER"/"ADMIN"/"BUYER"
   - ✅ "iat", "exp": timestamp
```

#### ✅ Test Case 6: Auto Login khi reload
```
1. Đăng nhập thành công
2. Reload trang (F5)
3. Kiểm tra logs có "🔄 Restored auth from localStorage:"
4. Kết quả: Vẫn đăng nhập, không quay về login page
```

### 4. Test Cases cho Phân quyền

#### ✅ Test Case 7: Protected Routes
```
1. Chưa đăng nhập, truy cập "/seller/dashboard"
2. Kết quả: Redirect về "/login"

3. Đăng nhập với BUYER (role = 2)
4. Truy cập "/seller/dashboard"
5. Kết quả: Redirect về "/customer/home"

6. Đăng nhập với SELLER (role = 1)
7. Truy cập "/seller/dashboard"
8. Kết quả: Hiển thị seller dashboard
```

#### ✅ Test Case 8: API Calls với JWT
```
1. Đăng nhập thành công
2. Mở Network tab trong Developer Tools
3. Thực hiện một API call (VD: gọi statistics API)
4. Kiểm tra Request Headers có:
   - ✅ "Authorization: Bearer eyJhbGc..."
```

### 5. Backend Response Testing

#### ✅ Test Case 9: Backend Response Format
```
Kiểm tra response từ /api/authenticate:
{
  "status": 200,
  "error": null,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9..."
  }
}

Decode JWT token payload:
{
  "sub": "username",
  "authorities": "SELLER",    // String: SELLER/ADMIN/BUYER
  "iat": 1760940924,
  "exp": 1761027324
}
```

### 6. Error Handling Testing

#### ❌ Test Case 10: Network Errors
```
1. Tắt backend server
2. Thử đăng nhập
3. Kết quả: Hiển thị lỗi "Lỗi máy chủ! Vui lòng thử lại sau."
```

#### ❌ Test Case 11: Invalid Token
```
1. Đăng nhập thành công
2. Manually thay đổi token trong localStorage
3. Reload page
4. Kết quả: Token invalid, redirect về login
```

## 🔍 Debug Commands

### Console Commands để test:
```javascript
// 1. Kiểm tra user hiện tại
console.log('Current user:', JSON.parse(localStorage.getItem('user')));

// 2. Kiểm tra token
console.log('Token:', localStorage.getItem('token'));

// 3. Decode token manually
const token = localStorage.getItem('token');
const payload = atob(token.split('.')[1]);
console.log('JWT Payload:', JSON.parse(payload));

// 4. Clear auth
localStorage.removeItem('token');
localStorage.removeItem('user');

// 5. Test role functions (trong component có useAuth)
const { user, isSeller, isAdmin, isCustomer } = useAuth();
console.log('Role check:', {
  user: user,
  isSeller: isSeller(),
  isAdmin: isAdmin(), 
  isCustomer: isCustomer()
});
```

## 📊 Expected Log Output

### Successful Login Flow:
```
🔐 Attempting login with: {username: 'seller1', password: '***'}
✅ Login response: {data: {status: 200, message: 'Login successful', data: {token: '...'}}}
📦 Response data: {status: 200, error: null, message: 'Login successful', data: {token: '...'}}
🔑 Token received: eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0b2FpdG9haS...
JWT Payload: {sub: 'toaitoai', authorities: 'SELLER', iat: 1760940924, exp: 1761027324}
Extracted user: {id: 'toaitoai', username: 'toaitoai', role: 1, authorities: 'SELLER', name: 'toaitoai'}
👤 Extracted user: {id: 'toaitoai', username: 'toaitoai', role: 1, authorities: 'SELLER'}
🎭 User role: 1 (SELLER)
💾 Saving auth: {user: {...}, token: 'eyJhbGciOiJIUzI1NiJ9...'}
→ Redirecting to seller dashboard
```

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot extract user info from token"
**Nguyên nhân**: JWT payload thiếu field `authorities` hoặc format sai
**Giải pháp**: Kiểm tra backend JWT generation

### Issue 2: "Tên đăng nhập hoặc mật khẩu không đúng"
**Nguyên nhân**: Backend trả về 401 Unauthorized
**Giải pháp**: Kiểm tra credentials trong database

### Issue 3: Redirect về "/login" sau khi đăng nhập
**Nguyên nhân**: Role mapping thất bại hoặc ProtectedRoute config sai
**Giải pháp**: Kiểm tra role number trong user object

### Issue 4: API calls không có Authorization header
**Nguyên nhân**: Axios interceptor chưa được setup
**Giải pháp**: Import axiosConfig và sử dụng axiosInstance

## 📋 Deployment Checklist

Trước khi deploy production:
- [ ] Thay đổi JWT secret key
- [ ] Set expiration time phù hợp
- [ ] Remove console.log statements
- [ ] Test với HTTPS
- [ ] Validate CORS settings
- [ ] Test auto-refresh token (nếu có)

---

**Date**: 21/10/2025  
**Version**: 1.0.0