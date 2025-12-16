import React from 'react';
import { FiMapPin, FiEdit2, FiPhone, FiUser } from 'react-icons/fi';
import Button from '../common/Button';

/**
 * StoreAddressCard
 * Component hiển thị địa chỉ cửa hàng (STORE) cho seller
 * 
 * Features:
 * - Display full store address details
 * - Edit button to update address
 * - Visual distinction from HOME addresses
 * - Used as from_address for GHN shipments
 */
const StoreAddressCard = ({ address, onEdit, loading }) => {
  if (!address) {
    return null;
  }

  const fullLocationName = [
    address.wardName,
    address.districtName,
    address.provinceName
  ].filter(Boolean).join(', ');

  return (
    <div className="border-2 border-orange-200 bg-orange-50 rounded-lg p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiMapPin className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-gray-900">Địa Chỉ Cửa Hàng</h3>
          <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded">
            Điểm gửi hàng
          </span>
        </div>
        
        <Button
          onClick={() => onEdit(address)}
          variant="outline"
          size="sm"
          disabled={loading}
          className="flex items-center gap-1"
        >
          <FiEdit2 className="w-4 h-4" />
          Chỉnh sửa
        </Button>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-gray-700">
          <FiUser className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{address.contactName}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-700">
          <FiPhone className="w-4 h-4 text-gray-400" />
          <span>{address.contactPhone}</span>
        </div>
      </div>

      {/* Address Details */}
      <div className="text-gray-700 space-y-1">
        <p className="font-medium">{address.fullAddress}</p>
        <p className="text-sm text-gray-600">{fullLocationName}</p>
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-xs text-blue-800">
          ℹ️ Địa chỉ này sẽ được sử dụng làm <strong>điểm gửi hàng</strong> khi tạo đơn giao hàng với GHN
        </p>
      </div>

      {/* Timestamps */}
      {address.updatedAt && (
        <div className="mt-3 pt-3 border-t border-orange-200">
          <p className="text-xs text-gray-500">
            Cập nhật lần cuối: {new Date(address.updatedAt).toLocaleString('vi-VN')}
          </p>
        </div>
      )}
    </div>
  );
};

export default StoreAddressCard;
