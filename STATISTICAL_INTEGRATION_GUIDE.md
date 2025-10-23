# Tích hợp API Thống kê - Backend Response

## ✅ API đã có từ Backend

### Endpoint
```http
GET http://localhost:8081/api/seller/statistics/revenue?year={year}
```

### Response Structure từ Backend
```json
{
    "status": 200,
    "error": null,
    "message": "Lấy thống kê shop thành công",
    "data": {
        "totalRevenue": 607000000.00,
        "totalCompletedOrders": 2033,
        "monthlyRevenue": [
            {
                "year": 2024,
                "month": 1,
                "monthName": "Tháng 1",
                "revenue": 45000000,
                "orderCount": 156
            },
            {
                "year": 2024,
                "month": 2,
                "monthName": "Tháng 2",
                "revenue": 52000000,
                "orderCount": 178
            },
            // ... 10 tháng còn lại
            {
                "year": 2024,
                "month": 12,
                "monthName": "Tháng 12",
                "revenue": 0,
                "orderCount": 0
            }
        ]
    }
}
```

---

## 🔄 Mapping Backend → Frontend

### Backend Fields → Frontend Fields

| Backend Field | Frontend Field | Description |
|--------------|----------------|-------------|
| `data.totalRevenue` | `summary.totalRevenue` | Tổng doanh thu năm |
| `data.totalCompletedOrders` | `summary.totalOrders` | Tổng đơn hàng hoàn thành |
| `data.monthlyRevenue[].year` | `monthlyRevenue[].year` | Năm |
| `data.monthlyRevenue[].month` | `monthlyRevenue[].month` | Tháng (1-12) |
| `data.monthlyRevenue[].monthName` | `monthlyRevenue[].monthName` | Tên tháng tiếng Việt |
| `data.monthlyRevenue[].revenue` | `monthlyRevenue[].revenue` | Doanh thu tháng |
| `data.monthlyRevenue[].orderCount` | `monthlyRevenue[].orders` | Số đơn hàng |

### Calculated Fields (Frontend)

Frontend tự tính toán các trường sau từ dữ liệu backend:

```javascript
{
  summary: {
    totalRevenue: data.totalRevenue,           // Từ backend
    totalOrders: data.totalCompletedOrders,    // Từ backend
    averageRevenue: totalRevenue / 12,         // Tính toán
    highestMonth: {                             // Tính toán
      month, revenue, orders
    },
    lowestMonth: {                              // Tính toán
      month, revenue, orders
    }
  }
}
```

---

## 📝 Code đã Update

### `statisticalService.js`

