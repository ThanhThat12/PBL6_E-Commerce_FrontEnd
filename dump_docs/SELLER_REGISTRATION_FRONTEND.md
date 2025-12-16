# Frontend Seller Registration & Approval Flows

_Last updated: 2025-12-11_

## 1. Overview

Hệ thống cho phép **BUYER** đăng ký trở thành **SELLER** và **ADMIN** phê duyệt hoặc từ chối đơn đăng ký. Toàn bộ luồng được xử lý ở frontend thông qua các page sau:

- Buyer side
  - `SellerRegistrationPage.jsx` (`/seller/register`)
  - `RegistrationStatusPage.jsx` (`/seller/registration-status`)
  - `RejectionStatusPage.jsx` (`/seller/rejected`)
  - `SellerRegistrationGuard.jsx` (route guard quyết định điều hướng theo trạng thái đơn)
- Admin side
  - `SellerRegistrationsPage.jsx` (`/admin/seller-registrations`) – danh sách và màn hình chi tiết phê duyệt

Ngoài ra còn có tích hợp với **navbar notifications** để hiển thị trạng thái đơn đăng ký ở icon chuông.

---

## 2. Buyer: Đăng ký lên làm Seller

### 2.1 Route & Guard

- Route chính cho form đăng ký:
  - `path="/seller/register"` → `SellerRegistrationPage`
  - Được bọc bởi `ProtectedRoute` + `SellerRegistrationGuard`
- `SellerRegistrationGuard` hoạt động như sau (BUYER):
  - Nếu chưa có đơn đăng ký → cho vào form `/seller/register`
  - Nếu đơn `PENDING` → điều hướng `/seller/registration-status`
  - Nếu đơn `REJECTED` → điều hướng `/seller/rejected`
  - Nếu shop `ACTIVE` nhưng user vẫn BUYER (case hiếm) → điều hướng `/seller/dashboard`
  - Khi click "Chỉnh sửa đơn đăng ký" từ trang từ chối, guard nhận biết **edit mode** qua:
    - `location.state.isEditing === true`, **hoặc**
    - query string `?mode=edit`
  - Trong edit mode, guard **không redirect** nữa, cho phép hiển thị lại form với data cũ.

### 2.2 `SellerRegistrationPage.jsx`

File chính điều khiển toàn bộ form nhiều bước.

**Trách nhiệm chính:**
- Xác định mode:
  - `isEditing` (đang sửa đơn bị từ chối) từ `location.state` hoặc `?mode=edit`
- Quản lý state:
  - `formData` – thông tin shop, địa chỉ, KYC, logo, banner
  - `uploading` – trạng thái upload từng loại ảnh
  - `currentStep` – bước hiện tại (1: shop, 2: địa chỉ, 3: KYC)
  - `canSubmit`, `existingStatus`, `checkingEligibility` – kiểm tra xem user có được phép tạo đơn mới hay đã có đơn PENDING/REJECTED
  - `editRejectionReason` – lưu lý do từ chối để hiển thị khi ở mode chỉnh sửa
- Side effects chính:
  - **Fetch dữ liệu đơn REJECTED** khi `isEditing === true`:
    - Gọi `getRegistrationStatus()`
    - Pre-fill `formData` với dữ liệu shop, địa chỉ, logo
    - Gọi `selectProvince` và `selectDistrict` để đổ dropdown địa chỉ
    - Yêu cầu người dùng nhập lại số CMND/CCCD và upload lại ảnh KYC
  - **Kiểm tra eligibility** với `canSubmitRegistration()`:
    - Nếu không thể submit và đã có `existingStatus`, hiển thị màn hình tóm tắt đơn hiện tại (PENDING / REJECTED).

### 2.3 Các component con

Để tránh file quá lớn, form được tách thành các component nhỏ trong `src/components/seller/registration/`:

- `RegistrationHeader.jsx`
  - Hiển thị icon + tiêu đề
  - Nội dung thay đổi theo `isEditing`:
    - Create: "Đăng ký bán hàng"
    - Edit: "Cập nhật đơn đăng ký"

- `RejectionAlert.jsx`
  - Chỉ render khi `isEditing` và có `rejectionReason`
  - Hiển thị lý do từ chối do admin gửi kèm box hướng dẫn người dùng chỉnh sửa lại hồ sơ.

- `RegistrationStepper.jsx`
  - Hiển thị các step (1–3) + label: "Thông tin shop", "Địa chỉ", "Xác thực"
  - Nhận prop `currentStep` để highlight bước hiện tại.

