import React from 'react';
import toast from 'react-hot-toast';
import chatService from '../services/chatService';

/**
 * Custom hook to handle chat with shop functionality
 * Includes ownership validation and error handling
 */
const useChatWithShop = (isAuthenticated, isShopOwner, navigate) => {
  const handleChatWithShop = async (shopId) => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để chat với shop');
      navigate('/login');
      return;
    }
    
    if (isShopOwner) {
      toast.error('Bạn không thể chat với shop của chính mình');
      return;
    }
    
    if (!shopId) {
      toast.error('Không tìm thấy thông tin shop');
      return;
    }
    
    try {
      const loadingToast = toast.loading('Đang mở chat với shop...');
      
      const apiResponse = await chatService.createConversation({
        type: 'SHOP',
        shopId: parseInt(shopId),
      });
      
      toast.dismiss(loadingToast);
      
      // ✅ FIX: apiResponse chính là conversation object, không cần .data
      const conversationData = apiResponse;
      
      if (conversationData && conversationData.id) {
        console.log('[ChatWithShop] ✅ Conversation created:', conversationData);
        
        const event = new CustomEvent('openChat', { 
          detail: { conversationId: conversationData.id } 
        });
        console.log('[ChatWithShop] 📤 Dispatching openChat event');
        window.dispatchEvent(event);
        
        toast.success('Chat đã mở!');
      } else {
        console.error('Invalid conversation response:', apiResponse);
        toast.error('Không thể tạo cuộc trò chuyện');
      }
    } catch (error) {
      console.error('Error opening chat:', error);
      const errorMessage = error.response?.data?.message || '';
      
      if (error.response?.status === 403 || 
          errorMessage.includes('shop của chính mình') || 
          errorMessage.includes('own shop')) {
        toast.error('Bạn không thể chat với shop của chính mình');
      } else {
        toast.error(errorMessage || 'Không thể mở chat với shop');
      }
    }
  };
  
  return { handleChatWithShop };
};

export default useChatWithShop;