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
      if (response.status === 200) {
        setOrders(response.data || []);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải danh sách đơn hàng';
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
      if (response.status === 200) {
        setCurrentOrder(response.data);
        return response.data;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tải chi tiết đơn hàng';
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
      if (response.status === 201 || response.status === 200) {
        toast.success('Đặt hàng thành công!');
        return response.data;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể tạo đơn hàng';
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
      if (response.status === 200) {
        toast.success('Đã hủy đơn hàng');
        // Refresh orders list
        await fetchOrders();
        return response.data;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể hủy đơn hàng';
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
      if (response.status === 200) {
        setOrders(response.data || []);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể lọc đơn hàng';
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