- `StepShopInfo.jsx` (Step 1)
  - Form nhập:
    - `shopName`, `description`, `shopPhone`, `shopEmail`
    - Upload **logo** (optional)
    - Upload **banner** (optional)
  - Nhận props:
    - `formData`, `uploading`
    - `onChange` (input change)
    - `onUpload` (upload ảnh logo/banner)
    - `onRemove` (xóa ảnh hiện tại)

- `StepAddress.jsx` (Step 2)
  - Form địa chỉ lấy hàng:
    - Dropdown tỉnh / quận / phường dùng hook `useAddressMaster`
    - `fullAddress`, `contactName`, `contactPhone`
  - Nhận props:
    - `formData`
    - `provinces`, `districts`, `wards`
    - `loadingProvinces`, `loadingDistricts`, `loadingWards`
    - `onProvinceChange`, `onDistrictChange`, `onWardChange`, `onChange`

- `StepKyc.jsx` (Step 3)
  - Thông tin xác thực danh tính:
    - `idCardNumber`, `idCardName`
    - Upload ảnh: mặt trước, mặt sau CMND/CCCD (bắt buộc), ảnh selfie cầm giấy tờ (khuyến khích)
    - Panel thông tin về bảo mật KYC
    - Panel phương thức thanh toán (hiện tại COD mặc định)
  - Nhận props tương tự Step1 (cho ảnh + input):
    - `formData`, `uploading`, `onChange`, `onUpload`, `onRemove`

- `LoadingPanel.jsx`
  - Dùng khi `checkingEligibility === true` (màn hình loading khởi tạo)

- `AlreadySellerPanel.jsx`
  - Render khi user đã có role SELLER
  - Hiển thị thông điệp "Bạn đã là Người bán!" + nút chuyển đến `/seller/dashboard`.

- `ExistingApplicationPanel.jsx`
  - Render khi **không được phép submit** (`!canSubmit`) và đã có `existingStatus`
  - Hiển thị 2 trạng thái:
    - `PENDING`: đơn đang chờ duyệt
    - `REJECTED`: đơn bị từ chối, kèm lý do
  - Có nút "Đăng ký lại" (hiện tại reset local state `canSubmit` và `existingStatus`; backend cancel API có thể bổ sung sau).

### 2.4 Validation & Submit

- Hàm `validateStep(step)` trong `SellerRegistrationPage.jsx` đảm bảo từng bước đủ dữ liệu trước khi chuyển bước hoặc submit:
  - Step 1: tên shop, số điện thoại (pattern), email (pattern)
  - Step 2: tỉnh, quận, phường, địa chỉ chi tiết
  - Step 3: số CMND/CCCD (9 hoặc 12 số), họ tên, đủ ảnh mặt trước & mặt sau
- Submit:
  - Nếu `isEditing === true` → gọi `updateRejectedApplication(formData)`
  - Nếu đăng ký mới → gọi `submitSellerRegistration(formData)`
  - Sau khi submit thành công → điều hướng `/seller/registration-status`.

---

## 3. Buyer: Trang trạng thái & trang từ chối

### 3.1 `RegistrationStatusPage.jsx` (`/seller/registration-status`)

- Lấy `getRegistrationStatus()` để hiển thị trạng thái hiện tại:
  - `PENDING`: thông báo đang chờ duyệt
  - `ACTIVE`: có thể redirect sang `/seller/dashboard` nếu cần
- Dùng cùng layout với Navbar/Footer để thống nhất UI.

### 3.2 `RejectionStatusPage.jsx` (`/seller/rejected`)

- Gọi `getRegistrationStatus()` để hiển thị:
  - Tên shop
  - Lý do bị từ chối
  - Thời gian xét duyệt
- Nút hành động:
  - **"Chỉnh sửa đơn đăng ký"**
    - `navigate('/seller/register?mode=edit', { state: { isEditing: true, shopId, rejectionReason } })`
    - Nhờ đó, guard + form hiểu là đang ở **edit mode**, tải dữ liệu cũ và hiển thị lý do.
  - **"Quay lại trang chủ"**

---

## 4. Admin: Duyệt Seller

### 4.1 Route & Component

- Route admin để quản lý đơn đăng ký seller:
  - `path="/admin/seller-registrations"`
  - Được bọc bởi `ProtectedRouteAdmin` → chỉ ADMIN mới truy cập được.
  - Component chính: `SellerRegistrationsPage.jsx` (trong `src/pages/admin/...`).

