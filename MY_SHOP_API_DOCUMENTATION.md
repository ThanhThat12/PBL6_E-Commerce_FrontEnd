# API Documentation - My Shop Page

## Tổng quan
Trang My Shop cần 2 API chính để quản lý thông tin shop của seller và lấy danh sách sản phẩm theo shop_id.

---

## 1. API Thông tin Shop

### 1.1. Lấy thông tin shop của seller
```http
GET /api/seller/shop
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response Success (200):**
```json
{
  "name": "Tubao Sports & Fashion",
  "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  "description": "Chuyên cung cấp các sản phẩm thể thao, thời trang, phụ kiện chất lượng cao với giá cả hợp lý. Cam kết hàng chính hãng 100%.",
  "status": "Active",
  "created_at": "2024-01-15 10:30:00"
}
```

**Các trường cần trả về từ bảng `shops`:**
- `name` (VARCHAR) - Tên shop
- `address` (VARCHAR) - Địa chỉ shop
- `description` (TEXT) - Mô tả shop
- `status` (VARCHAR) - Trạng thái: "Active" | "Inactive" | "Suspended"
- `created_at` (DATETIME) - Ngày tạo shop

**Lưu ý:**
- Không cần trả về: `id`, `owner_id` (dùng để filter phía backend)
- Status values:
  - `Active`: Đang hoạt động (hiển thị tag màu xanh)
  - `Inactive`: Tạm ngưng (hiển thị tag màu cam)
  - `Suspended`: Bị đình chỉ (hiển thị tag màu đỏ)

---

### 1.2. Cập nhật thông tin shop
```http
PUT /api/seller/shop
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Tubao Sports & Fashion",
  "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
  "description": "Chuyên cung cấp các sản phẩm thể thao, thời trang, phụ kiện chất lượng cao với giá cả hợp lý. Cam kết hàng chính hãng 100%.",
  "status": "Active"
}
```

**Validation Rules:**
- `name`: 
  - Required
  - Min: 3 ký tự
  - Max: 100 ký tự
- `address`:
  - Required
  - Min: 10 ký tự
- `description`:
  - Required
  - Min: 20 ký tự
  - Max: 500 ký tự
- `status`:
  - Required
  - Enum: "Active" | "Inactive"
  - Note: Seller không thể tự set "Suspended" (chỉ Admin)

**Response Success (200):**
```json
{
  "success": true,
  "message": "Cập nhật thông tin shop thành công",
  "data": {
    "name": "Tubao Sports & Fashion",
    "address": "123 Nguyễn Văn Linh, Quận 7, TP.HCM",
    "description": "Chuyên cung cấp các sản phẩm thể thao...",
    "status": "Active",
    "created_at": "2024-01-15 10:30:00"
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "name": "Tên shop phải có ít nhất 3 ký tự",
    "address": "Địa chỉ phải có ít nhất 10 ký tự"
  }
}
```

---

## 2. API Sản phẩm theo Shop

### 2.1. Lấy danh sách sản phẩm của shop
```http
GET /api/seller/products?shop_id={shop_id}
```

**Query Parameters:**
- `shop_id` (required): ID của shop
- `category` (optional): Lọc theo danh mục
- `search` (optional): Tìm kiếm theo tên sản phẩm
- `in_stock` (optional): true/false - Chỉ lấy sản phẩm còn hàng
- `price_min` (optional): Giá tối thiểu
- `price_max` (optional): Giá tối đa
- `sort_by` (optional): "price-asc" | "price-desc" | "newest" | "oldest" | "popular"
- `page` (optional): Số trang (default: 1)
- `limit` (optional): Số sản phẩm mỗi trang (default: 20)

**Example:**
```
GET /api/seller/products?shop_id=5&category=Giày dép&in_stock=true&sort_by=price-desc&page=1&limit=20
```

**Response Success (200):**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Giày thể thao Nike Air Max 2024",
      "category": "Giày dép",
      "price": 2500000,
      "discount": 15,
      "image": "https://example.com/image.jpg",
      "in_stock": true,
      "sold": 156,
      "stock": 45
    }
  ],
  "total": 128,
  "page": 1,
  "limit": 20,
  "total_pages": 7
}
```

