import { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { 
  getAddresses, 
  getAddress,
  createAddress, 
  updateAddress, 
  deleteAddress, 
  setAsPrimary,
  getAutoFillContactInfo 
} from '../services/userService';

/**
 * useAddresses Hook
 * T024 - Phase 4 (US2) - Address Management with GHN Cascade
 * 
 * Wraps userService address functions with state management,
 * loading states, error handling, and toast notifications
 * 
 * Reuses existing:
 * - getAddresses() from userService (updated paths)
 * - getAddress() from userService
 * - createAddress() from userService (updated paths)
 * - updateAddress() from userService (updated paths)
 * - deleteAddress() from userService (updated paths)
 * - setAsPrimary() from userService (updated paths)
 * - getAutoFillContactInfo() from userService
 */
export const useAddresses = (options = {}) => {
  // Stabilize excludeTypes to prevent infinite loops
  const excludeTypes = useMemo(
    () => options.excludeTypes || [],
    [JSON.stringify(options.excludeTypes || [])]
  );

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeAddresses = useCallback((list, primaryId) => {
    // Filter out excluded types (e.g., STORE for buyer UI)
    let filtered = Array.isArray(list)
      ? list.filter(addr => !excludeTypes.includes(addr.typeAddress))
      : [];

    // Ensure only one primary (prefer provided primaryId)
    const targetPrimaryId = primaryId || filtered.find(a => a.primaryAddress)?.id;
    if (targetPrimaryId) {
      filtered = filtered.map(addr => ({
        ...addr,
        primaryAddress: addr.id === targetPrimaryId
      }));
    }

    // Sort: primary first, then by createdAt desc
    filtered.sort((a, b) => {
      if (a.primaryAddress && !b.primaryAddress) return -1;
      if (!a.primaryAddress && b.primaryAddress) return 1;
      const aDate = a.createdAt ? new Date(a.createdAt) : 0;
      const bDate = b.createdAt ? new Date(b.createdAt) : 0;
      return bDate - aDate;
    });

    return filtered;
  }, [excludeTypes]);

  /**
   * Fetch all user addresses
   * Addresses are sorted: primary first, then by creation date descending
   * Server-side filtering by excludeTypes (e.g., exclude STORE for buyer view)
   */
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching addresses with excludeTypes:', excludeTypes);
      const response = await getAddresses({ excludeTypes });
      console.log('fetchAddresses response:', response);
      
      // Backend returns ResponseDTO { status, message, data }
      if (response.status === 200 && Array.isArray(response.data)) {
        const normalized = normalizeAddresses(response.data);
        setAddresses(normalized);
        return normalized;
      } else {
        console.warn('Unexpected response structure:', response);
        setAddresses([]);
        return [];
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải danh sách địa chỉ';
      setError(errorMsg);
      console.error('Failed to load addresses:', err);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [excludeTypes, normalizeAddresses]);

  /**
   * Fetch single address by ID
   * @param {number} addressId
   */
  const fetchAddress = useCallback(async (addressId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAddress(addressId);
      if (response.status === 200 && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch address');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Không thể tải thông tin địa chỉ';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new address
   * Transforms form data to backend format
   * Form: { recipientName, phoneNumber, streetAddress, wardId, isPrimary }
   * Backend: { contactName, contactPhone, fullAddress, wardCode, primaryAddress }
   */
  const createNewAddress = useCallback(async (addressData) => {
    setLoading(true);
    setError(null);
    try {
      // Transform form data to backend format
      const backendData = {
        contactName: addressData.recipientName || addressData.contactName,
        contactPhone: addressData.phoneNumber || addressData.contactPhone,
        fullAddress: addressData.streetAddress || addressData.fullAddress,
        provinceId: addressData.provinceId,
        districtId: addressData.districtId,
        wardCode: addressData.wardId || addressData.wardCode,
        typeAddress: addressData.typeAddress || 'HOME',
        primaryAddress: addressData.isPrimary !== undefined ? addressData.isPrimary : addressData.primaryAddress
      };
      
      console.log('Creating address (transformed):', backendData);
      const response = await createAddress(backendData);
      
      // Backend returns 201 for create
      if (response.status === 201 && response.data) {
        // Add new address to list and normalize (enforce single primary)
        setAddresses(prev => normalizeAddresses(
          [...prev, response.data],
          response.data.primaryAddress ? response.data.id : undefined
        ));
        toast.success('Thêm địa chỉ thành công');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create address');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Thêm địa chỉ thất bại';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [normalizeAddresses]);

  /**
   * Update existing address
   * Transforms form data to backend format
   * Form: { recipientName, phoneNumber, streetAddress, wardId, isPrimary }
   * Backend: { contactName, contactPhone, fullAddress, wardCode, primaryAddress }
   */
  const updateExistingAddress = useCallback(async (addressId, addressData) => {
    setLoading(true);
    setError(null);
    try {
      // Transform form data to backend format
      const backendData = {
        contactName: addressData.recipientName || addressData.contactName,
        contactPhone: addressData.phoneNumber || addressData.contactPhone,
        fullAddress: addressData.streetAddress || addressData.fullAddress,
        provinceId: addressData.provinceId,
        districtId: addressData.districtId,
        wardCode: addressData.wardId || addressData.wardCode,
        typeAddress: addressData.typeAddress || 'HOME',
        primaryAddress: addressData.isPrimary !== undefined ? addressData.isPrimary : addressData.primaryAddress
      };
      
      console.log('Updating address (transformed):', addressId, backendData);
      const response = await updateAddress(addressId, backendData);
      
      // Backend returns 200 for update
      if (response.status === 200 && response.data) {
        // Update address in list and normalize (enforce single primary)
        setAddresses(prev => normalizeAddresses(
          prev.map(addr => addr.id === addressId ? response.data : addr),
          response.data.primaryAddress ? response.data.id : undefined
        ));
        toast.success('Cập nhật địa chỉ thành công');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update address');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Cập nhật địa chỉ thất bại';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [normalizeAddresses]);

  /**
   * Delete address
   * @param {number} addressId
   */
  const deleteExistingAddress = useCallback(async (addressId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return false;
    }

    setLoading(true);
    setError(null);
    try {
      console.log('Deleting address:', addressId);
      const response = await deleteAddress(addressId);
      
      // Backend returns 200 or 204 for delete
      if (response.status === 200 || response.status === 204) {
        // Remove address from list and normalize
        setAddresses(prev => normalizeAddresses(prev.filter(addr => addr.id !== addressId)));
        toast.success('Xóa địa chỉ thành công');
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete address');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Xóa địa chỉ thất bại';
      setError(errorMsg);
      
      // If 404, refresh list (address already deleted)
      if (err.response?.status === 404) {
        toast.error('Địa chỉ không tồn tại hoặc đã bị xóa. Danh sách đã được cập nhật.');
        await fetchAddresses(); // Refresh
      } else {
        toast.error(errorMsg);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses, normalizeAddresses]);

  /**
   * Set address as primary (atomic toggle)
   * Backend handles unsetting other primary addresses
   * @param {number} addressId
   */
  const setPrimaryAddress = useCallback(async (addressId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Setting primary address:', addressId);
      const response = await setAsPrimary(addressId);
      
      // Backend returns 200 for success
      if (response.status === 200) {
        // Update all addresses: set this one as primary, others as non-primary
        setAddresses(prev => normalizeAddresses(prev, addressId));
        toast.success('Đặt làm địa chỉ mặc định thành công');
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to set primary address');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Đặt địa chỉ mặc định thất bại';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [normalizeAddresses]);

  /**
   * Get auto-fill contact info from user profile
   * Returns { contactName, contactPhone }
   */
  const fetchAutoFillInfo = useCallback(async () => {
    try {
      const response = await getAutoFillContactInfo();
      if (response.status === 200 && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Failed to fetch auto-fill info:', err);
      return null;
    }
  }, []);

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    fetchAddress,
    createAddress: createNewAddress,
    updateAddress: updateExistingAddress,
    deleteAddress: deleteExistingAddress,
    setPrimaryAddress,
    getAutoFillInfo: fetchAutoFillInfo
  };
};

export default useAddresses;
