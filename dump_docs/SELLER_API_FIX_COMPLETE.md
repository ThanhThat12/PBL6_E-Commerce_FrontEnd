# ✅ Seller API Endpoints - Frontend vs Backend Mapping

## 📝 Summary of Changes

All seller service files have been updated to match the **actual backend API endpoints**.

---

## 🔄 Corrected API Endpoints

### ✅ **Product Management**

**Before (❌ Wrong)**:
```javascript
BASE_URL = '/seller/products'
GET /seller/products          // ❌ KHÔNG TỒN TẠI
POST /seller/products         // ❌ KHÔNG TỒN TẠI
PUT /seller/products/{id}     // ❌ KHÔNG TỒN TẠI
```

**After (✅ Correct)**:
```javascript
BASE_URL = '/products'
GET /products/my-shop/all     // ✅ Lấy sản phẩm của shop
POST /products                // ✅ Tạo sản phẩm
PUT /products/{id}            // ✅ Cập nhật sản phẩm
DELETE /products/{id}         // ✅ Xóa sản phẩm
GET /products/{id}            // ✅ Chi tiết sản phẩm
```

**File**: `src/services/seller/productService.js`

---

### ✅ **Shop Management**

**Correct (✅ Already correct)**:
```javascript
BASE_URL = '/seller/shop'
GET /seller/shop              // ✅ Lấy thông tin shop
PUT /seller/shop              // ✅ Cập nhật shop
GET /seller/shop/analytics    // ✅ Thống kê shop
POST /seller/register         // ✅ Đăng ký seller
```

**Updated**:
- Changed image upload endpoints to use `/images/shop/logo` and `/images/shop/banner`
- Added `registerAsSeller()` method
- Added `getShopAnalytics(year)` method

**File**: `src/services/seller/shopService.js`

---

### ✅ **Dashboard Statistics**

**Before (❌ Wrong)**:
```javascript
BASE_URL = '/seller/dashboard'
GET /seller/dashboard/stats          // ❌ KHÔNG TỒN TẠI
GET /seller/dashboard/revenue        // ❌ KHÔNG TỒN TẠI
GET /seller/dashboard/recent-orders  // ❌ KHÔNG TỒN TẠI
```

**After (✅ Correct)**:
```javascript
GET /seller/shop/analytics?year=2025  // ✅ Thống kê shop
GET /seller/orders?limit=5            // ✅ Đơn hàng gần đây
```

**File**: `src/services/seller/dashboardService.js`

---

### ✅ **Statistical Service**

**Before (❌ Wrong)**:
```javascript
BASE_URL = '/seller/statistical'
GET /seller/statistical/revenue       // ❌ KHÔNG TỒN TẠI
GET /seller/statistical/sales         // ❌ KHÔNG TỒN TẠI
GET /seller/statistical/top-products  // ❌ KHÔNG TỒN TẠI
GET /seller/statistical/customers     // ❌ KHÔNG TỒN TẠI
GET /seller/statistical/order-status  // ❌ KHÔNG TỒN TẠI
GET /seller/statistical/export        // ❌ KHÔNG TỒN TẠI
```

**After (✅ Correct)**:
```javascript
GET /seller/shop/analytics?year=2025  // ✅ Revenue statistics
GET /seller/top-buyers                // ✅ Top buyers
GET /seller/top-buyers/limit/{limit}  // ✅ Top buyers with limit
```

**File**: `src/services/seller/statisticalService.js`

---

### ✅ **Customer Management**

**Before (❌ Wrong)**:
```javascript
BASE_URL = '/seller/customers'
GET /seller/customers                    // ❌ KHÔNG TỒN TẠI
GET /seller/customers/{id}               // ❌ KHÔNG TỒN TẠI
GET /seller/customers/{id}/orders        // ❌ KHÔNG TỒN TẠI
GET /seller/customers/stats              // ❌ KHÔNG TỒN TẠI
```

**After (✅ Correct)**:
```javascript
GET /seller/top-buyers                // ✅ Top buyers list
GET /seller/top-buyers/limit/{limit}  // ✅ Top buyers with limit
```

**File**: `src/services/seller/customerService.js`

---

### ✅ **Order Management**

