# Hướng Dẫn Cấu Hình Route cho Payment Page

## 1. Cập nhật App.jsx (hoặc file router chính)

Thêm route sau vào phần routing:

```jsx
import PaymentPage from "./pages/order/PaymentPage";

// ... inside your Routes
<Route path="/payment" element={<PaymentPage />} />;
```

## 2. Cấu Hình Navigate từ Cart sang Payment

Trong `CartSummary` hoặc nơi bạn có button "Thanh toán", thay thế:

```jsx
// Cũ:
onClick={() => navigate('/checkout')}

// Mới:
onClick={() => navigate('/payment')}
```

## 3. Cấu Trúc Component

### PaymentPage.jsx

- **Vị trí**: `src/pages/order/PaymentPage.jsx`
- **Chức năng**: Trang thanh toán chính với layout đầy đủ
- **Bao gồm**:
  - Shipping Address Form
  - Order Items Display
  - Payment Method Selector
  - Order Summary Card
  - Place Order Button

### PaymentMethodSelector.jsx

- **Vị trí**: `src/components/order/PaymentMethodSelector.jsx`
- **Chức năng**: Component để lựa chọn phương thức thanh toán
- **Hỗ trợ**:
  - COD (Thanh toán khi nhận hàng)
  - MoMo (Ví điện tử)
  - Bank Transfer (Chuyển khoản)

## 4. Dữ Liệu Gửi Lên Backend

Khi người dùng bấm "Tiến hành thanh toán", dữ liệu sẽ được gửi lên:

```javascript
{
  userId: Long,
  items: [
    {
      variantId: Long,
      quantity: Integer,
      price: BigDecimal,
      name: String
    }
  ],
  toName: String,           // Tên người nhận
  toPhone: String,          // SĐT người nhận
  toDistrictId: String,     // ID quận/huyện GHN
  toWardCode: String,       // Mã phường/xã GHN
  toAddress: String,        // Địa chỉ chi tiết
  province: String,         // Tỉnh/TP
  district: String,         // Quận/Huyện
  ward: String,             // Phường/Xã
  weightGrams: Integer,     // Trọng lượng (gram)
  codAmount: BigDecimal,    // Số tiền COD (nếu chọn COD)
  paymentMethod: String,    // Phương thức thanh toán (COD/MOMO/BANK)
  notes: String             // Ghi chú (tùy chọn)
}
```

## 5. Tích Hợp API

Trong PaymentPage.jsx, tìm đến phần TODO và uncomment:

```jsx
// Thay thế TODO này:
// const response = await api.post('/api/orders', orderData);

// Thành:
const response = await api.post("/api/orders", orderData);
```

## 6. Styling

- Sử dụng Tailwind CSS (đã được import)
- Font family từ project
- Color pattern có sẵn nếu cần

## 7. Testing Flow

1. Đăng nhập vào tài khoản
2. Thêm sản phẩm vào giỏ hàng
3. Nhấn "Thanh toán" → Chuyển đến `/payment`
4. Điền thông tin giao hàng
5. Chọn phương thức thanh toán
6. Nhấn "Tiến hành thanh toán"

## 8. Chú Ý

- Địa chỉ giao hàng cần được xác thực qua GHN API
- Phí vận chuyển có thể tính động từ GHN
- Nếu chọn COD, cod_amount sẽ được gửi lên backend
- Nếu chọn MOMO hoặc BANK, cần redirect đến trang thanh toán tương ứng
