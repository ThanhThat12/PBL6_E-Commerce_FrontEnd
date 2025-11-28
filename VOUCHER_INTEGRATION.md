# Tích Hợp API Voucher - Tài Liệu Cập Nhật

## 📋 Tổng Quan Thay Đổi

VoucherSelector component đã được cập nhật để sử dụng API thực thay vì dữ liệu mock, cho phép người dùng xem và áp dụng voucher khả dụng từ shop khi thanh toán.

## 🔄 Các Thay Đổi Chính

### 1. VoucherSelector Component (`src/components/order/VoucherSelector.jsx`)

#### Dependencies Mới
```javascript
import { useEffect } from 'react';
import voucherService from '../../services/seller/voucherService';
import { message } from 'antd';
```

#### Props Mới
```javascript
const VoucherSelector = ({ 
  onVoucherApply,    // Callback khi áp dụng voucher
  subtotal,          // Tổng tiền đơn hàng
  shopId,            // ID của shop (MỚI)
  cartItems          // Danh sách sản phẩm trong giỏ (MỚI)
}) => {
```

#### State Mới
```javascript
const [availableVouchers, setAvailableVouchers] = useState([]);
const [loading, setLoading] = useState(false);
```

#### Fetch Vouchers từ API
```javascript
useEffect(() => {
  const fetchVouchers = async () => {
    if (!shopId || !cartItems || cartItems.length === 0) return;
    
    setLoading(true);
    try {
      const productIds = cartItems.map(item => item.productId);
      const response = await voucherService.getAvailableVouchers({
        shopId,
        productIds,
        cartTotal: subtotal
      });
      
      const vouchers = response?.data || response || [];
      setAvailableVouchers(Array.isArray(vouchers) ? vouchers : []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  fetchVouchers();
}, [shopId, cartItems, subtotal]);
```

#### Validation Nâng Cao
```javascript
const validateVoucher = (voucher) => {
  // Check if voucher is active
  if (!voucher.isActive) {
    return { valid: false, message: 'Voucher đã hết hiệu lực' };
  }
  
  // Check usage limit
  if (voucher.usedCount >= voucher.usageLimit) {
    return { valid: false, message: 'Voucher đã hết lượt sử dụng' };
  }
  
  // Check date validity
  const now = new Date();
  const startDate = new Date(voucher.startDate);
  const endDate = new Date(voucher.endDate);
  
  if (now < startDate) {
    return { valid: false, message: 'Voucher chưa có hiệu lực' };
  }
  
  if (now > endDate) {
    return { valid: false, message: 'Voucher đã hết hạn' };
  }
  
  // Check minimum order value
  if (subtotal < voucher.minOrderValue) {
    return {
      valid: false,
      message: `Đơn hàng tối thiểu ${minOrderValue.toLocaleString('vi-VN')}₫`
    };
  }
  
  return { valid: true };
};
```

#### Calculate Discount với Preview từ API
```javascript
const calculateDiscount = (voucher) => {
  if (!voucher) return 0;
  
  // Use previewDiscount if available from API
  if (voucher.previewDiscount && voucher.previewDiscount.discountAmount) {
    return voucher.previewDiscount.discountAmount;
  }
  
  // Fallback calculation
  switch (voucher.discountType) {
    case 'PERCENTAGE':
      const percentDiscount = (subtotal * voucher.discountValue) / 100;
      return Math.min(percentDiscount, voucher.maxDiscountAmount || percentDiscount);
    case 'FIXED_AMOUNT':
      return voucher.discountValue;
    default:
      return 0;
  }
};
```

#### UI Updates
```javascript
// Loading state
{loading ? (
  <div className="text-center py-4 text-gray-500">Đang tải voucher...</div>
) : availableVouchers.length === 0 ? (
  <div className="text-center py-4 text-gray-500">Không có voucher khả dụng</div>
) : (
  // Render vouchers
)}

// Voucher display với data từ API
<p className="font-semibold text-gray-900">{voucher.code}</p>
<span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
  {voucher.discountType === 'PERCENTAGE' 
    ? `${voucher.discountValue}%` 
    : `${voucher.discountValue.toLocaleString('vi-VN')}₫`}
</span>
<p className="text-sm text-gray-600">{voucher.description}</p>
{voucher.previewDiscount && (
  <p className="text-xs text-green-600 mt-1">
    Giảm {voucher.previewDiscount.discountAmount.toLocaleString('vi-VN')}₫
  </p>
)}
```

### 2. PaymentPage Component (`src/pages/order/PaymentPage.jsx`)

#### Tính shopId từ checkoutItems
```javascript
const shopId = useMemo(() => {
  if (!checkoutItems || checkoutItems.length === 0) return null;
  // Try to get shopId from first item
  return checkoutItems[0]?.shopId || checkoutItems[0]?.sellerId || null;
}, [checkoutItems]);
```

#### Truyền Props vào VoucherSelector
```javascript
<VoucherSelector 
  onVoucherApply={handleVoucherApply}
  subtotal={subtotal}
  shopId={shopId}
  cartItems={checkoutItems}
/>
```

## 🎯 API Integration

### Endpoint Được Sử Dụng
```
GET /api/seller/vouchers/available
  ?shopId={shopId}
  &productIds={id1,id2,id3}
  &cartTotal={total}
```

