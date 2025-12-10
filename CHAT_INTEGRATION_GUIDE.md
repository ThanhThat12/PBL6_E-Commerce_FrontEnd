# 💬 HƯỚNG DẪN SỬ DỤNG CHAT SYSTEM

## 🎯 Tổng Quan

Hệ thống chat đã được tích hợp vào frontend với **floating chat window** ở góc phải màn hình. Chat hoạt động real-time thông qua WebSocket.

---

## ✨ Tính Năng

- ✅ **Floating Chat Window** - Cửa sổ chat nổi ở góc phải, không chiếm trang
- ✅ **Real-time Messaging** - Tin nhắn real-time qua WebSocket
- ✅ **Typing Indicators** - Hiển thị khi người khác đang gõ
- ✅ **Multiple Conversation Types**:
  - ORDER - Chat về đơn hàng
  - SHOP - Chat với shop
  - SUPPORT - Chat hỗ trợ
- ✅ **Message Status** - Hiển thị trạng thái tin (Đang gửi, Đã gửi, Đã nhận)
- ✅ **Unread Count** - Đếm số tin chưa đọc
- ✅ **Minimize/Maximize** - Thu nhỏ hoặc phóng to cửa sổ chat

---

## 🚀 Đã Tích Hợp

### 1. ChatContainer đã được thêm vào App.js

```jsx
// App.js
import { ChatContainer } from './components/chat';

function App() {
  return (
    <GoogleOAuthProvider>
      <BrowserRouter>
        {/* ... Routes ... */}
        
        {/* Chat Floating Window */}
        <ChatContainer />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
```

### 2. Components đã tạo

```
src/components/chat/
├── ChatContainer.jsx          # Main container quản lý chat
├── ChatFloatingButton/        # Nút floating ở góc phải
│   ├── ChatFloatingButton.jsx
│   ├── ChatFloatingButton.css
│   └── index.js
├── ChatWindow/                # Cửa sổ chat chính
│   ├── ChatWindow.jsx
│   ├── ChatWindow.css
│   └── index.js
├── ChatButton/                # Nút mở chat (để đặt trong pages)
│   ├── ChatButton.jsx
│   ├── ChatButton.css
│   └── index.js
├── RoomList/                  # Danh sách conversations
│   ├── RoomList.jsx
│   ├── RoomList.css
│   └── index.js
├── MessageList/               # Danh sách tin nhắn
│   ├── MessageList.jsx
│   ├── MessageList.css
│   └── index.js
├── MessageInput/              # Input gửi tin nhắn
│   ├── MessageInput.jsx
│   ├── MessageInput.css
│   └── index.js
└── index.js                   # Export all components
```

### 3. Services đã tạo

```javascript
// src/services/chatService.js
- createConversation()      // Tạo hoặc lấy conversation
- getMyConversations()       // Lấy danh sách conversations
- getConversationDetails()   // Lấy chi tiết conversation
- getConversationMessages()  // Lấy tin nhắn
- sendMessage()              // Gửi tin nhắn (REST fallback)
```

### 4. Hooks đã tạo

```javascript
// src/hooks/useChatWebSocket.js
- Connect WebSocket với JWT authentication
- Subscribe to conversation topics
- Send/receive messages real-time
- Typing indicators
- Delivery confirmations
```

---

## 📖 Cách Sử Dụng

### A. Chat Tự Động (Đã Tích Hợp)

Chat window sẽ tự động xuất hiện khi user đăng nhập. Floating button ở góc phải dưới màn hình:

```
┌─────────────────────────────────────┐
│                                     │
│        Your Page Content            │
│                                     │
│                                     │
│                            ┌────┐   │
│                            │ 💬 │   │ ← Floating Button
│                            └────┘   │
└─────────────────────────────────────┘
```

### B. Thêm Nút Chat vào Pages

#### 1. Trang Chi Tiết Đơn Hàng (OrderDetailPage)

```jsx
import { ChatButton } from '../../../components/chat';

function OrderDetailPage() {
  const { orderId } = useParams();
  
  return (
    <div>
      <h1>Chi tiết đơn hàng #{orderId}</h1>
      
      {/* Nút chat với người bán */}
      <ChatButton 
        type="ORDER" 
        orderId={orderId}
        label="Chat với người bán"
        className="primary"
      />
    </div>
  );
}
```

#### 2. Trang Shop (ShopDetailPage)

```jsx
import { ChatButton } from '../../../components/chat';

function ShopDetailPage() {
  const { shopId } = useParams();
  const [shop, setShop] = useState(null);
  
  return (
    <div>
      <h1>{shop?.name}</h1>
      
      {/* Nút chat với shop */}
      <ChatButton 
        type="SHOP" 
        shopId={shopId}
        shopName={shop?.name}
        className="outline"
      />
    </div>
  );
}
```

#### 3. Trang Hỗ Trợ

