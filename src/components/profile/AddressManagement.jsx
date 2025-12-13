import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCheck } from 'react-icons/fi';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AddressFormModal from './AddressFormModal';
import useAddress from '../../hooks/useAddress';
import { useAuth } from '../../hooks/useAuth';

/**
 * AddressManagement
 * Component quản lý địa chỉ HOME của buyer
 * Chỉ hiển thị và quản lý địa chỉ nhận hàng (HOME)
 * Địa chỉ cửa hàng (STORE) được quản lý riêng ở MyShop
 */
const AddressManagement = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Use custom hook with HOME filter
  const {
    addresses,
    loading,
    actionLoading,
    loadAddresses,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSetPrimary
  } = useAddress({ filterType: 'HOME', autoLoad: false });

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEditAddress = (address) => {
    console.log('Editing address:', address);
    const formData = {
      id: address.id,
      recipientName: address.contactName,
      phoneNumber: address.contactPhone,
      provinceId: address.provinceId,
      districtId: address.districtId,
      wardId: address.wardCode,
      wardCode: address.wardCode,
      streetAddress: address.fullAddress,
      typeAddress: address.typeAddress || 'HOME',
      isPrimary: address.primaryAddress,
      primaryAddress: address.primaryAddress,
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
      let result;
      if (editingAddress) {
        result = await handleUpdate(editingAddress.id, addressData);
      } else {
        result = await handleCreate(addressData);
      }

      if (result.success) {
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      // Error already handled in hook with toast
    }
  };

  const handleDeleteAddress = async (addressId) => {
    await handleDelete(addressId);
  };

  const handleSetPrimaryAddress = async (addressId) => {
    await handleSetPrimary(addressId);
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
                          onClick={() => handleSetPrimaryAddress(address.id)}
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
        typeAddress="HOME"
        userProfile={user}
      />
    </div>
  );
};

export default AddressManagement;
