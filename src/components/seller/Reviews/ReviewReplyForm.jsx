import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import reviewService from '../../../services/reviewService';

/**
 * ReviewReplyForm - Form phản hồi đánh giá
 * Component độc lập với state riêng để tránh re-render từ parent
 * Xử lý tốt tiếng Việt với IME
 */
const ReviewReplyForm = ({ reviewId, onReplySuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const handleOpen = () => {
    setIsOpen(true);
    // Focus textarea sau khi mở
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleClose = () => {
    setIsOpen(false);
    setText('');
  };

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    
    if (!trimmedText) {
      toast.error('Vui lòng nhập nội dung phản hồi');
      return;
    }

    setLoading(true);
    try {
      const payload = { sellerResponse: trimmedText };
      await reviewService.replyReview(reviewId, payload);
      
      toast.success('Đã gửi phản hồi thành công');
      handleClose();
      
      // Callback để parent reload reviews
      if (onReplySuccess) {
        onReplySuccess();
      }
    } catch (error) {
      console.error('Reply error:', error);
      toast.error(error.response?.data?.message || 'Không thể gửi phản hồi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="border-t pt-4">
        <button
          onClick={handleOpen}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiMessageCircle className="w-4 h-4" />
          Phản hồi đánh giá
        </button>
      </div>
    );
  }

  return (
    <div className="border-t pt-4">
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <FiMessageCircle className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Viết phản hồi</span>
        </div>
        
        {/* 
          Sử dụng uncontrolled component pattern để tránh vấn đề IME
          Chỉ update state khi blur hoặc submit
        */}
        <textarea
          ref={textareaRef}
          defaultValue={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          rows={3}
          placeholder="Viết phản hồi cho khách hàng..."
          disabled={loading}
        />
        
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || !text.trim()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="w-4 h-4" />
            {loading ? 'Đang gửi...' : 'Gửi phản hồi'}
          </button>
          <button
            onClick={handleClose}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <FiX className="w-4 h-4" />
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewReplyForm;