```jsx
import { ChatButton } from '../../../components/chat';

function SupportPage() {
  return (
    <div>
      <h1>Hỗ trợ khách hàng</h1>
      
      {/* Nút chat hỗ trợ */}
      <ChatButton 
        type="SUPPORT"
        label="Chat với Admin"
        className="primary lg"
      />
    </div>
  );
}
```

---

## 🎨 Customization

### Button Variants

```jsx
// Default
<ChatButton type="SHOP" shopId={1} />

// Primary (gradient background)
<ChatButton type="SHOP" shopId={1} className="primary" />

// Outline
<ChatButton type="SHOP" shopId={1} className="outline" />

// Small
<ChatButton type="SHOP" shopId={1} className="sm" />

// Large
<ChatButton type="SHOP" shopId={1} className="lg" />

// Custom label
<ChatButton 
  type="SHOP" 
  shopId={1} 
  label="Liên hệ ngay" 
/>
```

### Styling

Các file CSS có thể customize:
- `ChatFloatingButton.css` - Nút floating
- `ChatWindow.css` - Cửa sổ chat
- `MessageList.css` - Danh sách tin nhắn
- `MessageInput.css` - Input tin nhắn
- `RoomList.css` - Danh sách conversations

---

## 🔧 Testing

### 1. Kiểm tra Floating Button

1. Đăng nhập vào app
2. Kiểm tra góc phải dưới màn hình
3. Nhấn vào nút chat (💬)
4. Chat window sẽ mở ra

### 2. Kiểm tra Chat với Shop

1. Vào trang shop detail
2. Thêm ChatButton vào trang
3. Click nút "Chat với shop"
4. Conversation sẽ được tạo và mở trong chat window

### 3. Kiểm tra Chat về Order

1. Vào trang order detail
2. Thêm ChatButton type="ORDER"
3. Click nút "Chat với người bán"
4. Conversation về order sẽ được tạo

### 4. Kiểm tra Real-time Messaging

1. Mở 2 browser/tabs khác nhau
2. Đăng nhập 2 user (buyer & seller)
3. Mở cùng 1 conversation
4. Gửi tin nhắn từ 1 bên
5. Tin nhắn sẽ hiện ngay ở bên kia

---

## 🐛 Troubleshooting

### Issue 1: Không thấy Floating Button

**Nguyên nhân**: User chưa đăng nhập

**Giải pháp**: Đăng nhập trước khi sử dụng chat

### Issue 2: WebSocket không kết nối

**Kiểm tra**:
1. Backend có đang chạy không?
2. URL trong `.env` đúng chưa?
   ```
   REACT_APP_API_URL=https://localhost:8081
   ```
3. JWT token có hợp lệ không?

**Debug**:
```javascript
// Mở Console và kiểm tra logs
// Sẽ thấy:
✅ Chat WebSocket connected
📡 Subscribed to conversation {id}
```

### Issue 3: Tin nhắn không gửi được

**Kiểm tra**:
1. WebSocket đã connected chưa? (xem icon 🟢 ở header)
2. User có phải member của conversation không?
3. Kiểm tra Console logs để xem error

### Issue 4: Typing indicator không hoạt động

**Nguyên nhân**: Backend chưa implement typing indicator

**Giải pháp**: Đã implement đầy đủ trong backend, chỉ cần test lại

---

## 📊 API Endpoints

### REST API (Fallback)

```
POST   /api/conversations          # Tạo conversation
GET    /api/conversations/my        # Lấy danh sách conversations
GET    /api/conversations/{id}      # Chi tiết conversation
GET    /api/messages/conversation/{id}  # Lấy tin nhắn
POST   /api/messages                # Gửi tin (fallback)
```

### WebSocket Topics

```
SEND:
  /app/chat/send                    # Gửi tin nhắn
  /app/chat/typing                  # Gửi typing indicator

SUBSCRIBE:
  /topic/conversations/{id}         # Nhận tin nhắn
  /topic/conversations/{id}/typing  # Nhận typing indicator
  /user/{userId}/queue/confirmations # Delivery confirmations
  /user/{userId}/queue/notifications # Error notifications
```

---

## 📝 TODO / Future Enhancements

- [ ] Upload hình ảnh trong chat
- [ ] Emoji picker
- [ ] Read receipts (đã đọc)
- [ ] Message reactions
- [ ] Search messages
- [ ] Delete/Edit messages
- [ ] Online status indicators
- [ ] Push notifications
- [ ] Group chat
- [ ] Voice messages

---

## 🎉 Hoàn Thành!

Hệ thống chat đã được tích hợp hoàn chỉnh vào frontend. Bạn có thể:

1. ✅ Nhấn vào floating button để mở chat
2. ✅ Xem danh sách conversations
3. ✅ Chat real-time với người khác
4. ✅ Thêm ChatButton vào các pages khác nhau
5. ✅ Tạo conversation cho ORDER, SHOP, SUPPORT

**Next Steps**:
1. Test chat với 2 users khác nhau
2. Thêm ChatButton vào các pages cần thiết
3. Customize styling theo brand
4. Deploy và test production

🚀 Happy Chatting!
