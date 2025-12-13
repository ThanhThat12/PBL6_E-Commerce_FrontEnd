import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { 
  getAddresses, 
  createAddress, 
  updateAddress, 
  deleteAddress, 
  setAsPrimary 
} from '../services/userService';

/**
 * Custom hook for address management
 * Handles CRUD operations and business logic for addresses
 * 
 * Features:
 * - Load addresses with type filtering (HOME/STORE)
 * - Create/Update/Delete addresses
 * - Set primary address (HOME only)
 * - Auto-refresh after operations
 * - Error handling with toasts
 * 
 * Business Rules:
 * - HOME: Multiple addresses, one primary
 * - STORE: Max 1 per seller, no primary
 */
const useAddress = (options = {}) => {
  const { 
    filterType = null, // 'HOME' or 'STORE' or null for all
    autoLoad = true 
  } = options;

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Load addresses from API
  const loadAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAddresses();
      
      if (response.status === 200 && Array.isArray(response.data)) {
        let filteredAddresses = response.data;
        
        // Filter by type if specified
        if (filterType) {
          filteredAddresses = filteredAddresses.filter(
            addr => addr.typeAddress === filterType
          );
        }
        
        // Sort: primary first for HOME addresses
        filteredAddresses.sort((a, b) => {
          if (a.typeAddress === 'HOME' && b.typeAddress === 'HOME') {
            return (b.primaryAddress ? 1 : 0) - (a.primaryAddress ? 1 : 0);
          }
          return 0;
        });
        
        setAddresses(filteredAddresses);
      } else {
        console.warn('Unexpected address response:', response);
        setAddresses([]);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error('Không thể tải danh sách địa chỉ');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  // Create new address
  const handleCreate = useCallback(async (addressData) => {
    try {
      const response = await createAddress(addressData);
      
      if (response.status === 201) {
        toast.success('Thêm địa chỉ thành công');
        await loadAddresses();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Thêm địa chỉ thất bại');
      }
    } catch (error) {
      console.error('Failed to create address:', error);
      const message = error.response?.data?.message || error.message || 'Thêm địa chỉ thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [loadAddresses]);

  // Update existing address
  const handleUpdate = useCallback(async (addressId, addressData) => {
    try {
      const response = await updateAddress(addressId, addressData);
      
      if (response.status === 200) {
        toast.success('Cập nhật địa chỉ thành công');
        await loadAddresses();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Cập nhật địa chỉ thất bại');
      }
    } catch (error) {
      console.error('Failed to update address:', error);
      const message = error.response?.data?.message || error.message || 'Cập nhật địa chỉ thất bại';
      toast.error(message);
      return { success: false, error: message };
    }
  }, [loadAddresses]);

  // Delete address
  const handleDelete = useCallback(async (addressId, skipConfirm = false) => {
    if (!skipConfirm && !window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return { success: false, cancelled: true };
    }

    setActionLoading(addressId);
    try {
      const response = await deleteAddress(addressId);
      
      await loadAddresses();
      
      if (response?.status === 200) {
        toast.success('Xóa địa chỉ thành công');
        return { success: true };
      } else {
        toast.error(response?.message || 'Xóa địa chỉ thất bại');
        return { success: false };
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
      await loadAddresses();
      
      const message = error.response?.data?.message || 'Xóa địa chỉ thất bại';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setActionLoading(null);
    }
  }, [loadAddresses]);

  // Set address as primary (HOME only)
  const handleSetPrimary = useCallback(async (addressId) => {
    setActionLoading(addressId);
    try {
      console.log('Setting primary address:', addressId);
      const response = await setAsPrimary(addressId);
      console.log('Set primary response:', response);
      
      // Handle both direct response and wrapped response
      const statusCode = response.status || response.statusCode;
      
      if (statusCode === 200 || statusCode === 201) {
        toast.success('Đặt làm địa chỉ mặc định thành công');
        await loadAddresses();
        return { success: true, data: response.data };
      } else {
        throw new Error(response.message || 'Đặt địa chỉ mặc định thất bại');
      }
    } catch (error) {
      console.error('Failed to set primary address:', error);
      const message = error.response?.data?.message || error.message || 'Đặt địa chỉ mặc định thất bại';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setActionLoading(null);
    }
  }, [loadAddresses]);

  // Get primary HOME address
  const getPrimaryAddress = useCallback(() => {
    return addresses.find(addr => addr.typeAddress === 'HOME' && addr.primaryAddress);
  }, [addresses]);

  // Get STORE address (for sellers)
  const getStoreAddress = useCallback(() => {
    return addresses.find(addr => addr.typeAddress === 'STORE');
  }, [addresses]);

  // Check if can create STORE (max 1)
  const canCreateStore = useCallback(() => {
    return !addresses.some(addr => addr.typeAddress === 'STORE');
  }, [addresses]);

  return {
    addresses,
    loading,
    actionLoading,
    loadAddresses,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSetPrimary,
    getPrimaryAddress,
    getStoreAddress,
    canCreateStore
  };
};

export default useAddress;
