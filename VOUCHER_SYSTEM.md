# Hệ Thống Voucher - Tài Liệu Kỹ Thuật

## 📋 Tổng Quan

Hệ thống voucher cho phép seller tạo và quản lý mã giảm giá với nhiều tùy chọn:
- Giảm giá theo phần trăm hoặc số tiền cố định
- Áp dụng cho tất cả người dùng, sản phẩm cụ thể, người dùng cụ thể, hoặc top khách hàng
- Thiết lập thời gian hiệu lực và giới hạn sử dụng

## 🗂️ Cấu Trúc File

### 1. Service Layer
**File:** `src/services/seller/voucherService.js`

```javascript
// Các phương thức chính:
- createVoucher(voucherData)     // Tạo voucher mới
- getAllVouchers()                // Lấy tất cả voucher
- getActiveVouchers()             // Lấy voucher đang hoạt động
- deactivateVoucher(voucherId)    // Vô hiệu hóa voucher
- getAvailableVouchers(params)    // Lấy voucher khả dụng (cho buyer)
```

### 2. UI Component
**File:** `src/pages/seller/VoucherManagement.jsx`

**Features:**
- Hiển thị danh sách voucher với bảng (Table)
- Modal tạo voucher với form động
- Xử lý 4 loại áp dụng: ALL, SPECIFIC_PRODUCTS, SPECIFIC_USERS, TOP_BUYERS
- Vô hiệu hóa voucher với xác nhận (Popconfirm)

### 3. Routing
**File:** `src/App.js`
```javascript
<Route path="vouchers" element={<SellerPages.VoucherManagement />} />
```

### 4. Navigation
**File:** `src/components/seller/Layout/Sidebar.jsx`
```javascript
{
  key: '/seller/vouchers',
  icon: <GiftOutlined />,
  label: <Link to="/seller/vouchers">Voucher</Link>
}
```

## 🎨 Giao Diện

### Trang Quản Lý Voucher
- **Header:** Tiêu đề + Nút "Tạo Voucher"
- **Table:** Danh sách voucher với các cột:
  - Mã Voucher (code + description)
  - Loại Giảm Giá (percentage tag / fixed amount tag)
  - Điều Kiện (minOrderValue)
  - Áp Dụng (applicableType với số lượng)
  - Thời Gian (startDate - endDate)
  - Sử Dụng (usedCount / usageLimit)
  - Trạng Thái (isActive)
  - Thao Tác (Chi tiết, Vô hiệu hóa)

### Modal Tạo Voucher
**Form Fields:**
1. **Mã Voucher** (code) - Required, chỉ chữ in hoa và số
2. **Mô Tả** (description) - Required
3. **Loại Giảm Giá** (discountType) - Required
   - PERCENTAGE: Giảm theo %
   - FIXED_AMOUNT: Giảm cố định
4. **Giá Trị Giảm** (discountValue) - Required
5. **Giảm Tối Đa** (maxDiscountAmount) - Chỉ hiện khi chọn PERCENTAGE
6. **Giá Trị Đơn Tối Thiểu** (minOrderValue) - Required
7. **Thời Gian Hiệu Lực** (dateRange) - Required, RangePicker với showTime
8. **Giới Hạn Sử Dụng** (usageLimit) - Required
9. **Loại Áp Dụng** (applicableType) - Required, 4 options:
   - **ALL:** Tất cả người dùng
   - **SPECIFIC_PRODUCTS:** Chọn sản phẩm cụ thể (productIds)
   - **SPECIFIC_USERS:** Chọn người dùng cụ thể (userIds)
   - **TOP_BUYERS:** Nhập số lượng top khách hàng (topBuyersCount)

## 🔧 API Endpoints

### Seller APIs
```
GET    /seller/vouchers              // Lấy tất cả voucher
GET    /seller/vouchers/active       // Lấy voucher hoạt động
POST   /seller/vouchers              // Tạo voucher
PATCH  /seller/vouchers/:id/deactivate  // Vô hiệu hóa
```

### Buyer APIs (Dùng cho checkout)
```
GET    /seller/vouchers/available    // Lấy voucher khả dụng
       ?shopId=...&productIds=...&cartTotal=...
```

## 📊 Data Model

### Voucher Creation Payload
```javascript
{
  code: string,              // Mã voucher (chữ in hoa + số)
  description: string,       // Mô tả
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT',
  discountValue: number,     // Giá trị giảm
  minOrderValue: number,     // Đơn tối thiểu
  maxDiscountAmount: number | null,  // Giảm tối đa (chỉ với %)
  startDate: string,         // ISO 8601 format
  endDate: string,           // ISO 8601 format
  usageLimit: number,        // Giới hạn sử dụng
  applicableType: 'ALL' | 'SPECIFIC_PRODUCTS' | 'SPECIFIC_USERS' | 'TOP_BUYERS',
  productIds: number[],      // IDs sản phẩm áp dụng
  userIds: number[],         // IDs người dùng áp dụng
  topBuyersCount: number | null  // Số lượng top buyer
}
```

