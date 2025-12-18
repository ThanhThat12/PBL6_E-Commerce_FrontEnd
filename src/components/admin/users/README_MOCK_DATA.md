# 📦 Mock Data Fallback for Customers Table

## 🎯 Behavior

CustomersTable hiện tại có **automatic fallback** đến mock data khi:

1. ❌ Backend chưa chạy (connection refused)
2. ❌ API trả về error
3. ❌ Token không hợp lệ hoặc hết hạn

## 🔄 Flow hoạt động:

```
1. Component mount
   ↓
2. Call API: getCustomers()
   ↓
3a. ✅ API SUCCESS → Display real data from backend
3b. ❌ API FAIL → Fallback to mock data (10 customers)
   ↓
4. User click "View" customer
   ↓
5a. ✅ API SUCCESS → Display detailed info from backend
5b. ❌ API FAIL → Display local customer data
   ↓
6. User click "Delete" customer
   ↓
7a. ✅ API SUCCESS → Delete from backend + refresh list
7b. ❌ API FAIL → Remove from local state (simulated)
```

## 📝 Mock Data Structure

Mock data có 10 customers với format:

```javascript
{
  id: '#CUST001',           // String ID with prefix
  name: 'John Doe',         // Full name (mock)
  username: undefined,      // Not in mock data
  email: 'john.doe@example.com',
  phone: '+1234567890',     // Mock: phone
  phoneNumber: undefined,   // API: phoneNumber
  address: '123 Main St, New York, NY 10001',
  orderCount: 25,
  totalSpend: 3450.00,
  status: 'Active',         // Mock: 'Active' | 'Inactive'
  activated: undefined,     // API: true | false (boolean)
  registerAt: '2024-01-15',
  lastOrderDate: '2024-10-20'
}
```

## 🔀 API vs Mock Data Mapping

| Field | API Response | Mock Data | Display Logic |
|-------|-------------|-----------|---------------|
| Name | `username` | `name` | `username \|\| name \|\| 'N/A'` |
| Phone | `phoneNumber` | `phone` | `phoneNumber \|\| phone \|\| 'N/A'` |
| Status | `activated` (boolean) | `status` (string) | `activated ? 'Active' : 'Inactive'` |
| ID | `id` (number) | `id` (string with #) | `#{id}` |

## 🎨 UI Behavior

### Loading State
```javascript
{loading && (
  <div>Loading customers...</div>
)}
```

### Empty State
```javascript
{customers.length === 0 && (
  <div>No customers found</div>
)}
```

### Mock Data Indicator
Console logs show:
- `📦 Using mock data (backend not running)` - Khi fallback
- `👥 Customers loaded from API: X` - Khi dùng real data

## 🧪 Testing

### Test với backend running:
```bash
# Terminal 1: Start backend
cd PBL6_E-Commerce/Ecommerce
./mvnw spring-boot:run

# Terminal 2: Start frontend
cd PBL6_E-Commerce_FrontEnd
npm start
```
→ Should display real data from API

### Test without backend:
```bash
# Stop backend
# Keep frontend running
npm start
```
→ Should display mock data (10 customers)

## 🔐 Authentication

Frontend **KHÔNG CHECK** authentication:
- ✅ Vào được trang /admin/users/customers mà không cần login
- ✅ Hiển thị mock data để test UI
- ❌ Backend sẽ chặn khi call API (401/403)

## 📱 Mobile App Ready

Logic này hoàn toàn tương thích với mobile app:
- Mobile app gọi cùng API endpoints
- Backend verify token + role
- Frontend chỉ là UI helper với mock data fallback

## ⚠️ Production

Trong production, nên:
1. ❌ **Bỏ mock data fallback** (hoặc chỉ enable trong dev mode)
2. ✅ **Hiển thị error message** rõ ràng khi API fail
3. ✅ **Redirect to login** khi 401 Unauthorized
4. ✅ **Show retry button** khi network error

## 🔧 Configuration

Để tắt mock data fallback, sửa trong `CustomersTable.jsx`:

```javascript
const USE_MOCK_FALLBACK = process.env.NODE_ENV === 'development'; // Only in dev

const fetchCustomers = async () => {
  try {
    // ... API call
  } catch (err) {
    if (USE_MOCK_FALLBACK) {
      setCustomers(mockCustomersData); // Fallback
    } else {
      setError('Failed to load customers'); // Show error
    }
  }
};
```

## 📊 Current Mock Customers

| ID | Name | Email | Status | Orders | Total Spend |
|----|------|-------|--------|--------|-------------|
| #CUST001 | John Doe | john.doe@example.com | Active | 25 | $3,450 |
| #CUST002 | Jane Smith | jane.smith@example.com | Inactive | 5 | $250 |
| #CUST004 | Michael Brown | michael.brown@example.com | Active | 15 | $1,890 |
| #CUST005 | Sarah Wilson | sarah.wilson@example.com | Active | 8 | $675 |
| #CUST006 | David Lee | david.lee@example.com | Inactive | 3 | $180 |
| #CUST008 | James Taylor | james.taylor@example.com | Active | 12 | $1,540 |
| #CUST009 | Maria Garcia | maria.garcia@example.com | Active | 18 | $2,340 |
| #CUST010 | Robert Martinez | robert.martinez@example.com | Inactive | 6 | $420 |

Total: **10 mock customers**
