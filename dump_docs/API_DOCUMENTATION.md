# 📚 API Documentation - Complete Reference

## Base URL
```
http://localhost:8081/api
```

---

## 🔐 Authentication APIs

### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

Request:
{
  "username": "thanhthat120704",
  "password": "123456"
}

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "username": "thanhthat120704",
    "role": "SELLER"
  }
}
```

---

## 👤 Profile APIs

### 1. Get Current User Profile
```http
GET /api/user/profile
Authorization: Bearer {token}

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "username": "thanhthat120704",
    "email": "thanhthat@gmail.com",
    "fullName": "Nguyen Van A",
    "phoneNumber": "0123456789",
    "address": "123 Street, City",
    "dateOfBirth": "1990-01-01",
    "gender": "MALE",
    "avatarUrl": "https://res.cloudinary.com/...",
    "role": "SELLER",
    "isActive": true,
    "createdAt": "2025-01-01T10:00:00",
    "updatedAt": "2025-01-15T10:00:00"
  }
}
```

### 2. Update Profile
```http
PUT /api/user/profile
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "fullName": "Nguyen Van B",
  "email": "updated@gmail.com",
  "phoneNumber": "0987654321",
  "address": "456 New Street, City",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE"
}

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Profile updated successfully",
  "data": { /* Updated UserProfileDTO */ }
}
```

### 3. Update Avatar
```http
PUT /api/user/avatar
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "avatarUrl": "https://res.cloudinary.com/new-avatar.jpg"
}

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Avatar updated successfully",
  "data": { /* Updated UserProfileDTO */ }
}
```

### 4. Change Password
```http
PUT /api/user/change-password
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "oldPassword": "123456",
  "newPassword": "newpass123",
  "confirmPassword": "newpass123"
}

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Password changed successfully",
  "data": "Password has been updated"
}
```

---

## 🏪 Shop Management APIs (Seller)

### 1. Get Seller Shop
```http
GET /api/seller/shop
Authorization: Bearer {token}
Requires: SELLER role

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy thông tin shop thành công",
  "data": {
    "id": 1,
    "name": "Sport Accessories Pro",
    "address": "123 Nguyen Van Linh, Da Nang",
    "description": "Cửa hàng phụ kiện thể thao chất lượng cao",
    "status": "ACTIVE",
    "createdAt": "2025-10-01T10:30:00"
  }
}

Response (404) - No shop:
{
  "status": 404,
  "error": "Seller chưa có shop",
  "message": "Lấy thông tin shop thất bại",
  "data": null
}
```

### 2. Update Shop Info
```http
PUT /api/seller/shop
Authorization: Bearer {token}
Requires: SELLER role
Content-Type: application/json

Request (all fields optional):
{
  "name": "Sport Accessories Pro - Official Store",
  "address": "456 Le Duan, Da Nang",
  "description": "Chuyên cung cấp phụ kiện thể thao chính hãng",
  "status": "ACTIVE"
}

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Cập nhật thông tin shop thành công",
  "data": { /* Updated ShopDTO */ }
}
```

### 3. Get Shop Analytics
```http
GET /api/seller/shop/analytics?year=2025
Authorization: Bearer {token}
Requires: SELLER role

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy thống kê shop thành công",
  "data": {
    "totalRevenue": 50000000,
    "totalOrders": 125,
    "monthlyRevenue": [
      { "month": 1, "revenue": 5000000, "orderCount": 15 },
      { "month": 2, "revenue": 7000000, "orderCount": 20 },
      // ... months 3-12
    ]
  }
}
```

### 4. Register as Seller (Buyer → Seller)
```http
POST /api/seller/register
Authorization: Bearer {token}
Requires: BUYER role
Content-Type: application/json

Request:
{
  "shopName": "My Awesome Shop",
  "shopDescription": "Selling handmade products",
  "shopPhone": "0912345678",
  "shopAddress": "123 Main St, Hanoi"
}

Response (201):
{
  "status": 201,
  "error": null,
  "message": "Đăng ký seller thành công! Role đã được nâng cấp.",
  "data": {
    "shopId": 1,
    "shopName": "My Awesome Shop",
    "message": "Đăng ký seller thành công!",
    "autoApproved": true
  }
}

Response (403) - Already seller:
{
  "status": 403,
  "error": "Chỉ BUYER mới có thể đăng ký seller",
  "message": "Đăng ký seller thất bại",
  "data": null
}

