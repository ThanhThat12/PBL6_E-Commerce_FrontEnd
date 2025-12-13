import React from 'react';
import './ChatButton.css';
import { MessageCircle } from 'lucide-react';
import chatService from '../../../services/chatService';

/**
 * ChatButton - Nút để mở chat với shop hoặc về order
 * Có thể đặt trong trang sản phẩm, trang shop, chi tiết đơn hàng
 */
const ChatButton = ({ type, orderId, shopId, shopName, className = '', label }) => {
  const handleOpenChat = async () => {
    try {
      // Create or get conversation
      const requestData = {
        type: type, // 'ORDER', 'SHOP', or 'SUPPORT'
      };

      if (type === 'ORDER' && orderId) {
        requestData.orderId = orderId;
      } else if (type === 'SHOP' && shopId) {
        requestData.shopId = shopId;
      }

      const response = await chatService.createConversation(requestData);
      console.log('Conversation created/retrieved:', response.data);

      // Notify user to check chat window
      alert('Vui lòng kiểm tra cửa sổ chat ở góc phải màn hình');
      
      // Optional: Emit event to open chat window
      window.dispatchEvent(new CustomEvent('openChat', { 
        detail: { conversationId: response.data.id } 
      }));
    } catch (error) {
      console.error('Error opening chat:', error);
      alert('Không thể mở chat. Vui lòng thử lại.');
    }
  };

  const getButtonLabel = () => {
    if (label) return label;
    
    switch (type) {
      case 'ORDER':
        return 'Chat với người bán';
      case 'SHOP':
        return `Chat với ${shopName || 'Shop'}`;
      case 'SUPPORT':
        return 'Chat hỗ trợ';
      default:
        return 'Chat';
    }
  };

  return (
    <button 
      className={`chat-button ${className}`}
      onClick={handleOpenChat}
    >
      <MessageCircle size={18} />
      <span>{getButtonLabel()}</span>
    </button>
  );
};

export default ChatButton;