### Request Example
```javascript
voucherService.getAvailableVouchers({
  shopId: 1,
  productIds: [101, 102, 103],
  cartTotal: 500000
})
```

### Response Structure
```json
{
  "code": 200,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "code": "NEWYEAR2024",
      "description": "Giảm giá đầu năm",
      "shopId": 1,
      "shopName": "Shop ABC",
      "discountType": "PERCENTAGE",
      "discountValue": 20,
      "minOrderValue": 100000,
      "maxDiscountAmount": 50000,
      "startDate": "2024-01-01T00:00:00",
      "endDate": "2024-01-31T23:59:59",
      "usageLimit": 100,
      "usedCount": 45,
      "applicableType": "ALL",
      "isActive": true,
      "previewDiscount": {
        "cartTotal": 500000,
        "discountAmount": 50000,
        "finalTotal": 450000
      }
    }
  ]
}
```

## 🔍 Data Flow

```
1. User vào trang thanh toán (PaymentPage)
   ↓
2. PaymentPage load checkoutItems từ sessionStorage
   ↓
3. PaymentPage tính shopId từ checkoutItems[0]
   ↓
4. PaymentPage render VoucherSelector với shopId & cartItems
   ↓
5. VoucherSelector gọi API getAvailableVouchers
   ↓
6. API trả về danh sách voucher khả dụng với previewDiscount
   ↓
7. User chọn voucher
   ↓
8. VoucherSelector validate voucher
   ↓
9. VoucherSelector tính discount (dùng previewDiscount nếu có)
   ↓
10. Call onVoucherApply callback
    ↓
11. PaymentPage cập nhật appliedVoucher & voucherDiscount
    ↓
12. Tổng tiền được tính lại tự động (useMemo)
```

## 📦 Dependencies

### Packages Cần Có
- `antd`: Sử dụng `message` component cho notifications
- `@heroicons/react`: Icons cho UI
- Existing: voucherService đã được tạo

## 🐛 Troubleshooting

### Issue 1: Không load được vouchers
**Nguyên nhân:** shopId hoặc productIds không hợp lệ
**Giải pháp:** 
- Kiểm tra cấu trúc dữ liệu của checkoutItems
- Đảm bảo checkoutItems có field `shopId` hoặc `sellerId`
- Đảm bảo checkoutItems có field `productId`

### Issue 2: Voucher không validate
**Nguyên nhân:** Dữ liệu từ API không đúng format
**Giải pháp:**
- Kiểm tra response structure từ API
- Đảm bảo có các field: isActive, usageLimit, usedCount, startDate, endDate, minOrderValue

### Issue 3: Discount tính sai
**Nguyên nhân:** previewDiscount không có hoặc discountType không match
**Giải pháp:**
- Ưu tiên sử dụng previewDiscount.discountAmount từ API
- Fallback sang calculation local nếu không có previewDiscount

## 🧪 Testing

### Test Cases

1. **Load Vouchers**
   - Có shopId & cartItems → Gọi API thành công
   - Không có shopId → Không gọi API
   - cartItems rỗng → Không gọi API

2. **Display Vouchers**
   - Loading state hiển thị
   - Empty state khi không có voucher
   - Voucher list hiển thị đúng thông tin

3. **Validate Voucher**
   - Inactive voucher → Hiển thị lỗi
   - Hết lượt sử dụng → Hiển thị lỗi
   - Chưa đến ngày bắt đầu → Hiển thị lỗi
   - Đã hết hạn → Hiển thị lỗi
   - Đơn hàng < minOrderValue → Hiển thị lỗi
   - Valid voucher → Áp dụng thành công

4. **Calculate Discount**
   - PERCENTAGE với maxDiscountAmount → Giảm đúng
   - PERCENTAGE không có max → Giảm đúng %
   - FIXED_AMOUNT → Giảm đúng số tiền

## 📝 Notes

1. **shopId Detection:** Hiện tại shopId được lấy từ item đầu tiên trong checkoutItems. Giả sử tất cả items trong checkout thuộc cùng 1 shop. Nếu hỗ trợ multi-shop checkout, cần refactor.

2. **previewDiscount:** API trả về preview discount đã tính sẵn, ưu tiên sử dụng giá trị này thay vì tính local.

3. **Error Handling:** API errors được log console nhưng không hiển thị cho user để tránh làm gián đoạn flow checkout.

4. **Re-fetch:** Vouchers được fetch lại khi shopId, cartItems, hoặc subtotal thay đổi.

5. **Ant Design Message:** Sử dụng `message.success()` và `message.error()` thay vì `alert()` để có UX tốt hơn.

## 🎨 UI/UX Improvements

- ✅ Loading indicator khi fetch vouchers
- ✅ Empty state khi không có voucher
- ✅ Disabled state cho voucher không hợp lệ
- ✅ Preview discount amount hiển thị rõ ràng
- ✅ Success/error notifications với Ant Design message
- ✅ Voucher code & discount type display
- ✅ Validation messages rõ ràng

## 🚀 Next Steps

1. **Apply Voucher to Order:** Integrate voucher vào order creation API
2. **User Voucher History:** Hiển thị vouchers đã sử dụng
3. **Voucher Recommendations:** Suggest best voucher cho user
4. **Multi-shop Support:** Hỗ trợ vouchers từ nhiều shops khác nhau
5. **Stack Vouchers:** Cho phép áp dụng nhiều vouchers (nếu business logic cho phép)
