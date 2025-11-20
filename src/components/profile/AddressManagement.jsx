import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCheck } from 'react-icons/fi';
import { getAddresses, createAddress, updateAddress, deleteAddress, setAsPrimary } from '../../services/userService';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AddressFormModal from './AddressFormModal';

/**
 * AddressManagement
 * Component quản lý địa chỉ người dùng
 */
const AddressManagement = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  // Load addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      console.log('Loading addresses...');
      const response = await getAddresses();
      console.log('loadAddresses response:', response);
      // Backend returns ResponseDTO { status, message, data }
      if (response.status === 200 && Array.isArray(response.data)) {
        setAddresses(response.data);
      } else {
        console.warn('Unexpected response structure:', response);
        setAddresses([]);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEditAddress = (address) => {
    console.log('Editing address:', address);
    // Transform backend format to form format
    const formData = {
      id: address.id,
      recipientName: address.contactName || address.label, // contactName ưu tiên, fallback label
      phoneNumber: address.contactPhone, // contactPhone -> phoneNumber
      provinceId: address.provinceId,
      districtId: address.districtId,
      wardId: address.wardCode, // wardCode -> wardId
      wardCode: address.wardCode, // Keep wardCode for reference
      streetAddress: address.fullAddress, // fullAddress -> streetAddress
      isPrimary: address.primaryAddress, // primaryAddress -> isPrimary
      // Keep original names for display
      provinceName: address.provinceName,
      districtName: address.districtName,
      wardName: address.wardName
    };
    console.log('Form data for edit:', formData);
    setEditingAddress(formData);
    setModalOpen(true);
  };

  const handleSaveAddress = async (addressData) => {
    try {
      let response;
      if (editingAddress) {
        // Update existing address
        response = await updateAddress(editingAddress.id, addressData);
      } else {
        // Create new address
        response = await createAddress(addressData);
      }

      // Backend returns status 200 for update, 201 for create
      if (response.status === 200 || response.status === 201) {
        toast.success(editingAddress ? 'Cập nhật địa chỉ thành công' : 'Thêm địa chỉ thành công');
        setModalOpen(false);
        loadAddresses();
      }
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error(error.response?.data?.message || 'Lưu địa chỉ thất bại');
      throw error;
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    setActionLoading(addressId);
    try {
      const response = await deleteAddress(addressId);
      // Luôn reload danh sách sau khi xóa
      await loadAddresses();
      if (response && response.status === 200) {
        toast.success('Xóa địa chỉ thành công');
      } else {
        toast.error((response && response.message) || 'Xóa địa chỉ thất bại');
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
      await loadAddresses();
      if (error && error.response && error.response.status === 404) {
        toast.error('Địa chỉ không tồn tại hoặc đã bị xóa. Danh sách đã được cập nhật.');
      } else {
        toast.error('Xóa địa chỉ thất bại');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleSetPrimary = async (addressId) => {
    setActionLoading(addressId);
    try {
      const response = await setAsPrimary(addressId);
      // Fix: check response.status (API returns status 200)
      if (response.status === 200) {
        toast.success('Đặt làm địa chỉ mặc định thành công');
        // Reload addresses, then move primary to top and auto-select
        await loadAddresses();
        // Find new primary address
        const updated = await getAddresses();
        if (updated.status === 200 && Array.isArray(updated.data)) {
          const primary = updated.data.find(a => a.primaryAddress);
          if (primary) {
            // Move primary to top
            setAddresses(prev => {
              const others = updated.data.filter(a => a.id !== primary.id);
              return [primary, ...others];
            });
            // Auto-select (open modal for edit)
            handleEditAddress(primary);
          }
        }
      } else {
        toast.error('Đặt địa chỉ mặc định thất bại');
      }
    } catch (error) {
      console.error('Failed to set primary address:', error);
      toast.error('Đặt địa chỉ mặc định thất bại');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Đang tải địa chỉ..." />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Địa Chỉ Của Tôi</h2>
          <p className="text-sm text-gray-600 mt-1">Quản lý địa chỉ giao hàng của bạn</p>
        </div>
        <Button
          onClick={handleAddAddress}
          variant="primary"
          className="flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Thêm Địa Chỉ Mới
        </Button>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <FiMapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-4">Bạn chưa có địa chỉ nào</p>
          <Button onClick={handleAddAddress} variant="primary">
            Thêm Địa Chỉ Đầu Tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`border-2 rounded-lg p-5 transition-all ${
                address.isPrimary
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Label and Phone */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{address.contactName || address.label}</h3>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-600">{address.contactPhone}</span>
                    {address.primaryAddress && (
                      <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded">
                        Mặc định
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="text-gray-700 mb-3">
                    <p>{address.fullAddress}</p>
                    <p className="text-sm text-gray-600">
                      {[address.wardName, address.districtName, address.provinceName]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                      disabled={actionLoading === address.id}
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Chỉnh sửa
                    </button>

                    {!address.primaryAddress && (
                      <>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                          disabled={actionLoading === address.id}
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Xóa
                        </button>

                        <button
                          onClick={() => handleSetPrimary(address.id)}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-1"
                          disabled={actionLoading === address.id}
                        >
                          <FiCheck className="w-4 h-4" />
                          Đặt làm mặc định
                        </button>
                      </>
                    )}

                    {actionLoading === address.id && (
                      <Loading size="sm" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
      />
    </div>
  );
};

export default AddressManagement;
