import React, { useState, useRef, useEffect } from 'react';
import './MessageInput.css';
import { Send, Image as ImageIcon, Smile, X } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { uploadChatImage } from '../../../services/chatService';

/**
 * MessageInput - Input để gửi tin nhắn
 */
const MessageInput = ({ onSendMessage, disabled = false, placeholder = 'Nhập tin nhắn...', autoMessage, mode = 'chat', onChangeMode }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const autoMessageSentRef = useRef(false);

  // Auto-send message when autoMessage is provided
  useEffect(() => {
    if (autoMessage && !disabled && !autoMessageSentRef.current) {
      console.log('Auto-sending message:', autoMessage);
      autoMessageSentRef.current = true;
      
      // Wait a bit for connection to be ready
      setTimeout(() => {
        onSendMessage({
          content: autoMessage,
          messageType: 'TEXT',
        });
      }, 1000); // Increased delay to ensure WebSocket is ready
    }
  }, [autoMessage, disabled, onSendMessage]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Notify parent about typing
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If there's an image, send it
    if (imageFile && imagePreview) {
      handleSendImage();
      return;
    }

    // Otherwise send text message
    if (!message.trim() || disabled) {
      return;
    }

    onSendMessage({
      content: message.trim(),
      messageType: 'TEXT',
    });

    setMessage('');
    setIsTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Focus back to input
    inputRef.current?.focus();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh hợp lệ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSendImage = async () => {
    if (!imageFile || !imagePreview || isUploadingImage) return;

    setIsUploadingImage(true);

    try {
      // Upload to backend (which uses Cloudinary)
      const response = await uploadChatImage(imageFile);
      
      console.log('Upload response:', response);
      
      // Response structure: { status, message, data: { url, publicId, transformations, ... } }
      // axios interceptor already unwrapped response.data once
      const imageData = response.data;  // This is the ImageUploadResponse object
      
      if (!imageData) {
        console.error('No data in response:', response);
        throw new Error('No image data in response');
      }
      
      // Get URL (backend now returns HTTPS)
      const imageUrl = imageData.url || imageData.transformations?.ORIGINAL;
      
      if (!imageUrl) {
        console.error('No URL in image data:', imageData);
        throw new Error('No URL in response');
      }
      
      console.log('Using image URL:', imageUrl);
      
      // Send message with image URL
      onSendMessage({
        content: imageUrl,
        messageType: 'IMAGE',
      });

      // Clear image state
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể tải ảnh lên';
      alert(`Không thể tải ảnh lên: ${errorMessage}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form className="message-input-form" onSubmit={handleSubmit}>
      {/* Toggle between normal chat and chatbot */}
      {onChangeMode && (
        <div className="message-mode-toggle" role="tablist" aria-label="Chọn chế độ nhắn tin">
          <button
            type="button"
            className={`mode-btn ${mode === 'chat' ? 'active' : ''}`}
            onClick={() => onChangeMode('chat')}
          >
            Nhắn thường
          </button>
          <button
            type="button"
            className={`mode-btn ${mode === 'bot' ? 'active' : ''}`}
            onClick={() => onChangeMode('bot')}
          >
            Chatbot
          </button>
        </div>
      )}
      {/* Image Preview */}
      {imagePreview && (
        <div className="image-preview-container">
          <div className="image-preview-wrapper">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button
              type="button"
              className="remove-image-btn"
              onClick={handleRemoveImage}
              disabled={isUploadingImage}
            >
              <X size={16} />
            </button>
          </div>
          <p className="image-preview-text">
            {isUploadingImage ? 'Đang tải ảnh lên...' : 'Nhấn gửi để gửi ảnh'}
          </p>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="emoji-picker-wrapper">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
            searchPlaceholder="Tìm emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      <div className="message-input-wrapper">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={imagePreview ? 'Gửi ảnh...' : placeholder}
          className="message-input"
          disabled={disabled || isUploadingImage}
          rows={1}
          style={{
            minHeight: '40px',
            maxHeight: '120px',
            resize: 'none',
            overflow: 'auto',
          }}
        />
        
        <div className="message-input-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
          />
          
          <button
            type="button"
            className="message-input-action-btn"
            disabled={disabled || isUploadingImage}
            title="Đính kèm ảnh"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={20} />
          </button>
          
          <button
            type="button"
            className={`message-input-action-btn ${showEmojiPicker ? 'active' : ''}`}
            disabled={disabled || isUploadingImage}
            title="Emoji"
            onClick={toggleEmojiPicker}
          >
            <Smile size={20} />
          </button>
          
          <button
            type="submit"
            className="message-input-send-btn"
            disabled={disabled || isUploadingImage || (!message.trim() && !imagePreview)}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </form>
  );
};

export default MessageInput;
