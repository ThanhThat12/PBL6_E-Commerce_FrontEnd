import React, { createContext, useState, useContext, useCallback } from 'react';
import orderService from '../services/orderService';
import { toast } from 'react-hot-toast';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all orders for current user
   */
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getMyOrders();
      console.log('📦 fetchOrders response:', response);
      // Backend returns ResponseDTO { status, error, message, data }
      if (response && !response.error && (response.status === 200 || response.status === 201)) {
        setOrders(response.data || []);
      } else {
        const errorMsg = response?.message || 'Không thể tải danh sách đơn hàng';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('❌ fetchOrders error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách đơn hàng';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch order detail
   */
  const fetchOrderDetail = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderDetail(orderId);
      console.log('📦 fetchOrderDetail response:', response);
      if (response && !response.error && (response.status === 200 || response.status === 201)) {
        setCurrentOrder(response.data);
        return response.data;
      } else {
        const errorMsg = response?.message || 'Không thể tải chi tiết đơn hàng';
        setError(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('❌ fetchOrderDetail error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải chi tiết đơn hàng';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new order
   */
  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.createOrder(orderData);
      console.log('📦 createOrder response:', response);
      if (response && !response.error && (response.status === 200 || response.status === 201)) {
        toast.success(response.message || 'Đặt hàng thành công!');
        return response.data;
      } else {
        const errorMsg = response?.message || 'Không thể tạo đơn hàng';
        setError(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('❌ createOrder error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tạo đơn hàng';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancel order
   */
  const cancelOrder = useCallback(async (orderId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.cancelOrder(orderId);
      console.log('📦 cancelOrder response:', response);
      if (response && !response.error && response.status === 200) {
        toast.success(response.message || 'Đã hủy đơn hàng');
        // Refresh orders list
        await fetchOrders();
        return response.data;
      } else {
        const errorMsg = response?.message || 'Không thể hủy đơn hàng';
        setError(errorMsg);
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('❌ cancelOrder error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể hủy đơn hàng';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrders]);

  /**
   * Filter orders by status
   */
  const filterOrdersByStatus = useCallback(async (status) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrdersByStatus(status);
      console.log('📦 filterOrdersByStatus response:', response);
      if (response && !response.error && response.status === 200) {
        setOrders(response.data || []);
      } else {
        const errorMsg = response?.message || 'Không thể lọc đơn hàng';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('❌ filterOrdersByStatus error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Không thể lọc đơn hàng';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    orders,
    currentOrder,
    loading,
    error,
    fetchOrders,
    fetchOrderDetail,
    createOrder,
    cancelOrder,
    filterOrdersByStatus,
    setCurrentOrder
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};

export default OrderContext;
