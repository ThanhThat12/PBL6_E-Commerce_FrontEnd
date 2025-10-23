# Hướng dẫn tích hợp API Shop - Frontend & Backend

## ✅ Đã hoàn thành tích hợp

### 1. API Lấy thông tin Shop
**Endpoint:** `GET http://localhost:8081/api/seller/shop`

**Response từ Backend:**
```json
{
    "status": 200,
    "error": null,
    "message": "Lấy thông tin shop thành công",
    "data": {
        "id": 1,
        "name": "Tubao",
        "address": "binh duong",
        "description": "may la ai",
        "status": "ACTIVE",
        "createdAt": "2025-10-16T16:26:41"
    }
}
```

**Xử lý ở Frontend (`shopService.js`):**
```javascript
async getShopInfo() {
  const response = await fetch('http://localhost:8081/api/seller/shop', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result = await response.json();
  
  if (result.status === 200 && result.data) {
    // Chuyển đổi từ camelCase (backend) sang snake_case (frontend)
    return {
      id: result.data.id,
      name: result.data.name,
      address: result.data.address,
      description: result.data.description,
      status: result.data.status,        // ACTIVE, INACTIVE, SUSPENDED
      created_at: result.data.createdAt, // ISO format
    };
  }
  
  throw new Error(result.message || 'Không thể lấy thông tin shop');
}
```

### 2. Mapping Status Values

**Backend → Frontend:**
- `ACTIVE` → Hiển thị tag màu xanh "Đang hoạt động"
- `INACTIVE` → Hiển thị tag màu cam "Tạm ngưng"
- `SUSPENDED` → Hiển thị tag màu đỏ "Bị đình chỉ"

**Code xử lý:**
```javascript
const getStatusTag = (status) => {
  const normalizedStatus = status?.toUpperCase();
  
  const statusConfig = {
    ACTIVE: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đang hoạt động' },
    INACTIVE: { color: 'orange', icon: <ExclamationCircleOutlined />, text: 'Tạm ngưng' },
    SUSPENDED: { color: 'red', icon: <CloseCircleOutlined />, text: 'Bị đình chỉ' },
  };
  
  const config = statusConfig[normalizedStatus] || statusConfig.ACTIVE;
  return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
};
```

### 3. Format DateTime

**Backend gửi:** `"2025-10-16T16:26:41"` (ISO 8601)

**Frontend hiển thị:** `"16/10/2025 16:26"`

**Code format:**
```javascript
const formatDateTime = (dateTime) => {
  if (!dateTime) return '';
  const date = new Date(dateTime);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
```

---

## 🔄 Cần Backend implement tiếp

### API Cập nhật thông tin Shop
**Endpoint:** `PUT http://localhost:8081/api/seller/shop`

**Request từ Frontend:**
```json
{
  "name": "Tubao Sports & Fashion",
  "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  "description": "Chuyên cung cấp các sản phẩm thể thao...",
  "status": "ACTIVE"
}
```

**Expected Response:**
```json
{
  "status": 200,
  "error": null,
  "message": "Cập nhật thông tin shop thành công",
  "data": {
    "id": 1,
    "name": "Tubao Sports & Fashion",
    "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    "description": "Chuyên cung cấp các sản phẩm thể thao...",
    "status": "ACTIVE",
    "createdAt": "2025-10-16T16:26:41"
  }
}
```

**Validation Rules (Backend cần check):**
```javascript
{
  name: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: "Tên shop phải có từ 3-100 ký tự"
  },
  address: {
    required: true,
    minLength: 10,
    message: "Địa chỉ phải có ít nhất 10 ký tự"
  },
  description: {
    required: true,
    minLength: 20,
    maxLength: 500,
    message: "Mô tả phải có từ 20-500 ký tự"
  },
  status: {
    required: true,
    enum: ["ACTIVE", "INACTIVE"],
    message: "Trạng thái không hợp lệ"
    // Note: Seller không được phép tự set SUSPENDED
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "errors": {
    "name": "Tên shop phải có ít nhất 3 ký tự",
    "address": "Địa chỉ phải có ít nhất 10 ký tự"
  }
}
```

---