Response (409) - Already has shop:
{
  "status": 409,
  "error": "User đã có shop",
  "message": "Đăng ký seller thất bại",
  "data": null
}
```

---

## 📦 Product Management APIs

### 1. Get All Active Products (Public, Paginated)
```http
GET /api/products?page=0&size=10&sortBy=id&sortDir=asc
No auth required

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy danh sách sản phẩm hoạt động thành công",
  "data": {
    "content": [ /* Array of ProductDTO */ ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

### 2. Get Product by ID
```http
GET /api/products/{id}
No auth required

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy thông tin sản phẩm thành công",
  "data": {
    "id": 1,
    "name": "Áo thun nam",
    "description": "Mô tả sản phẩm",
    "categoryId": 5,
    "categoryName": "Thời trang nam",
    "mainImage": "https://res.cloudinary.com/...",
    "price": 150000,
    "status": "ACTIVE",
    "shopId": 1,
    "shopName": "Sport Accessories Pro",
    "variants": [
      {
        "id": 1,
        "sku": "AT-RED-M",
        "price": 150000,
        "stock": 50,
        "attributes": "Màu: Đỏ, Size: M",
        "variantValues": [
          { "productAttributeId": 1, "value": "Đỏ" },
          { "productAttributeId": 2, "value": "M" }
        ]
      }
    ],
    "galleryImages": [
      { "id": 1, "imageUrl": "https://..." }
    ]
  }
}
```

### 3. Search Products
```http
GET /api/products/search?name=áo&categoryId=5&minPrice=100000&maxPrice=500000&page=0&size=10
No auth required

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Tìm kiếm sản phẩm thành công",
  "data": { /* Page<ProductDTO> */ }
}
```

### 4. Get Products by Category
```http
GET /api/products/category/{categoryId}?page=0&size=10
No auth required

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy sản phẩm theo danh mục thành công",
  "data": { /* Page<ProductDTO> */ }
}
```

### 5. Create Product (Seller/Admin)
```http
POST /api/products
Authorization: Bearer {token}
Requires: SELLER or ADMIN role
Content-Type: application/json

Request:
{
  "name": "Áo thun nam",
  "description": "Mô tả sản phẩm",
  "categoryId": 5,
  "basePrice": 150000,
  "mainImageUrl": "https://res.cloudinary.com/...",
  "galleryImageUrls": ["https://..."],
  "variants": [
    {
      "sku": "AT-RED-M",
      "price": 150000,
      "stock": 50,
      "variantValues": [
        { "productAttributeId": 1, "value": "Đỏ" },
        { "productAttributeId": 2, "value": "M" }
      ]
    }
  ]
}

Response (201):
{
  "status": 201,
  "error": null,
  "message": "Tạo sản phẩm thành công",
  "data": { /* Created ProductDTO */ }
}
```

### 6. Update Product (Seller/Admin)
```http
PUT /api/products/{id}
Authorization: Bearer {token}
Requires: SELLER (owner) or ADMIN
Content-Type: application/json

Request: Same as Create Product

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Cập nhật sản phẩm thành công",
  "data": { /* Updated ProductDTO */ }
}
```

### 7. Delete Product (Seller/Admin)
```http
DELETE /api/products/{id}
Authorization: Bearer {token}
Requires: SELLER (owner) or ADMIN

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Xóa sản phẩm thành công",
  "data": "Product deleted"
}
```

### 8. Get Seller Products (Paginated)
```http
GET /api/products/my-products?page=0&size=10&sortBy=id&sortDir=desc
Authorization: Bearer {token}
Requires: SELLER role

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy sản phẩm của seller thành công",
  "data": { /* Page<ProductDTO> */ }
}
```

### 9. Get My Shop Products (All products of seller's shop)
```http
GET /api/products/my-shop/all?page=0&size=10&sortBy=id&sortDir=desc&isActive=true
Authorization: Bearer {token}
Requires: SELLER or ADMIN role

Query Params:
- page: int (default 0)
- size: int (default 10)
- sortBy: string (default "id")
- sortDir: "asc" | "desc" (default "desc")
- isActive: boolean (optional) - filter by active status

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy sản phẩm của shop thành công",
  "data": {
    "content": [ /* Array of ProductDTO */ ],
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

### 10. Get Pending Products (Admin only)
```http
GET /api/products/pending?page=0&size=10&sortBy=id&sortDir=desc
Authorization: Bearer {token}
Requires: ADMIN role

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy danh sách sản phẩm chờ duyệt thành công",
  "data": { /* Page<ProductDTO> */ }
}
```

### 11. Approve/Reject Product (Admin only)
```http
PATCH /api/products/{id}/approve?approved=true
Authorization: Bearer {token}
Requires: ADMIN role

Query Params:
- approved: boolean (true = approve, false = reject)

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Duyệt sản phẩm thành công",
  "data": { /* Updated ProductDTO */ }
}
```

### 12. Count Pending Products (Admin only)
```http
GET /api/products/pending/count
Authorization: Bearer {token}
Requires: ADMIN role

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Đếm sản phẩm chờ duyệt thành công",
  "data": 15
}
```

### 13. Toggle Product Status (Admin only)
```http
PATCH /api/products/{id}/status
Authorization: Bearer {token}
Requires: ADMIN role

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Thay đổi trạng thái sản phẩm thành công",
  "data": { /* Updated ProductDTO */ }
}
```

---

## 🛒 Order Management APIs (Buyer)

### 1. Create Order
```http
POST /api/orders
Authorization: Bearer {token}
Requires: Authenticated user
Content-Type: application/json

