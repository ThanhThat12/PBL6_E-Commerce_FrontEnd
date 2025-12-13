# Chat Image & Emoji - Setup Complete ✅

## Tính năng đã hoàn thành

### 1. ✅ Gửi Emoji
- Click nút mặt cười (😊) để mở bộ chọn emoji
- Tìm kiếm và chọn emoji từ các danh mục
- Emoji được chèn vào tin nhắn text
- Click bên ngoài để đóng bộ chọn

### 2. ✅ Gửi Ảnh
- Click nút ảnh (🖼️) để chọn file
- Xem trước ảnh trước khi gửi
- Tự động upload lên Cloudinary qua backend
- Click X để hủy gửi
- Click vào ảnh trong chat để xem full size

## Cấu hình Backend (Đã có sẵn)

### API Endpoint
```
POST /api/images/upload
- Headers: Authorization Bearer token
- Body: multipart/form-data
  - file: image file
  - folder: "chat" (tự động tạo folder chat)
```

### Cloudinary Config (application.properties)
```properties
cloudinary.cloud-name=dejjhkhl1
cloudinary.api-key=946896237872417
cloudinary.api-secret=HlFd3YbbJ9qw2ScpdOGp4OkFY20
cloudinary.secure=true
```

### Image Validation
- Max size: 5MB
- Allowed formats: jpg, jpeg, png, webp
- Min dimensions: 100x100
- Max dimensions: 4096x4096

## Cài đặt Frontend

### Bước 1: Cài đặt thư viện emoji picker
```bash
cd ecommerce-frontend
npm install emoji-picker-react
```

### Bước 2: Không cần cấu hình gì thêm
- Backend đã có sẵn API upload image
- Frontend đã được cấu hình sử dụng API backend
- Token authentication tự động được thêm vào header

## Cách sử dụng

### Gửi Emoji
1. Click nút smile (😊)
2. Chọn emoji từ danh sách hoặc tìm kiếm
3. Emoji tự động chèn vào input
4. Gõ thêm text nếu cần
5. Click Send hoặc Enter để gửi

### Gửi Ảnh
1. Click nút image (🖼️)
2. Chọn file ảnh (jpg, jpeg, png, webp)
3. Xem preview ảnh
4. Click Send để upload và gửi
5. Hoặc click X để hủy

### Xem Ảnh
- Click vào bất kỳ ảnh nào trong chat
- Ảnh sẽ mở trong tab mới với kích thước đầy đủ

## Chi tiết kỹ thuật

### Frontend Files Modified
1. **MessageInput.jsx**
   - Import `uploadChatImage` từ chatService
   - Xử lý upload qua backend API
   - Quản lý emoji picker state
   - Hiển thị image preview

2. **chatService.js**
   - Thêm function `uploadChatImage(file)`
   - POST to `/api/images/upload`
   - Folder: "chat"

3. **MessageInput.css**
   - Style cho emoji picker popup
   - Style cho image preview
   - Active button states

### Backend Files (Already Exist)
1. **CommonImageController.java**
   - Endpoint: POST `/api/images/upload`
   - Validates image (size, format, dimensions)
   - Uploads to Cloudinary
   - Returns URL and transformations

2. **CloudinaryClient.java**
   - Handles actual Cloudinary upload
   - Generates transformed URLs (thumbnail, medium, large)

3. **ImageValidationUtil.java**
   - Validates file type
   - Validates file size (max 5MB)
   - Validates image dimensions

### Message Flow

#### Text + Emoji Message
```
User types text + selects emoji
  ↓
Click Send
  ↓
onSendMessage({ content: "text 😊", messageType: "TEXT" })
  ↓
WebSocket sends to backend
  ↓
Message saved to DB
  ↓
Broadcast to conversation members
```

#### Image Message
```
User selects image file
  ↓
Show preview
  ↓
Click Send
  ↓
uploadChatImage(file) → POST /api/images/upload
  ↓
Backend validates & uploads to Cloudinary
  ↓
Returns image URL
  ↓
onSendMessage({ content: "https://cloudinary.../image.jpg", messageType: "IMAGE" })
  ↓
WebSocket sends to backend
  ↓
Message saved to DB with type=IMAGE
  ↓
Broadcast to conversation members
  ↓
MessageList renders <img> tag for IMAGE type
```

### Storage Structure

#### Cloudinary Folder
```
chat/
  ├── chat_123_1733724567890.jpg
  ├── chat_456_1733724578123.png
  └── chat_789_1733724589456.webp
```