## 🔐 Authentication (TODO)

Hiện tại API chưa có authentication. Khi implement, cần:

### 1. Thêm JWT Token vào headers
```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### 2. Backend verify token
- Lấy `owner_id` từ JWT token
- Filter shop theo `owner_id` để đảm bảo seller chỉ xem/sửa shop của mình

### 3. Xử lý lỗi 401 Unauthorized
```javascript
if (response.status === 401) {
  // Xóa token và redirect về login page
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

---

## 📱 UI Components đã tích hợp

### 1. ShopHeader Component
**Location:** `src/components/Seller/Shop/ShopHeader.jsx`

**Features:**
- ✅ Hiển thị icon shop (gradient blue)
- ✅ Hiển thị tên shop
- ✅ Hiển thị trạng thái với Tag màu sắc
- ✅ Hiển thị địa chỉ với icon
- ✅ Hiển thị ngày tạo (format Việt Nam)
- ✅ Hiển thị mô tả
- ✅ Modal chỉnh sửa thông tin
- ✅ Form validation
- ✅ Loading state khi submit
- ✅ Success/Error messages

### 2. MyShopPage Component
**Location:** `src/pages/Seller/MyShopPage.jsx`

**Features:**
- ✅ Fetch shop data khi mount
- ✅ Refresh data sau khi update
- ✅ Error handling
- ✅ Loading states

---

## 🧪 Testing

### Test API GET /api/seller/shop
```bash
curl -X GET http://localhost:8081/api/seller/shop \
  -H "Content-Type: application/json"
```

**Expected:**
- ✅ Status 200
- ✅ Trả về data với đầy đủ 5 fields
- ✅ Status là ACTIVE/INACTIVE/SUSPENDED (uppercase)
- ✅ createdAt là ISO format

### Test trên Frontend
1. Mở trang My Shop: `http://localhost:3000/seller/shop`
2. Kiểm tra hiển thị:
   - ✅ Tên shop
   - ✅ Địa chỉ
   - ✅ Mô tả
   - ✅ Trạng thái (với màu sắc đúng)
   - ✅ Ngày tạo (format dd/mm/yyyy hh:mm)
3. Click "Chỉnh sửa Shop"
4. Form hiển thị đúng dữ liệu hiện tại
5. Thử submit (sau khi backend implement PUT API)

---

## 🐛 Troubleshooting

### Lỗi: Cannot fetch shop info
**Nguyên nhân:** Backend chưa chạy hoặc CORS issue

**Giải pháp:**
1. Kiểm tra backend đang chạy ở port 8081
2. Kiểm tra CORS configuration trong Spring Boot:
```java
@CrossOrigin(origins = "http://localhost:3000")
```

### Lỗi: Status không hiển thị màu đúng
**Nguyên nhân:** Backend trả về status khác format (ví dụ: "active" thay vì "ACTIVE")

**Giải pháp:** Code frontend đã xử lý với `toUpperCase()`, nên sẽ work với cả lowercase

### Lỗi: Ngày tạo hiển thị sai
**Nguyên nhân:** Timezone khác nhau

**Giải pháp:** Backend nên trả về ISO 8601 format với timezone (ví dụ: "2025-10-16T16:26:41+07:00")

---

## 📝 Notes

1. **Status values:**
   - Frontend gửi: `ACTIVE`, `INACTIVE`
   - Backend chấp nhận: `ACTIVE`, `INACTIVE`
   - Chỉ Admin mới có quyền set `SUSPENDED`

2. **DateTime format:**
   - Backend → Frontend: ISO 8601 (`2025-10-16T16:26:41`)
   - Display: `16/10/2025 16:26`

3. **Field mapping:**
   - Backend `createdAt` → Frontend `created_at`
   - Các field khác giữ nguyên tên

4. **Security:**
   - Sau này cần thêm JWT authentication
   - Backend verify owner_id từ token
   - Frontend lưu token trong localStorage

---

## ✨ Next Steps

1. ✅ GET API - Đã tích hợp xong
2. ⏳ PUT API - Chờ backend implement
3. ⏳ Authentication - Chờ backend có JWT
4. ⏳ API lấy sản phẩm theo shop_id