Request:
{
  "userId": 1,
  "orderItems": [
    {
      "productVariantId": 1,
      "quantity": 2,
      "price": 150000
    }
  ],
  "shippingAddress": "123 Street, City",
  "paymentMethod": "COD",
  "totalAmount": 300000
}

Response (201):
{
  "status": 201,
  "error": null,
  "message": "Đặt hàng thành công",
  "data": {
    "id": 1,
    "status": "PENDING",
    "totalAmount": 300000,
    "createdAt": "2025-01-15T10:00:00",
    "ghnInfo": null
  }
}
```

### 2. Get My Orders
```http
GET /api/orders
Authorization: Bearer {token}
Requires: Authenticated user

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": [
    {
      "id": 1,
      "status": "PENDING",
      "totalAmount": 300000,
      "createdAt": "2025-01-15T10:00:00",
      "items": [ /* OrderItemDTO */ ]
    }
  ]
}
```

### 3. Get Order Detail
```http
GET /api/orders/{id}
Authorization: Bearer {token}
Requires: Authenticated user (owner)

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy chi tiết đơn hàng thành công",
  "data": {
    "id": 1,
    "status": "PENDING",
    "totalAmount": 300000,
    "shippingAddress": "123 Street, City",
    "paymentMethod": "COD",
    "createdAt": "2025-01-15T10:00:00",
    "items": [
      {
        "productName": "Áo thun nam",
        "variantName": "Đỏ - M",
        "quantity": 2,
        "price": 150000
      }
    ]
  }
}
```

### 4. Update Order After Payment
```http
POST /api/orders/{id}/update-after-payment
Authorization: Bearer {token}
Requires: Authenticated user (owner)

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": null
}
```

### 5. Cancel Order
```http
POST /api/orders/{id}/cancel
Authorization: Bearer {token}
Requires: Authenticated user (owner)
Content-Type: application/json

Request (optional):
{
  "reason": "Đổi ý không mua"
}

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Đã hủy đơn hàng thành công",
  "data": null
}
```

---

## 📸 Image Upload APIs (Cloudinary)

### 1. Upload Product Main Image
```http
POST /api/images/product/main
Authorization: Bearer {token}
Requires: SELLER or ADMIN
Content-Type: multipart/form-data

Form Data:
- file: File (image)
- productId: Long

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Upload main image successful",
  "data": {
    "imageUrl": "https://res.cloudinary.com/...",
    "publicId": "products/main/123456"
  }
}
```

### 2. Upload Product Gallery Images
```http
POST /api/images/product/gallery
Authorization: Bearer {token}
Requires: SELLER or ADMIN
Content-Type: multipart/form-data

Form Data:
- files: File[] (multiple images)
- productId: Long

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Upload gallery images successful",
  "data": [
    {
      "imageUrl": "https://res.cloudinary.com/...",
      "publicId": "products/gallery/123456"
    }
  ]
}
```

### 3. Upload User Avatar
```http
POST /api/images/user/avatar
Authorization: Bearer {token}
Requires: Authenticated user
Content-Type: multipart/form-data

Form Data:
- file: File (image)

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Upload avatar successful",
  "data": {
    "imageUrl": "https://res.cloudinary.com/...",
    "publicId": "users/avatar/123456"
  }
}
```

### 4. Upload Shop Images
```http
POST /api/images/shop/banner
POST /api/images/shop/logo
Authorization: Bearer {token}
Requires: SELLER
Content-Type: multipart/form-data