### Voucher Response
```javascript
{
  id: number,
  code: string,
  description: string,
  discountType: string,
  discountValue: number,
  minOrderValue: number,
  maxDiscountAmount: number,
  startDate: string,
  endDate: string,
  usageLimit: number,
  usedCount: number,
  isActive: boolean,
  applicableType: string,
  productIds: number[],
  userIds: number[],
  topBuyersCount: number,
  createdAt: string,
  updatedAt: string
}
```

## 🎯 Luồng Hoạt Động

### 1. Seller Tạo Voucher
```
Seller → Click "Tạo Voucher" 
     → Điền form 
     → Submit 
     → POST /seller/vouchers 
     → Reload danh sách
```

### 2. Seller Vô Hiệu Hóa Voucher
```
Seller → Click "Vô hiệu hóa"
     → Xác nhận (Popconfirm)
     → PATCH /seller/vouchers/:id/deactivate
     → Reload danh sách
```

### 3. Buyer Áp Dụng Voucher (Tính năng tương lai)
```
Buyer → Vào giỏ hàng/checkout
    → Nhập mã voucher hoặc chọn từ danh sách
    → GET /seller/vouchers/available?shopId=...
    → Hiển thị voucher khả dụng
    → Apply voucher
    → Tính toán giảm giá
```

## 🔍 Validation Rules

### Client-Side
- Code: Chỉ chữ in hoa và số, max 50 ký tự
- DiscountValue: > 0
- MinOrderValue: ≥ 0
- UsageLimit: ≥ 1
- DateRange: EndDate > StartDate
- ProductIds: Required nếu applicableType = SPECIFIC_PRODUCTS
- UserIds: Required nếu applicableType = SPECIFIC_USERS
- TopBuyersCount: Required nếu applicableType = TOP_BUYERS

### Server-Side (Giả định)
- Code unique per shop
- Thời gian hợp lệ
- Giá trị giảm phù hợp với loại
- ProductIds/UserIds tồn tại trong hệ thống

## 📦 Dependencies

### Ant Design Components
- Table, Card, Modal, Form
- Input, InputNumber, Select, DatePicker
- Button, Tag, Space, Popconfirm
- Icons: PlusOutlined, DeleteOutlined, EyeOutlined, GiftOutlined

### Services
- voucherService (CRUD voucher)
- productService (getProducts - load sản phẩm)
- statisticalService (getTopBuyers - load top buyer)

### Utilities
- dayjs: Format ngày tháng
- message: Thông báo

## 🚀 Tính Năng Tiếp Theo

### Phase 2 - Buyer Features
1. **Voucher Selection in Checkout**
   - Hiển thị voucher khả dụng
   - Search voucher by code
   - Auto-apply best voucher

2. **Voucher Display**
   - Badge "có voucher" trên product card
   - Voucher section trong cart
   - Discount breakdown trong order summary

3. **Apply Voucher Logic**
   - Validate voucher điều kiện
   - Calculate discount amount
   - Update cart total
   - Handle multiple vouchers (nếu cho phép)

### Phase 3 - Advanced Features
1. **Voucher Analytics**
   - Usage statistics
   - Revenue impact
   - Customer engagement metrics

2. **Voucher Templates**
   - Quick create từ template
   - Duplicate existing voucher

3. **Auto-send Voucher**
   - Gửi voucher cho top buyers tự động
   - Birthday voucher
   - First purchase voucher

4. **Voucher Scheduling**
   - Auto-activate/deactivate theo schedule
   - Recurring vouchers (monthly, weekly)

## 📝 Notes

- Voucher chỉ áp dụng trong cùng shop (shop-specific)
- Mỗi voucher có thể áp dụng cho nhiều sản phẩm/người dùng
- Trạng thái isActive có thể thay đổi bằng deactivate API
- UsedCount được tăng tự động khi voucher được sử dụng thành công
- Validate thời gian hiệu lực trên server khi apply voucher

## 🐛 Troubleshooting

### Issue: Không load được danh sách voucher
**Solution:** Kiểm tra API endpoint `/seller/vouchers` và authentication token

### Issue: Form validation lỗi
**Solution:** Đảm bảo tất cả required fields đều được điền và đúng format

### Issue: productIds/userIds không load
**Solution:** Kiểm tra productService.getProducts() và statisticalService.getTopBuyers()

### Issue: DateRange không submit
**Solution:** Kiểm tra format date trong onFinish (YYYY-MM-DDTHH:mm:ss)
