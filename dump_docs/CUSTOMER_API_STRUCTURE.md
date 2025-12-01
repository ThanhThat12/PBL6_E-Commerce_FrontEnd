# Customer API Data Structure

## 1. GET /api/admin/users/customers
Trả về danh sách customers (BUYER role)

### Response Structure:
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "username": "john_buyer",
      "email": "john@example.com",
      "phoneNumber": "+1234567890",
      "activated": true,
      "registeredAt": "2024-01-15T10:30:00"
    }
  ]
}
```

### ListCustomerUserDTO Fields:
- `id`: Long - User ID
- `username`: String - Username
- `email`: String - Email
- `phoneNumber`: String - Phone number
- `activated`: boolean - Account status
- `registeredAt`: LocalDateTime - Registration date
- `lastOrderDate`: LocalDateTime - **NULL trong danh sách**
- `totalOrders`: int - **0 trong danh sách**
- `totalSpent`: double - **0.0 trong danh sách**

---

## 2. GET /api/admin/users/detail/{userId}
Trả về thông tin chi tiết customer (khi click View)

### Response Structure:
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "id": 1,
    "username": "john_buyer",
    "email": "john@example.com",
    "phoneNumber": "+1234567890",
    "role": "BUYER",
    "activated": true,
    "createdAt": "2024-01-15T10:30:00",
    "totalOrders": 25,
    "totalSpent": 3450.50,
    "lastOrderDate": "2024-10-20T14:22:00",
    "cartItemsCount": 5,
    "primaryAddressLabel": "Home",
    "primaryAddressFullAddress": "123 Main St, Apartment 4B",
    "primaryAddressProvince": "New York",
    "primaryAddressDistrict": "Manhattan",
    "primaryAddressWard": "Upper West Side",
    "primaryAddressContactPhone": "+1234567890"
  }
}
```

### AdminUserDetailDTO Fields (BUYER):
**Basic Info:**
- `id`: Long
- `username`: String
- `email`: String
- `phoneNumber`: String
- `role`: String ("BUYER")
- `activated`: boolean
- `createdAt`: LocalDateTime

**Order Stats (từ Orders table - CHỈ COMPLETED):**
- `totalOrders`: int - Đếm từ `orderRepository.countCompletedOrdersByUserId()`
- `totalSpent`: Double - Tính từ `orderRepository.getTotalSpentByUserId()`
- `lastOrderDate`: LocalDateTime - Lấy từ `orderRepository.getLastCompletedOrderDateByUserId()`

**Cart Info:**
- `cartItemsCount`: int - Đếm từ `cartRepository.findByUserId()` và `cartItemRepository.findByCartId().size()`

**Address Info (từ Address table - PRIMARY address):**
- `primaryAddressLabel`: String - VD: "Home", "Office"
- `primaryAddressFullAddress`: String - Địa chỉ chi tiết
- `primaryAddressProvince`: String - Tỉnh/Thành phố
- `primaryAddressDistrict`: String - Quận/Huyện
- `primaryAddressWard`: String - Phường/Xã
- `primaryAddressContactPhone`: String - SĐT liên hệ

---

## 3. Frontend Component Flow

### CustomersTable.jsx:
1. `useEffect()` → `fetchCustomers()` → calls `getCustomers()` API
2. Hiển thị danh sách với: username, id, email, phone, status
3. Click "View" → `handleView(customer)` → calls `getCustomerDetail(userId)` API
4. Open `CustomerDetailModal` với full data

### CustomerDetailModal.jsx:
- Hiển thị tất cả thông tin từ `AdminUserDetailDTO`
- Section "Primary Address" với 6 fields
- Section "Order Statistics" với totalOrders, totalSpent, cartItemsCount
- Section "Account Information" với createdAt, lastOrderDate, role

---

## 4. Key Notes:

✅ **Danh sách customers**: Chỉ hiển thị thông tin cơ bản (registeredAt có, nhưng totalOrders/totalSpent/lastOrderDate = 0/null)

✅ **Chi tiết customer**: Hiển thị ĐẦY ĐỦ thông tin (totalOrders, totalSpent, lastOrderDate tính từ database thật)

✅ **Address**: Chỉ hiển thị primary address (primaryAddress = true trong database)

✅ **Order stats**: Chỉ tính từ đơn hàng COMPLETED (status = 'COMPLETED')

✅ **API Base URL**: http://localhost:8081/api

✅ **Authentication**: Bearer token trong header (localStorage.getItem('adminToken'))