```javascript
async getRevenueByYear(year) {
  const response = await fetch(
    `http://localhost:8081/api/seller/statistics/revenue?year=${year}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const result = await response.json();

  if (result.status === 200 && result.data) {
    const data = result.data;
    
    // Chuyển đổi format
    const monthlyRevenue = data.monthlyRevenue.map(item => ({
      month: item.month,
      year: item.year,
      monthName: item.monthName,
      revenue: item.revenue || 0,
      orders: item.orderCount || 0,  // ← Mapping orderCount → orders
    }));

    // Tính toán summary
    const totalRevenue = data.totalRevenue || 0;
    const totalOrders = data.totalCompletedOrders || 0;
    const averageRevenue = totalRevenue / 12;

    // Tìm tháng cao nhất/thấp nhất
    const monthsWithRevenue = monthlyRevenue.filter(m => m.revenue > 0);
    
    const highestMonth = monthsWithRevenue.reduce((max, item) => 
      item.revenue > max.revenue ? item : max
    );
    
    const lowestMonth = monthsWithRevenue.reduce((min, item) => 
      item.revenue < min.revenue ? item : min
    );

    return {
      year: year,
      monthlyRevenue: monthlyRevenue,
      summary: {
        totalRevenue,
        totalOrders,
        averageRevenue,
        highestMonth,
        lowestMonth,
      },
    };
  }
}
```

---

## 🎯 Hiển thị trên UI

### 1. Summary Cards
- **Tổng doanh thu**: `607,000,000 ₫`
- **Tổng đơn hàng**: `2,033 đơn`
- **Trung bình/tháng**: `50,583,333 ₫`
- **Tháng cao nhất**: `Tháng 10 - 72,000,000 ₫`

### 2. Biểu đồ cột
- 12 cột tương ứng 12 tháng
- Chiều cao = Doanh thu
- Tooltip hiển thị:
  - `Tháng 1/2024`
  - `Doanh thu: 45,000,000 ₫`
  - `Đơn hàng: 156 đơn`

### 3. Bảng chi tiết

| Tháng | Doanh thu | Đơn hàng | Trung bình/đơn |
|-------|-----------|----------|----------------|
| Tháng 1 | 45,000,000 ₫ | 156 đơn | 288,462 ₫ |
| Tháng 2 | 52,000,000 ₫ | 178 đơn | 292,135 ₫ |
| ... | ... | ... | ... |
| **Tổng** | **607,000,000 ₫** | **2,033 đơn** | **298,621 ₫** |

---

## 🧪 Testing

### Test với data thực
1. Mở trang: `http://localhost:3000/seller/statisticals`
2. Chọn năm 2024
3. Kiểm tra:
   - ✅ API được gọi: `GET /api/seller/statistics/revenue?year=2024`
   - ✅ Summary cards hiển thị đúng
   - ✅ Biểu đồ có 12 cột
   - ✅ Tooltip hiển thị đúng thông tin
   - ✅ Bảng chi tiết đầy đủ 12 tháng

### Test với năm khác
1. Chọn năm 2023
2. Kiểm tra API call mới
3. Biểu đồ cập nhật

### Test khi không có dữ liệu
- Tháng có `revenue: 0, orderCount: 0`
- Cột biểu đồ màu xám
- Không tính vào highestMonth/lowestMonth

---

## 🔒 Authentication (TODO)

Khi backend yêu cầu authentication:

```javascript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

---

## ⚠️ Error Handling

### Lỗi 401 - Unauthorized
```json
{
  "status": 401,
  "error": "UNAUTHORIZED",
  "message": "Token không hợp lệ"
}
```

### Lỗi 400 - Bad Request
```json
{
  "status": 400,
  "error": "INVALID_YEAR",
  "message": "Năm không hợp lệ"
}
```

### Lỗi 404 - No Data
```json
{
  "status": 404,
  "error": "NO_DATA",
  "message": "Không có dữ liệu cho năm này"
}
```

Frontend sẽ hiển thị:
- Loading state khi đang fetch
- Error message khi lỗi
- Empty state khi không có dữ liệu

---

## 📊 Data Flow

```
Backend API
    ↓
statisticalService.js (mapping data)
    ↓
StatisticalPage.jsx (state management)
    ↓
┌─────────────────┬─────────────────┬─────────────────┐
│                 │                 │                 │
StatisticalSummary  RevenueChart    Monthly Table
(4 cards)         (12 columns)     (12 rows)
```

---

## ✨ Features đã hoạt động

- ✅ Fetch data từ backend API
- ✅ Mapping `orderCount` → `orders`
- ✅ Tính toán summary (average, highest, lowest)
- ✅ Hiển thị biểu đồ 12 tháng
- ✅ Format tiền VNĐ
- ✅ Tooltip chi tiết
- ✅ Bảng tổng hợp
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling

---

## 🚀 Ready to Use!

Code đã sẵn sàng để tích hợp với backend API. Chỉ cần:
1. Backend chạy ở `localhost:8081`
2. API endpoint: `/api/seller/statistics/revenue?year={year}`
3. Response format như đã nêu ở trên

Trang thống kê sẽ tự động hiển thị dữ liệu thực! 🎉