Form Data:
- file: File (image)
- shopId: Long

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Upload shop image successful",
  "data": {
    "imageUrl": "https://res.cloudinary.com/...",
    "publicId": "shops/banner/123456"
  }
}
```

---

## 📋 Categories API

### 1. Get All Categories
```http
GET /api/categories
No auth required

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Lấy danh sách danh mục thành công",
  "data": [
    {
      "id": 1,
      "name": "Thời trang nam",
      "description": "Quần áo, phụ kiện nam",
      "parentId": null
    },
    {
      "id": 2,
      "name": "Áo thun",
      "description": "Áo thun nam nữ",
      "parentId": 1
    }
  ]
}
```

---

## 🚚 Shipping (GHN Integration)

### 1. Calculate Shipping Fee
```http
POST /api/ghn/calculate-fee
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "toDistrictId": 1542,
  "toWardCode": "21012",
  "weight": 1000,
  "length": 20,
  "width": 15,
  "height": 10
}

Response (200):
{
  "status": 200,
  "error": null,
  "message": "Calculate fee successful",
  "data": {
    "total": 35000,
    "service_fee": 30000,
    "insurance_fee": 5000
  }
}
```

---

## 🔑 Common Response Formats

### Success Response
```json
{
  "status": 200,
  "error": null,
  "message": "Success message",
  "data": { /* Response data */ }
}
```

### Error Response
```json
{
  "status": 400,
  "error": "ERROR_CODE",
  "message": "Error description",
  "data": null
}
```

### Paginated Response
```json
{
  "status": 200,
  "error": null,
  "message": "Success",
  "data": {
    "content": [ /* Array of items */ ],
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0,
    "pageSize": 10,
    "first": true,
    "last": false
  }
}
```

---

## 📝 Common DTOs

### ProductDTO
```typescript
{
  id: number;
  name: string;
  description: string;
  categoryId: number;
  categoryName: string;
  mainImage: string;
  price: number;
  basePrice: number;
  status: "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";
  shopId: number;
  shopName: string;
  variants: ProductVariantDTO[];
  galleryImages: ProductImageDTO[];
  createdAt: string;
  updatedAt: string;
}
```

### ProductVariantDTO
```typescript
{
  id: number;
  sku: string;
  price: number;
  stock: number;
  attributes: string; // "Màu: Đỏ, Size: M"
  variantValues: VariantValueDTO[];
  imageIds?: number[];
}
```

### VariantValueDTO
```typescript
{
  productAttributeId: number; // 1=color, 2=size, 3=material
  value: string;
}
```

### UserProfileDTO
```typescript
{
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  avatarUrl: string;
  role: "BUYER" | "SELLER" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### ShopDTO
```typescript
{
  id: number;
  name: string;
  address: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}
```

---

## 🔒 Authorization Headers

All authenticated endpoints require:
```
Authorization: Bearer {jwt_token}
```

Get token from login response:
```javascript
const token = loginResponse.data.data.token;
localStorage.setItem('token', token);

// Use in requests
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 🎯 Role-Based Access

| Role | Permissions |
|------|-------------|
| **BUYER** | View products, Create orders, Register as seller |
| **SELLER** | All BUYER + Manage shop, Manage products, View orders |
| **ADMIN** | All permissions + Approve products, Manage all users |

---

## 🚨 Common Error Codes

| Status | Error Code | Description |
|--------|-----------|-------------|
| 400 | BAD_REQUEST | Invalid request data |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 500 | INTERNAL_ERROR | Server error |

---

## 📌 Notes

1. **Pagination**: Default page=0, size=10, sortBy=id, sortDir=asc
2. **Image URLs**: All images stored on Cloudinary
3. **Product Attributes**: 1=color, 2=size, 3=material
4. **Product Status**: ACTIVE (visible), INACTIVE (hidden), OUT_OF_STOCK
5. **Order Status**: PENDING, CONFIRMED, SHIPPING, COMPLETED, CANCELLED
6. **Shop Status**: ACTIVE, INACTIVE
7. **Auto-approval**: New products/shops auto-approved for simplicity

---

## 🔗 Useful Endpoints Summary

**Public (No Auth)**:
- GET /api/products
- GET /api/products/{id}
- GET /api/products/search
- GET /api/categories

**Buyer**:
- POST /api/orders
- GET /api/orders
- POST /api/seller/register

**Seller**:
- GET /api/seller/shop
- PUT /api/seller/shop
- GET /api/seller/shop/analytics
- POST /api/products
- PUT /api/products/{id}
- DELETE /api/products/{id}
- GET /api/products/my-shop/all

**Admin**:
- GET /api/products/pending
- PATCH /api/products/{id}/approve
- PATCH /api/products/{id}/status

---

**Last Updated**: 2025-01-19
**Version**: 1.0
**Backend Port**: 8081
**Frontend Port**: 3000