---

## 3. Frontend Service Implementation

**File: `src/services/shopService.js`**

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const shopService = {
  // Lấy thông tin shop của seller
  async getShopInfo() {
    const response = await axios.get(`${API_BASE_URL}/seller/shop`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },

  // Cập nhật thông tin shop
  async updateShopInfo(shopData) {
    const response = await axios.put(
      `${API_BASE_URL}/seller/shop`,
      shopData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  },

  // Lấy danh sách sản phẩm theo shop_id
  async getShopProducts(shopId, filters = {}) {
    const params = new URLSearchParams({
      shop_id: shopId,
      ...filters
    });
    
    const response = await axios.get(
      `${API_BASE_URL}/seller/products?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    return response.data;
  },
};

export default shopService;
```

---

## 4. UI Components

### 4.1. ShopHeader Component
**Hiển thị:**
- Icon shop (gradient blue)
- Tên shop
- Trạng thái (Tag với màu và icon tương ứng)
- Địa chỉ (với icon EnvironmentOutlined)
- Ngày tạo (với icon CalendarOutlined)
- Mô tả shop
- Nút "Chỉnh sửa Shop"

**Modal cập nhật:**
- Form với 4 trường: name, address, description, status
- Validation theo rules đã định
- Loading state khi submit
- Success/Error message

### 4.2. ProductGrid Component
**Hiển thị:**
- Grid sản phẩm (responsive: 4 cột desktop, 2 cột tablet, 1 cột mobile)
- Mỗi card sản phẩm hiển thị: image, name, price, discount, stock, sold
- Loading skeleton khi đang fetch data
- Empty state khi không có sản phẩm

---

## 5. Database Schema Reference

### Bảng `shops`
```sql
CREATE TABLE shops (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  owner_id BIGINT NOT NULL,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);
```

**Note:**
- Frontend chỉ hiển thị: name, address, description, status, created_at
- Backend filter shop bằng owner_id từ JWT token
- Seller không được phép sửa: id, owner_id, created_at

---

## 6. Error Handling

### Common Errors:
```json
// 401 Unauthorized
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn"
}

// 403 Forbidden
{
  "success": false,
  "message": "Bạn không có quyền truy cập shop này"
}

// 404 Not Found
{
  "success": false,
  "message": "Không tìm thấy shop"
}

// 500 Server Error
{
  "success": false,
  "message": "Lỗi server, vui lòng thử lại sau"
}
```

---

## 7. Testing Checklist

### GET /api/seller/shop
- [ ] Trả về đúng thông tin shop của seller đã login
- [ ] Trả về 401 nếu không có token
- [ ] Trả về 404 nếu seller chưa có shop
- [ ] Chỉ trả về 5 trường: name, address, description, status, created_at

### PUT /api/seller/shop
- [ ] Cập nhật thành công với dữ liệu hợp lệ
- [ ] Validate name (min 3, max 100)
- [ ] Validate address (min 10)
- [ ] Validate description (min 20, max 500)
- [ ] Validate status (chỉ "Active" hoặc "Inactive")
- [ ] Không cho phép seller tự set status = "Suspended"
- [ ] Trả về 400 với message lỗi cụ thể khi validation fail

### GET /api/seller/products
- [ ] Lọc đúng sản phẩm theo shop_id
- [ ] Filter theo category hoạt động
- [ ] Search theo tên sản phẩm hoạt động
- [ ] Filter theo in_stock hoạt động
- [ ] Filter theo price range hoạt động
- [ ] Sort by hoạt động (price-asc, price-desc, newest, oldest, popular)
- [ ] Pagination hoạt động đúng
