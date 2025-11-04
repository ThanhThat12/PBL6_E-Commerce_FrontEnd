import { useEffect, useRef } from 'react';
import api from '../services/api';

/**
 * Hook to cleanup pending MoMo orders when user navigates away without completing payment
 * Should be used in components where user might abandon the payment flow
 */
const usePendingOrderCleanup = () => {
  const hasCleanedUp = useRef(false);

  useEffect(() => {
    const cleanupPendingOrder = async () => {
      // Chỉ cleanup một lần
      if (hasCleanedUp.current) return;

      const pendingOrderId = sessionStorage.getItem('pendingMomoOrderId');
      
      if (pendingOrderId) {
        console.log('🧹 Found pending MoMo order on mount:', pendingOrderId);
        console.log('🗑️ Cleaning up pending order...');
        
        try {
          await api.delete(`/api/orders/${pendingOrderId}`);
          console.log('✅ Pending order deleted successfully');
          sessionStorage.removeItem('pendingMomoOrderId');
          hasCleanedUp.current = true;
        } catch (error) {
          console.error('❌ Error deleting pending order:', error);
          // Vẫn xóa khỏi sessionStorage để tránh lặp lại
          sessionStorage.removeItem('pendingMomoOrderId');
          hasCleanedUp.current = true;
        }
      }
    };

    // Cleanup khi component mount (người dùng quay về từ trang khác)
    cleanupPendingOrder();

    // Cleanup khi người dùng đóng tab/window
    const handleBeforeUnload = async () => {
      const pendingOrderId = sessionStorage.getItem('pendingMomoOrderId');
      if (pendingOrderId && !hasCleanedUp.current) {
        // Sử dụng sendBeacon để gửi request ngay cả khi page đang unload
        const blob = new Blob([JSON.stringify({})], { type: 'application/json' });
        navigator.sendBeacon(`${process.env.REACT_APP_API_BASE_URL || ''}/api/orders/${pendingOrderId}`, blob);
        sessionStorage.removeItem('pendingMomoOrderId');
        hasCleanedUp.current = true;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

export default usePendingOrderCleanup;
