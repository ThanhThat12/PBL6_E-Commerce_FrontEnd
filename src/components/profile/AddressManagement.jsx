import React, { useState, useEffect, useMemo } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCheck } from 'react-icons/fi';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AddressFormModal from './AddressFormModal';
import { useAddresses } from '../../hooks/useAddresses';

// Constant to prevent recreation on every render
const BUYER_EXCLUDE_TYPES = ['STORE'];

/**
 * AddressManagement
 * Component quản lý địa chỉ người dùng
 * Now using useAddresses hook for better state management
 */
const AddressManagement = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Use the useAddresses hook for state management
  // excludeTypes is a stable reference now (constant)
  const {
    addresses,
    loading,
    fetchAddresses,
    createAddress: createNewAddress,
    updateAddress: updateExistingAddress,
    deleteAddress: deleteExistingAddress,
    setPrimaryAddress: setAsPrimary
  } = useAddresses({ excludeTypes: BUYER_EXCLUDE_TYPES });

  // Load addresses on mount
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

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
      typeAddress: address.typeAddress || 'HOME',
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
      if (editingAddress) {
        // Update existing address
        await updateExistingAddress(editingAddress.id, addressData);
      } else {
        // Create new address
        await createNewAddress(addressData);
      }
      // Success toast is handled by the hook
      setModalOpen(false);
    } catch (error) {
      // Error toast is handled by the hook
      throw error;
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      // Confirmation and error handling are done in the hook
      await deleteExistingAddress(addressId);
    } catch (error) {
      // Error already handled by hook
    }
  };

  const handleSetPrimary = async (addressId) => {
    try {
      await setAsPrimary(addressId);
      // Success toast and state update handled by the hook
      // Addresses are automatically sorted (primary first) by the hook
    } catch (error) {
      // Error already handled by hook
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
                address.primaryAddress
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Label and Phone */}
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{address.contactName || address.label}</h3>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-600">{address.contactPhone}</span>
                    {address.typeAddress && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded uppercase tracking-wide">
                        {address.typeAddress}
                      </span>
                    )}
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
                      disabled={loading}
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Chỉnh sửa
                    </button>

                    {!address.primaryAddress && (
                      <>
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                          disabled={loading}
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Xóa
                        </button>

                        <button
                          onClick={() => handleSetPrimary(address.id)}
                          className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center gap-1"
                          disabled={loading}
                        >
                          <FiCheck className="w-4 h-4" />
                          Đặt làm mặc định
                        </button>
                      </>
                    )}

                    {loading && (
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
