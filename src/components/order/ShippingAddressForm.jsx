import React, { useState, useEffect, useCallback } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { toast } from 'react-hot-toast';

/**
 * ShippingAddressForm Component
 * Form to select or enter shipping address
 */
const ShippingAddressForm = ({ onAddressChange, initialAddress = null }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const [formData, setFormData] = useState({
    toName: initialAddress?.toName || '',
    toPhone: initialAddress?.toPhone || '',
    toAddress: initialAddress?.toAddress || '',
    toDistrictId: initialAddress?.toDistrictId || '',
    toWardCode: initialAddress?.toWardCode || ''
  });

  const [errors, setErrors] = useState({});

  // Handle address selection - use useCallback to fix dependency warning
  const handleSelectAddress = useCallback((address) => {
    setSelectedAddressId(address.id);
    setShowNewAddressForm(false);
    
    const addressData = {
      toName: user?.name || '',
      toPhone: address.contactPhone,
      toAddress: address.fullAddress,
      toDistrictId: address.districtId?.toString() || '',
      toWardCode: address.wardCode || ''
    };
    
    setFormData(addressData);
    onAddressChange(addressData);
  }, [user, onAddressChange]);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await userService.getAddresses();
        if (response.status === 200) {
          setAddresses(response.data || []);
          
          // Auto-select primary address
          const primaryAddress = response.data.find(addr => addr.primaryAddress);
          if (primaryAddress && !selectedAddressId) {
            handleSelectAddress(primaryAddress);
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      }
    };

    if (user) {
      fetchAddresses();
    }
  }, [user, selectedAddressId, handleSelectAddress]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.toName.trim()) {
      newErrors.toName = 'Vui lòng nhập tên người nhận';
    }
    
    if (!formData.toPhone.trim()) {
      newErrors.toPhone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.toPhone)) {
      newErrors.toPhone = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.toAddress.trim()) {
      newErrors.toAddress = 'Vui lòng nhập địa chỉ';
    }
    
    if (!formData.toDistrictId) {
      newErrors.toDistrictId = 'Vui lòng nhập mã quận/huyện';
    }
    
    if (!formData.toWardCode) {
      newErrors.toWardCode = 'Vui lòng nhập mã phường/xã';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onAddressChange(formData);
      toast.success('Đã cập nhật địa chỉ giao hàng');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Địa chỉ giao hàng
      </h2>

      {/* Saved Addresses */}
      {addresses.length > 0 && !showNewAddressForm && (
        <div className="space-y-3 mb-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              onClick={() => handleSelectAddress(address)}
              className={`
                p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedAddressId === address.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300'}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{address.label}</span>
                    {address.primaryAddress && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{address.fullAddress}</p>
                  <p className="text-sm text-gray-500 mt-1">{address.contactPhone}</p>
                </div>
                {selectedAddressId === address.id && (
                  <div className="flex-shrink-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toggle New Address Form */}
      {!showNewAddressForm && (
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowNewAddressForm(true)}
          className="w-full mb-4"
        >
          + Thêm địa chỉ mới
        </Button>
      )}

      {/* New Address Form */}
      {showNewAddressForm && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Tên người nhận *"
            name="toName"
            value={formData.toName}
            onChange={handleInputChange}
            error={errors.toName}
            placeholder="Nhập tên người nhận"
          />

          <Input
            label="Số điện thoại *"
            name="toPhone"
            value={formData.toPhone}
            onChange={handleInputChange}
            error={errors.toPhone}
            placeholder="0909123456"
          />

          <Input
            label="Địa chỉ *"
            name="toAddress"
            value={formData.toAddress}
            onChange={handleInputChange}
            error={errors.toAddress}
            placeholder="Số nhà, tên đường"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Mã quận/huyện *"
              name="toDistrictId"
              value={formData.toDistrictId}
              onChange={handleInputChange}
              error={errors.toDistrictId}
              placeholder="VD: 1442"
            />

            <Input
              label="Mã phường/xã *"
              name="toWardCode"
              value={formData.toWardCode}
              onChange={handleInputChange}
              error={errors.toWardCode}
              placeholder="VD: 21211"
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1">
              Xác nhận địa chỉ
            </Button>
            {addresses.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewAddressForm(false)}
                className="flex-1"
              >
                Hủy
              </Button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};

export default ShippingAddressForm;
