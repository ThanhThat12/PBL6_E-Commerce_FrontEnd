import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiEdit2, FiMapPin } from 'react-icons/fi';
import { getAddresses, updateAddress } from '../../services/userService';
import Button from '../common/Button';
import Loading from '../common/Loading';
import AddressFormModal from '../profile/AddressFormModal';

/**
 * SellerAddressTab
 * Tab quản lý địa chỉ STORE cho seller trong kênh người bán
 * - CHỈ cho phép CHỈNH SỬA (edit) địa chỉ STORE
 * - KHÔNG cho phép thêm mới hay xóa
 */
const SellerAddressTab = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Load STORE addresses
  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      console.log('Loading STORE addresses...');
      const response = await getAddresses();
      console.log('loadAddresses response:', response);
      
      if (response.status === 200 && Array.isArray(response.data)) {
        const allAddresses = response.data;
        
        // Only show STORE addresses
        const storeAddresses = allAddresses.filter(addr => addr.typeAddress === 'STORE');
        console.log(`Filtered ${storeAddresses.length} STORE addresses for Seller`);
        
        setAddresses(storeAddresses);
      } else {
        console.warn('Unexpected response structure:', response);
        setAddresses([]);
      }
    } catch (error) {
      console.error('Failed to load addresses:', error);
      toast.error('Không thể tải danh sách địa chỉ cửa hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address) => {
    console.log('Editing STORE address:', address);
    // Transform backend format to form format
    const formData = {
      id: address.id,
      recipientName: address.contactName || address.label,
      phoneNumber: address.contactPhone,
      provinceId: address.provinceId,
      districtId: address.districtId,
      wardId: address.wardCode,
      wardCode: address.wardCode,
      streetAddress: address.fullAddress,
      isPrimary: address.primaryAddress,
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
      // STORE addresses can only be updated, not created
      if (!editingAddress?.id) {
        toast.error('Không thể thêm địa chỉ mới. Vui lòng chỉnh sửa địa chỉ hiện có.');
        return;
      }

      const response = await updateAddress(editingAddress.id, addressData);
      console.log('Update STORE address response:', response);
      
      if (response.status === 200) {
        toast.success('Cập nhật địa chỉ cửa hàng thành công');
        setModalOpen(false);
        await loadAddresses();
      } else {
        toast.error(response.message || 'Cập nhật địa chỉ thất bại');
      }
    } catch (error) {
      console.error('Failed to update address:', error);
      toast.error(error.response?.data?.message || 'Cập nhật địa chỉ thất bại');
      throw error;
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Địa Chỉ Cửa Hàng</h2>
        <p className="text-sm text-gray-600 mt-1">
          Địa chỉ cửa hàng của bạn (chỉ có thể chỉnh sửa, không thể thêm mới hay xóa)
        </p>
      </div>

      {/* Address List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12">
          <FiMapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-2">
            Chưa có địa chỉ cửa hàng nào
          </p>
          <p className="text-sm text-gray-500">
            Địa chỉ cửa hàng được tạo tự động khi bạn đăng ký làm seller
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border-2 rounded-lg p-5 transition-all border-blue-200 bg-blue-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Label and Phone */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {address.contactName || address.label}
                    </h3>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-600">{address.contactPhone}</span>
                    <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded">
                      Cửa hàng
                    </span>
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

                  {/* Actions - Only Edit */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleEditAddress(address)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <FiEdit2 className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Information Box */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">Lưu ý:</h4>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• Địa chỉ cửa hàng chỉ có thể <strong>chỉnh sửa</strong>, không thể xóa hoặc thêm mới</li>
          <li>• Địa chỉ này được sử dụng cho việc giao hàng và tính phí ship từ GHN</li>
          <li>• Vui lòng đảm bảo thông tin địa chỉ chính xác để tránh sai sót khi giao hàng</li>
        </ul>
      </div>

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
        typeAddress="STORE"
      />
    </div>
  );
};

export default SellerAddressTab;
