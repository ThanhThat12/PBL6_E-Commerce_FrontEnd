# Trang Quản Lý Đơn Hàng (Order Management)

## Tổng quan
Trang quản lý đơn hàng cung cấp giao diện quản lý toàn diện cho người bán hàng để theo dõi và xử lý các đơn hàng.

## Các thành phần chính

### 1. OrderStats (Thống kê đơn hàng)
- Hiển thị các chỉ số quan trọng:
  - Tổng số đơn hàng
  - Đơn hàng chờ xử lý
  - Đơn hàng đang xử lý
  - Đơn hàng đang giao hàng
  - Tổng doanh thu

### 2. OrderFilters (Bộ lọc đơn hàng)
Cho phép lọc đơn hàng theo:
- **Khoảng thời gian**: Chọn từ ngày - đến ngày
- **Trạng thái đơn hàng**: Chờ xử lý, Đang xử lý, Đang giao, Đã giao, Đã hủy
- **Trạng thái thanh toán**: Đã thanh toán, Chưa thanh toán
- **Tìm kiếm**: Theo mã đơn hàng, ID khách hàng, tên khách hàng

### 3. OrderTable (Bảng hiển thị đơn hàng)
Hiển thị thông tin chi tiết:
- Mã đơn hàng
- ID Khách hàng
- Tên khách hàng
- Tên Shop
- Ngày đặt hàng
- Giá trị đơn hàng (định dạng VND)
- Phương thức thanh toán (Credit Card, COD, Bank Transfer, E-Wallet)
- Trạng thái thanh toán
- Trạng thái đơn hàng
- Số lượng sản phẩm
- Thao tác: Xem chi tiết, Cập nhật trạng thái

## Tính năng

### 1. Xem danh sách đơn hàng
- Hiển thị tất cả đơn hàng trong bảng với phân trang
- Sắp xếp theo ngày đặt hàng, giá trị đơn hàng
- Lọc nhanh theo trạng thái thanh toán và trạng thái đơn hàng

### 2. Lọc đơn hàng theo khoảng thời gian
- Chọn ngày bắt đầu và ngày kết thúc
- Tự động cập nhật danh sách và thống kê

### 3. Xem chi tiết đơn hàng
- Click vào nút "Xem chi tiết" để mở modal
- Hiển thị đầy đủ thông tin đơn hàng

### 4. Cập nhật trạng thái đơn hàng
- Click vào nút "Cập nhật trạng thái"
- Chọn trạng thái mới từ dropdown
- Xác nhận cập nhật

### 5. Thống kê tự động
- Thống kê được cập nhật tự động khi lọc
- Hiển thị số lượng đơn hàng và doanh thu theo bộ lọc hiện tại

## Sử dụng

### Import components
```jsx
import OrdersPage from './pages/Seller/OrdersPage';
```

### Routing
```jsx
<Route path="/seller/orders" element={<OrdersPage />} />
```

## Dữ liệu mẫu
File `orderService.js` chứa dữ liệu mẫu cho việc phát triển. Khi tích hợp với backend, cần cập nhật các hàm API calls trong service này.

## Tích hợp Backend

### API endpoints cần implement:
1. `GET /api/orders` - Lấy danh sách đơn hàng (có hỗ trợ filters)
2. `GET /api/orders/:id` - Lấy chi tiết đơn hàng
3. `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng

### Filter parameters:
- `startDate`: Ngày bắt đầu (ISO format)
- `endDate`: Ngày kết thúc (ISO format)
- `orderStatus`: Trạng thái đơn hàng
- `paymentStatus`: Trạng thái thanh toán
- `searchQuery`: Từ khóa tìm kiếm

## Responsive Design
- Tối ưu cho mobile, tablet, desktop
- Bảng có thể scroll ngang trên màn hình nhỏ
- Layout thích ứng với các kích thước màn hình khác nhau

## Dependencies
- antd: UI components
- dayjs: Xử lý ngày tháng
- react-router-dom: Routing