### 4.2 Chức năng chính (Admin UI)

_Tùy vào implement hiện có, chức năng bao gồm:_

- Danh sách các đơn đăng ký seller:
  - Thông tin cơ bản: tên shop, người đăng ký, ngày nộp, trạng thái hiện tại.
  - Bộ lọc theo trạng thái (PENDING, ACTIVE, REJECTED).
- Màn hình chi tiết đơn đăng ký:
  - Xem thông tin shop, địa chỉ, KYC (tối thiểu là số CMND/CCCD, họ tên, ảnh giấy tờ)
  - Xem lịch sử xử lý (nếu có).
- Hành động của admin:
  - **Phê duyệt (APPROVE)**:
    - Cập nhật trạng thái shop → `ACTIVE`
    - Backend gửi notification kiểu `SHOP_APPROVED` cho user.
  - **Từ chối (REJECT)**:
    - Nhập lý do từ chối (bắt buộc)
    - Cập nhật trạng thái → `REJECTED`
    - Backend gửi notification kiểu `SHOP_REJECTED` kèm lý do.

---

## 5. Thông báo & Navbar Integration

### 5.1 WebSocket Notifications

- Backend gửi notification qua WebSocket với các type:
  - `SHOP_APPROVED`
  - `SHOP_REJECTED`
- Frontend nhận qua `NotificationContext` và use hook:
  - `useShopRegistrationNotifications()`
    - Khi `SHOP_APPROVED` → hiện toast success, reload để sync role/quyền SELLER
    - Khi `SHOP_REJECTED` → hiện toast error với lý do, hướng dẫn user bấm chuông hoặc nút Kênh người bán để xem chi tiết.

### 5.2 Chuông thông báo trên Navbar

- Component: `NotificationButton.jsx`
- Navbar truyền vào:
  - `notifications`, `onMarkAsRead`, `onClearAll`
  - `registrationStatus`, `checkingRegistration`
- Dropdown sẽ có **thêm một thẻ trạng thái shop** ở trên đầu:
  - `PENDING`: box vàng, text "Đơn đăng ký shop đang chờ duyệt", link xem `/seller/registration-status`.
  - `REJECTED`: box đỏ, text "Đơn đăng ký shop bị từ chối" + lý do (nếu có), link `/seller/rejected`.
  - `ACTIVE`: box xanh, text "Shop đã được phê duyệt", link `/seller/dashboard`.
- Badge số lượng trên icon chuông **chỉ** đếm số thông báo chưa đọc, **không** cộng thêm vì trạng thái shop.

---

## 6. Cách kiểm thử nhanh

### 6.1 Flow Buyer

1. Đăng nhập bằng tài khoản BUYER.
2. Mở `/seller/register` từ navbar (nút "Bán hàng cùng SportZone").
3. Điền đủ 3 step và submit:
   - Xác nhận được điều hướng sang `/seller/registration-status` với trạng thái PENDING.
4. Đăng nhập admin, phê duyệt hoặc từ chối đơn tại `/admin/seller-registrations`.
5. Quay lại BUYER:
   - Kiểm tra chuông thông báo hiển thị đúng:
     - APPROVED → thông báo + box xanh trong dropdown, có thể vào `/seller/dashboard`.
     - REJECTED → thông báo + box đỏ trong dropdown, bấm "Xem chi tiết" → `/seller/rejected`.
6. Từ `/seller/rejected`, bấm "Chỉnh sửa đơn đăng ký":
   - URL `/seller/register?mode=edit` được mở
   - Form được pre-fill, hiện reason reject phía trên, **không xảy ra vòng lặp redirect**.

### 6.2 Flow Admin

1. Đăng nhập tài khoản ADMIN.
2. Truy cập `/admin/seller-registrations`.
3. Kiểm tra danh sách đơn mới PENDING.
4. Xem chi tiết, chọn **Phê duyệt** hoặc **Từ chối**:
   - Xác nhận BUYER nhận notification tương ứng trong navbar và toast.

---

## 7. Mở rộng / Refactor thêm

- Có thể tách logic `validateStep`, `handleSubmit`, upload ảnh… ra một custom hook `useSellerRegistrationForm()` để giảm code trong `SellerRegistrationPage.jsx`.
- Bổ sung trang lịch sử xử lý cho ADMIN (log approve/reject).
- Thêm filter, sort nâng cao cho `SellerRegistrationsPage.jsx`.
