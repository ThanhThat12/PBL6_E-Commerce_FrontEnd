# Chat Image & Emoji Feature Guide

## Features Added
✅ **Emoji Picker** - Chọn emoji để thêm vào tin nhắn
✅ **Image Upload** - Gửi ảnh trong chat
✅ **Image Preview** - Xem trước ảnh trước khi gửi
✅ **Image Display** - Hiển thị ảnh trong tin nhắn

## Installation Required

Before using, you need to install the emoji picker library:

```bash
cd ecommerce-frontend
npm install emoji-picker-react
```

## Cloudinary Configuration

The image upload uses Cloudinary. You need to configure:

### In MessageInput.jsx (line ~113):

```javascript
const response = await fetch(
  'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
  {
    method: 'POST',
    body: formData,
  }
);
```

Replace `YOUR_CLOUD_NAME` with your actual Cloudinary cloud name.

### Upload Preset

Create an unsigned upload preset in Cloudinary:
1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Set preset name to `ml_default` (or change it in the code)
5. Set Signing Mode to "Unsigned"
6. Save

## How to Use

### Sending Emoji
1. Click the smile icon (😊) button
2. Search or select an emoji from the picker
3. Emoji will be inserted at cursor position
4. Click outside to close the picker

### Sending Images
1. Click the image icon (🖼️) button
2. Select an image file (max 5MB)
3. Preview will appear above the input
4. Click Send button to upload and send
5. Click X button to cancel

## Features

### Emoji Picker
- Search functionality
- Recent emojis
- Categories
- Vietnamese interface

### Image Upload
- File type validation (only images)
- File size validation (max 5MB)
- Preview before sending
- Upload progress indication
- Click image in chat to view full size in new tab

### Backend Support
✅ Backend already supports `IMAGE` message type
✅ MessageList already handles image rendering
✅ No backend changes needed

## UI Components Updated

### MessageInput.jsx
- Added emoji picker toggle
- Added file input for images
- Added image preview UI
- Added Cloudinary upload logic

### MessageInput.css
- Emoji picker positioning
- Image preview styles
- Active button states

## Notes
- Images are uploaded to Cloudinary before sending
- Image URL is stored in message content
- MessageType is set to 'IMAGE' for image messages
- Text messages remain MessageType 'TEXT'
- Users can send either text OR image, not both in one message
- Emoji can be combined with text messages

## Future Improvements
- [ ] Support multiple images
- [ ] Image compression before upload
- [ ] Drag & drop image upload
- [ ] Paste image from clipboard
- [ ] GIF support
- [ ] Video support
- [ ] File attachments (PDF, etc.)
