# 🔧 Debug My Shop Page Issue

## 🔍 Vấn đề hiện tại:
- API backend `/api/seller/shop` hoạt động và trả về data chính xác
- Frontend MyShopPage không hiển thị thông tin shop

## 🛠️ Các bước debug:

### 1. Kiểm tra trong Browser Console

#### Bước 1: Mở Developer Tools
1. Mở http://localhost:3000
2. Đăng nhập với tài khoản seller
3. Vào trang "My Shop"
4. Mở F12 → Console tab

#### Bước 2: Kiểm tra logs
```javascript
// Tìm các logs này:
🔑 Added JWT token to request: /seller/shop
🏪 Fetching shop info...
✅ Shop info response: {...}
🏪 Processed shop data: {...}
```

#### Bước 3: Nếu có lỗi
```javascript
// Có thể thấy:
❌ Error fetching shop info: {...}
❌ Error response: {...}
⚠️ No token found for request: /seller/shop
```

### 2. Manual Debug Commands

#### Kiểm tra token có tồn tại không:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

#### Test API call manual:
```javascript
// Import shopService vào console (hoặc chạy trong component)
import shopService from '../services/shopService';

// Test API call
shopService.getShopInfo()
  .then(data => console.log('Shop data:', data))
  .catch(error => console.error('Error:', error));
```

#### Kiểm tra Authorization header:
```javascript
// Mở Network tab trong DevTools
// Reload trang My Shop
// Tìm request GET /api/seller/shop
// Kiểm tra Headers có "Authorization: Bearer ..." không
```

### 3. Các tình huống có thể:

#### ❌ Tình huống 1: Không có token
**Nguyên nhân**: Chưa đăng nhập hoặc token bị mất
**Giải pháp**: Đăng nhập lại

#### ❌ Tình huống 2: Token expired
**Nguyên nhân**: JWT token hết hạn
**Giải pháp**: Đăng nhập lại

#### ❌ Tình huống 3: Backend cần userId
**Nguyên nhân**: Backend expect userId từ JWT token nhưng không extract được
**Giải pháp**: Kiểm tra JWT payload có chứa userId không

#### ❌ Tình huống 4: CORS error
**Nguyên nhân**: Backend chặn request từ frontend
**Giải pháp**: Cấu hình CORS trên backend

#### ❌ Tình huống 5: Network error
**Nguyên nhân**: Backend không chạy hoặc sai port
**Giải pháp**: Kiểm tra backend running trên port 8081

### 4. Test với Postman/curl

#### GET Shop Info với token:
```bash
# Lấy token từ localStorage của browser
# Thay YOUR_JWT_TOKEN bằng token thực tế

curl -X GET "http://localhost:8081/api/seller/shop" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected Response:
```json
{
    "status": 200,
    "error": null,
    "message": "Lấy thông tin shop thành công",
    "data": {
        "id": 1,
        "name": "tao",
        "address": "binh duong",
        "description": "may la ai",
        "status": "INACTIVE",
        "createdAt": "2025-10-16T16:26:41"
    }
}
```

### 5. Quick Fix Options

#### Option 1: Reload và thử lại
```javascript
// Clear cache và reload
localStorage.clear();
location.reload();
// Đăng nhập lại
```

#### Option 2: Hard refresh
- Ctrl+F5 (Windows)
- Cmd+Shift+R (Mac)

#### Option 3: Check Network requests
1. F12 → Network tab
2. Reload My Shop page
3. Tìm request `/api/seller/shop`
4. Click để xem:
   - Request Headers có Authorization không
   - Response có data không
   - Status code là gì (200, 401, 403, 500?)

### 6. Backend Issues

Nếu frontend gửi đúng token nhưng backend vẫn lỗi:

#### JWT Token Structure:
```json
{
  "sub": "username",
  "authorities": "SELLER", 
  "userId": 123,           // ← Backend cần field này
  "iat": 1760940924,
  "exp": 1761027324
}
```

#### Backend cần validate:
1. JWT signature hợp lệ
2. Token chưa expired
3. Extract userId từ token
4. Query shop theo userId

### 7. Expected Flow:

```
Frontend (MyShopPage)
  ↓
shopService.getShopInfo()
  ↓
axiosInstance.get('/seller/shop')
  ↓ 
Request Headers: {
  Authorization: "Bearer eyJhbGc..."
}
  ↓
Backend receives request
  ↓
Extract userId from JWT token
  ↓
Query: SELECT * FROM shops WHERE user_id = userId
  ↓
Return shop data
  ↓
Frontend displays shop info
```

## 🎯 Action Items:

1. **Đăng nhập với tài khoản seller** có shop data
2. **Mở My Shop page** và check Console logs
3. **Copy JWT token** từ localStorage
4. **Test API với Postman** sử dụng token đó
5. **So sánh response** giữa Postman và browser
6. **Report kết quả** để debug tiếp

---

**Priority**: HIGH  
**Impact**: Shop functionality broken  
**Next**: Debug Console logs và Network requests