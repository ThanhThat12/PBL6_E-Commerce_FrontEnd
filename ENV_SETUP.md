# Cấu Hình Environment Variables cho Frontend

## Tạo file `.env`

Tạo file `.env` trong thư mục `ecommerce-frontend` với nội dung sau:

```env
# API Base URL Configuration
# Thay đổi IP_ADDRESS bằng IP của máy chạy backend
# Ví dụ: REACT_APP_API_BASE_URL=https://192.168.1.100:8081/api/
# Hoặc nếu không dùng HTTPS: REACT_APP_API_BASE_URL=http://192.168.1.100:8081/api/
REACT_APP_API_BASE_URL=https://localhost:8081/api/
```

## Hướng Dẫn

1. **Lấy IP của máy chạy backend:**
   - Windows: `ipconfig` → tìm IPv4 Address
   - Linux/Mac: `ifconfig` hoặc `ip addr`

2. **Cập nhật `.env`:**
   - Thay `localhost` bằng IP thực tế (ví dụ: `192.168.1.100`)
   - Nếu backend chạy HTTP thay vì HTTPS, đổi `https://` thành `http://`

3. **Khởi động lại frontend** sau khi thay đổi `.env`

## Ví Dụ

Nếu IP máy backend là `192.168.1.100`:
```env
REACT_APP_API_BASE_URL=https://192.168.1.100:8081/api/
```

Nếu dùng HTTP:
```env
REACT_APP_API_BASE_URL=http://192.168.1.100:8081/api/
```

