import React, { useState, useEffect } from 'react';
import { FiPlus, FiPackage } from 'react-icons/fi';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AddressFormModal from './AddressFormModal';
import StoreAddressCard from './StoreAddressCard';
import useAddress from '../../hooks/useAddress';
import { useAuth } from '../../hooks/useAuth';

/**
 * StoreAddressManagement
 * Component quản lý địa chỉ cửa hàng (STORE) cho seller
 * 
 * Business Rules:
 * - Seller chỉ có 1 STORE address duy nhất
 * - STORE address không có primary flag
 * - Dùng làm from_address khi tạo GHN shipment
 */
const StoreAddressManagement = () => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Use custom hook with STORE filter
  const {
    addresses,
    loading,
    actionLoading,
    loadAddresses,
    handleCreate,
    handleUpdate,
    getStoreAddress,
    canCreateStore
  } = useAddress({ filterType: 'STORE', autoLoad: false });

  // Load addresses on mount
  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const storeAddress = getStoreAddress();

  const handleAddStore = () => {
    setEditingAddress(null);
    setModalOpen(true);
  };

  const handleEditStore = (address) => {
    const formData = {
      id: address.id,
      recipientName: address.contactName,
      phoneNumber: address.contactPhone,
      provinceId: address.provinceId,
      districtId: address.districtId,
      wardId: address.wardCode,
      wardCode: address.wardCode,
      streetAddress: address.fullAddress,
      typeAddress: 'STORE',
      isPrimary: false,
      provinceName: address.provinceName,
      districtName: address.districtName,
      wardName: address.wardName
    };
    setEditingAddress(formData);
    setModalOpen(true);
  };

  const handleSaveStore = async (addressData) => {
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
      console.error('Error saving store address:', error);
      // Error already handled in hook
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Đang tải địa chỉ cửa hàng..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Địa Chỉ Cửa Hàng</h3>
          <p className="text-sm text-gray-600 mt-1">
            Địa chỉ kho/cửa hàng để gửi hàng qua GHN
          </p>
        </div>
        
        {canCreateStore() && (
          <Button
            onClick={handleAddStore}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            Thêm Địa Chỉ Cửa Hàng
          </Button>
        )}
      </div>

      {/* Store Address Card or Empty State */}
      {storeAddress ? (
        <StoreAddressCard
          address={storeAddress}
          onEdit={handleEditStore}
          loading={actionLoading === storeAddress.id}
        />
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FiPackage className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Chưa có địa chỉ cửa hàng
          </h4>
          <p className="text-gray-600 mb-4">
            Thêm địa chỉ kho/cửa hàng để có thể tạo đơn giao hàng với GHN
          </p>
          <Button
            onClick={handleAddStore}
            variant="primary"
            className="flex items-center gap-2 mx-auto"
          >
            <FiPlus className="w-4 h-4" />
            Thêm Địa Chỉ Cửa Hàng
          </Button>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">📌 Lưu ý quan trọng</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Bạn chỉ có thể có <strong>một địa chỉ cửa hàng duy nhất</strong></li>
          <li>• Địa chỉ này sẽ được dùng làm <strong>điểm gửi hàng</strong> cho tất cả đơn GHN</li>
          <li>• Đảm bảo thông tin chính xác để GHN có thể đến lấy hàng</li>
          <li>• Bạn có thể cập nhật thông tin bất cứ lúc nào</li>
        </ul>
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveStore}
        initialData={editingAddress}
        typeAddress="STORE"
        userProfile={user}
      />
    </div>
  );
};

export default StoreAddressManagement;