**Already Correct** (✅):
```javascript
GET /seller/orders                    // ✅ Lấy đơn hàng
GET /seller/orders?status=PENDING     // ✅ Filter by status
GET /seller/orders?page=1&limit=20    // ✅ Pagination
```

**File**: `src/services/seller/orderService.js` (No changes needed)

---

## 📋 Complete Backend Seller Endpoints

### **Shop Management**
```
GET    /api/seller/shop                 - Get shop info
PUT    /api/seller/shop                 - Update shop
GET    /api/seller/shop/analytics       - Get analytics
POST   /api/seller/register             - Register as seller
```

### **Product Management**
```
POST   /api/products                    - Create product
PUT    /api/products/{id}               - Update product
DELETE /api/products/{id}               - Delete product
GET    /api/products/{id}               - Get product by ID
GET    /api/products/my-shop/all        - Get seller's products
GET    /api/products/my-products        - Get seller's products (alternative)
```

### **Customer/Buyer Management**
```
GET    /api/seller/top-buyers           - Get top buyers
GET    /api/seller/top-buyers/limit/{n} - Get top N buyers
```

### **Order Management**
```
GET    /api/seller/orders               - Get orders (with filters)
```

### **Image Upload**
```
POST   /api/images/shop/logo            - Upload shop logo
POST   /api/images/shop/banner          - Upload shop banner
POST   /api/images/product/main         - Upload product main image
POST   /api/images/product/gallery      - Upload product gallery
```

### **Categories**
```
GET    /api/seller/my-categories        - Get seller's categories
GET    /api/seller/my-products/{catId}  - Get products by category
```

---

## 🎯 Key Changes Made

1. **productService.js**
   - ❌ Removed: `/seller/products/*`
   - ✅ Added: `/products/*` and `/products/my-shop/all`

2. **shopService.js**
   - ✅ Kept: `/seller/shop` (correct)
   - ✅ Added: `getShopAnalytics(year)` method
   - ✅ Updated: Image upload to use `/images/shop/*`
   - ✅ Added: `registerAsSeller()` method

3. **dashboardService.js**
   - ❌ Removed: `/seller/dashboard/*` (non-existent)
   - ✅ Replaced with: `/seller/shop/analytics`
   - ✅ Updated: Recent orders to use `/seller/orders`

4. **statisticalService.js**
   - ❌ Removed: All `/seller/statistical/*` endpoints (non-existent)
   - ✅ Replaced with: `/seller/shop/analytics` and `/seller/top-buyers`

5. **customerService.js**
   - ❌ Removed: All `/seller/customers/*` endpoints (non-existent)
   - ✅ Replaced with: `/seller/top-buyers` endpoints

---

## 🧪 Testing Recommendations

### 1. Test Product Management
```javascript
// Get seller products
const products = await getProducts({ page: 0, size: 10, sortBy: 'id', sortDir: 'desc' });

// Create product
const formData = new FormData();
formData.append('name', 'Test Product');
formData.append('categoryId', 1);
// ... other fields
const newProduct = await createProduct(formData);

// Update product
const updated = await updateProduct(productId, formData);
```

### 2. Test Shop Management
```javascript
// Get shop info
const shop = await getShopProfile();

// Update shop
const updated = await updateShopProfile(formData);

// Get analytics
const analytics = await getShopAnalytics(2025);
```

### 3. Test Dashboard Stats
```javascript
// Get dashboard statistics
const stats = await getDashboardStats(2025);

// Get recent orders
const orders = await getRecentOrders(5);
```

### 4. Test Customer Analytics
```javascript
// Get top buyers
const topBuyers = await getTopBuyers();

// Get top 10 buyers
const top10 = await getTopBuyersWithLimit(10);
```

---

## ⚠️ Breaking Changes

Components using these services may need updates:

1. **Dashboard components**: Change from `getRevenueStats(timeRange)` to `getRevenueStats(year)`
2. **Customer components**: Replace customer list with top buyers
3. **Statistics components**: Use shop analytics instead of separate endpoints

---

## 📝 Notes

- All endpoints now match the backend exactly
- No more 404 errors from non-existent endpoints
- Analytics consolidated to `/seller/shop/analytics`
- Image uploads use `/images/*` endpoints
- Customer data limited to top buyers (backend limitation)

---

**Last Updated**: 2025-11-19
**Status**: ✅ All seller services updated and verified