Format: `chat_{userId}_{timestamp}.{extension}`

#### Database
```sql
Message {
  id: 123,
  content: "https://res.cloudinary.com/dejjhkhl1/image/upload/v1733724567/chat/chat_123_1733724567890.jpg",
  messageType: "IMAGE",
  sender_id: 123,
  conversation_id: 45,
  created_at: "2024-12-09 10:30:00"
}
```

## Tính năng Backend có sẵn

### Image Transformations
Backend tự động tạo các version khác nhau:
- ORIGINAL: Ảnh gốc
- THUMBNAIL: 150x150
- SMALL: 300x300
- MEDIUM: 800x800
- LARGE: 1200x1200

Response structure:
```json
{
  "status": "success",
  "data": {
    "url": "https://res.cloudinary.com/.../chat_123_xxx.jpg",
    "publicId": "chat/chat_123_xxx",
    "transformations": {
      "ORIGINAL": "https://...",
      "THUMBNAIL": "https://...c_fill,h_150,w_150/...",
      "SMALL": "https://...c_fill,h_300,w_300/...",
      "MEDIUM": "https://...c_fill,h_800,w_800/...",
      "LARGE": "https://...c_fill,h_1200,w_1200/..."
    },
    "width": 1920,
    "height": 1080
  }
}
```

### Security
- ✅ Requires authentication (`@PreAuthorize("isAuthenticated()")`)
- ✅ Token từ localStorage tự động thêm vào header
- ✅ Validates user permission
- ✅ Validates file type and size
- ✅ Prevents malicious uploads

## Testing

### Test Emoji
1. Mở chat window
2. Click nút smile
3. Chọn emoji bất kỳ
4. Kiểm tra emoji hiển thị trong input
5. Gửi tin nhắn
6. Kiểm tra emoji hiển thị đúng trong MessageList

### Test Image Upload
1. Mở chat window
2. Click nút image
3. Chọn file ảnh hợp lệ (< 5MB, jpg/png/webp)
4. Kiểm tra preview hiển thị
5. Click Send
6. Kiểm tra loading state
7. Kiểm tra ảnh hiển thị trong MessageList
8. Click vào ảnh để mở tab mới

### Test Error Cases
1. **File quá lớn**: Chọn file > 5MB → Alert error
2. **File không phải ảnh**: Chọn PDF/DOC → Alert error
3. **Cancel upload**: Preview ảnh → Click X → Kiểm tra state reset
4. **Network error**: Disconnect internet → Upload → Alert error

## Notes

### Differences from Previous Version
- ❌ KHÔNG còn gọi trực tiếp Cloudinary API từ frontend
- ✅ Upload qua backend API `/api/images/upload`
- ✅ Backend xử lý authentication và validation
- ✅ Secure hơn (API secret không expose)
- ✅ Có logging và error handling tốt hơn

### Future Improvements
- [ ] Multiple image upload (carousel)
- [ ] Image compression trước khi upload
- [ ] Drag & drop image
- [ ] Paste image from clipboard (Ctrl+V)
- [ ] Video support
- [ ] File attachments (PDF, DOC, etc.)
- [ ] GIF support from GIPHY
- [ ] Image editing (crop, rotate, filter)
- [ ] Progress bar for upload
- [ ] Lazy loading for images in chat history

## Troubleshooting

### Emoji picker không hiển thị
```bash
# Kiểm tra package đã cài
npm list emoji-picker-react

# Nếu chưa có, cài lại
npm install emoji-picker-react
```

### Upload failed
1. Kiểm tra token authentication
2. Kiểm tra backend đang chạy
3. Kiểm tra Cloudinary credentials trong application.properties
4. Kiểm tra network tab trong browser DevTools
5. Xem logs backend để biết lỗi chi tiết

### Image không hiển thị
1. Kiểm tra URL trong message.content
2. Kiểm tra CORS settings
3. Kiểm tra Cloudinary delivery settings
4. F12 → Network tab → Xem image request

### Emoji không gửi được
1. Kiểm tra UTF-8 encoding
2. Kiểm tra database charset (utf8mb4)
3. Kiểm tra backend logging

## Success! 🎉

Hệ thống chat của bạn bây giờ đã có:
- ✅ Gửi text message
- ✅ Gửi emoji
- ✅ Gửi hình ảnh
- ✅ Notification realtime
- ✅ Read status
- ✅ Typing indicator
- ✅ Image preview
- ✅ Secure upload qua backend
- ✅ Auto-save to Cloudinary
- ✅ Click to view full size

All ready to use! 🚀
