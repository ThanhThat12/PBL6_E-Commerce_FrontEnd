import React, { useState, useEffect, useCallback } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import addressService from '../../services/addressService';
import { toast } from 'react-hot-toast';
import { getItem, setItem } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';

/**
 * ShippingAddressForm Component
 * Form to select or enter shipping address
 */
const ShippingAddressForm = ({ onAddressChange, initialAddress = null }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  // Address data states
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  const [formData, setFormData] = useState({
    toName: '',
    toPhone: '',
    toAddress: '',
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    province: '',
    district: '',
    ward: '',
    toDistrictId: '',
    toWardCode: ''
  });
  
  // Initialize from storage if available (keeps data across refresh)
  useEffect(() => {
    const saved = getItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS);
    if (saved) {
      // Only restore if we're still on the same address
      if (saved.addressId) {
        setSelectedAddressId(saved.addressId);
        // Don't restore toName from storage, let it load from the actual address
        const { toName, ...restData } = saved;
        setFormData(prev => ({ ...prev, ...restData }));
        onAddressChange(saved);
      } else {
        // It's a new address form data, restore everything including toName
        setFormData(saved);
        onAddressChange(saved);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const [errors, setErrors] = useState({});

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const data = await addressService.getProvinces();
        setProvinces(data);
      } catch (error) {
        console.error('Failed to load provinces:', error);
        toast.error('Không thể tải danh sách tỉnh/thành phố');
      }
    };
    loadProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (formData.provinceCode) {
        setLoadingDistricts(true);
        try {
          const data = await addressService.getDistricts(formData.provinceCode);
          setDistricts(data);
        } catch (error) {
          console.error('Failed to load districts:', error);
          toast.error('Không thể tải danh sách quận/huyện');
        } finally {
          setLoadingDistricts(false);
        }
      } else {
        setDistricts([]);
      }
    };
    loadDistricts();
  }, [formData.provinceCode]);

  // Load wards when district changes
  useEffect(() => {
    const loadWards = async () => {
      if (formData.districtCode) {
        setLoadingWards(true);
        try {
          const data = await addressService.getWards(formData.districtCode);
          setWards(data);
        } catch (error) {
          console.error('Failed to load wards:', error);
          toast.error('Không thể tải danh sách phường/xã');
        } finally {
          setLoadingWards(false);
        }
      } else {
        setWards([]);
      }
    };
    loadWards();
  }, [formData.districtCode]);

  // Handle province selection
  const handleProvinceChange = (e) => {
    const provinceCode = e.target.value;
    const provinceName = provinces.find(p => p.code === parseInt(provinceCode))?.name || '';
    
    setFormData(prev => ({
      ...prev,
      provinceCode,
      province: provinceName,
      districtCode: '',
      district: '',
      wardCode: '',
      ward: '',
      toDistrictId: '',
      toWardCode: ''
    }));
    setDistricts([]);
    setWards([]);
    
    if (errors.provinceCode) {
      setErrors(prev => ({ ...prev, provinceCode: '' }));
    }
  };

  // Handle district selection
  const handleDistrictChange = (e) => {
    const districtCode = e.target.value;
    const districtName = districts.find(d => d.code === parseInt(districtCode))?.name || '';
    
    setFormData(prev => ({
      ...prev,
      districtCode,
      district: districtName,
      toDistrictId: districtCode,
      wardCode: '',
      ward: '',
      toWardCode: ''
    }));
    setWards([]);
    
    if (errors.districtCode) {
      setErrors(prev => ({ ...prev, districtCode: '' }));
    }
  };

  // Handle ward selection
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const wardName = wards.find(w => w.code === parseInt(wardCode))?.name || '';
    
    setFormData(prev => ({
      ...prev,
      wardCode,
      ward: wardName,
      toWardCode: wardCode
    }));
    
    if (errors.wardCode) {
      setErrors(prev => ({ ...prev, wardCode: '' }));
    }
  };

  // Handle address selection - use useCallback to fix dependency warning
  const handleSelectAddress = useCallback(async (address) => {
    console.log('🏠 Selected address from API:', address);
    
    setSelectedAddressId(address.id);
    setShowNewAddressForm(false);
    
    // Ưu tiên lấy tên từ địa chỉ đã lưu, không lấy từ storage để tránh ghi đè
    // Priority: address.contactName > address.receiverName > user profile
    let recipientName = address.contactName || address.receiverName || user?.name || user?.fullName || '';
    
    console.log('👤 Initial recipient name:', recipientName);
    console.log('👤 User data:', { name: user?.name, fullName: user?.fullName });
    console.log('👤 Address data:', { contactName: address.contactName, receiverName: address.receiverName });
    
    if (!recipientName || recipientName.trim() === '') {
      console.log('⚠️ No name found, trying to fetch from profile...');
      try {
        const profile = await userService.getProfile();
        console.log('📋 Profile data:', profile.data);
        recipientName = profile.data?.name || profile.data?.fullName || '';
        console.log('👤 Name from profile:', recipientName);
      } catch (error) {
        console.error('❌ Failed to fetch profile:', error);
        recipientName = '';
      }
    }
    
    // Nếu vẫn không có tên, hiển thị thông báo
    if (!recipientName || recipientName.trim() === '') {
      console.error('❌ No recipient name available!');
      toast.error('Vui lòng cập nhật tên trong hồ sơ cá nhân hoặc thêm địa chỉ mới với tên người nhận!');
      // Vẫn tiếp tục nhưng để rỗng để user có thể nhập thủ công
      recipientName = '';
    }
    
    console.log('✅ Final recipient name:', recipientName);
    
    // Parse fullAddress to get detailed parts
    // If fullAddress already contains full info (street, ward, district, province), parse it
    // Otherwise, construct from individual fields
    let streetAddress = address.fullAddress || '';
    let wardName = '';
    let districtName = '';
    let provinceName = '';
    
    // Try to parse if fullAddress contains commas (full format)
    const addressParts = address.fullAddress.split(',').map(part => part.trim());
    if (addressParts.length >= 4) {
      // Full format: "street, ward, district, province"
      streetAddress = addressParts[0];
      wardName = addressParts[addressParts.length - 3] || '';
      districtName = addressParts[addressParts.length - 2] || '';
      provinceName = addressParts[addressParts.length - 1] || '';
    } else {
      // fullAddress only has street address, need to construct full address from other fields
      streetAddress = address.fullAddress;
      // Backend returns wardName, districtName, provinceName (not ward, district, province)
      wardName = address.wardName || address.ward || '';
      districtName = address.districtName || address.district || '';
      provinceName = address.provinceName || address.province || '';
    }
    
    console.log('🏠 Address parts:', { streetAddress, wardName, districtName, provinceName });
    
    // Construct full address for display: "street, ward, district, province"
    const fullAddressDisplay = [streetAddress, wardName, districtName, provinceName]
      .filter(part => part && part.trim())
      .join(', ');
    
    console.log('📍 Full address display:', fullAddressDisplay);
    
    const addressData = {
      addressId: address.id,
      toName: recipientName,
      toPhone: address.contactPhone,
      toAddress: fullAddressDisplay, // Full address with province/district/ward
      toDistrictId: address.districtId?.toString() || '',
      toWardCode: address.wardCode || '',
      province: provinceName,
      district: districtName,
      ward: wardName,
      provinceCode: address.provinceId || address.provinceCode || '',
      districtCode: address.districtId || address.districtCode || '',
      wardCode: address.wardCode || ''
    };
    
    console.log('📍 Final address data:', addressData);
    
    setFormData(addressData);
    onAddressChange(addressData);
    // persist for refreshes in current checkout
    setItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS, addressData, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onAddressChange]);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await userService.getAddresses();
        if (response.status === 200) {
          setAddresses(response.data || []);
          
          // Auto-select primary address
          const primaryAddress = response.data.find(addr => addr.primaryAddress);
          const saved = getItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS);
          if (!saved && primaryAddress && !selectedAddressId) {
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

  // Reset form to empty state
  const resetForm = () => {
    setFormData({
      toName: '',
      toPhone: '',
      toAddress: '',
      provinceCode: '',
      districtCode: '',
      wardCode: '',
      province: '',
      district: '',
      ward: '',
      toDistrictId: '',
      toWardCode: ''
    });
    setErrors({});
    setDistricts([]);
    setWards([]);
  };

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
    
    if (!formData.provinceCode) {
      newErrors.provinceCode = 'Vui lòng chọn Tỉnh/Thành phố';
    }
    
    if (!formData.districtCode) {
      newErrors.districtCode = 'Vui lòng chọn Quận/Huyện';
    }
    
    if (!formData.wardCode) {
      newErrors.wardCode = 'Vui lòng chọn Phường/Xã';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Gửi data lên parent component ngay lập tức
      onAddressChange(formData);
      // Persist current input as chosen shipping address for this checkout
      setItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS, formData, true);
      
      // Đóng form thêm địa chỉ mới
      setShowNewAddressForm(false);
      
      toast.success('Đã cập nhật địa chỉ giao hàng');
      
      // Optional: Lưu địa chỉ vào database nếu muốn
      try {
        const addressToSave = {
          label: 'Địa chỉ mới',
          fullAddress: `${formData.toAddress}, ${formData.ward}, ${formData.district}, ${formData.province}`,
          contactName: formData.toName,
          contactPhone: formData.toPhone,
          provinceId: parseInt(formData.provinceCode) || undefined,
          districtId: parseInt(formData.districtCode) || undefined,
          wardCode: formData.wardCode,
          // Thêm các tên để backend có thể lưu vào DB
          provinceName: formData.province,
          districtName: formData.district,
          wardName: formData.ward,
          primaryAddress: addresses.length === 0 // Set làm mặc định nếu chưa có địa chỉ nào
        };
        
        console.log('💾 Saving address to database:', addressToSave);
        
        const response = await userService.createAddress(addressToSave);
        if (response.status === 200) {
          // Reload addresses list
          const addressesResponse = await userService.getAddresses();
          if (addressesResponse.status === 200) {
            setAddresses(addressesResponse.data || []);
            
            // Select the newly created address
            const newAddress = addressesResponse.data[addressesResponse.data.length - 1];
            if (newAddress) {
              setSelectedAddressId(newAddress.id);
              // Update persisted object with the new address id
              const persisted = { ...formData, addressId: newAddress.id };
              setItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS, persisted, true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to save address:', error);
        // Không hiển thị lỗi vì địa chỉ đã được set cho đơn hàng rồi
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Saved Addresses List */}
      {addresses.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">
            Chọn địa chỉ giao hàng
          </h3>
          {addresses.map((address) => (
            <label
              key={address.id}
              htmlFor={`address-${address.id}`}
              className={`
                block p-4 border-2 rounded-lg cursor-pointer transition-all
                ${selectedAddressId === address.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-blue-300 bg-white'}
              `}
            >
              <div className="flex items-start gap-3">
                {/* Radio Button */}
                <input
                  type="radio"
                  id={`address-${address.id}`}
                  name="shipping-address"
                  checked={selectedAddressId === address.id}
                  onChange={() => handleSelectAddress(address)}
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                
                {/* Address Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{address.label}</span>
                    {address.primaryAddress && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{address.fullAddress}</p>
                  <p className="text-sm text-gray-500">📞 {address.contactPhone}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      ) : (
        !showNewAddressForm && (
          <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600 mb-2">📍 Chưa có địa chỉ giao hàng</p>
            <p className="text-sm text-gray-500">Vui lòng thêm địa chỉ giao hàng để tiếp tục</p>
          </div>
        )
      )}

      {/* Add New Address Button */}
      {!showNewAddressForm && (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            setShowNewAddressForm(true);
          }}
          className="w-full"
        >
          + Thêm địa chỉ mới
        </Button>
      )}

      {/* New Address Form */}
      {showNewAddressForm && (
        <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            Thêm địa chỉ mới
          </h3>
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
            label="Địa chỉ cụ thể *"
            name="toAddress"
            value={formData.toAddress}
            onChange={handleInputChange}
            error={errors.toAddress}
            placeholder="Số nhà, tên đường"
          />

          {/* Province Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Tỉnh/Thành phố *
            </label>
            <select
              value={formData.provinceCode}
              onChange={handleProvinceChange}
              className={`
                w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.provinceCode ? 'border-red-500' : 'border-gray-300'}
              `}
            >
              <option value="">-- Chọn Tỉnh/Thành phố --</option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            {errors.provinceCode && (
              <p className="text-red-500 text-xs mt-1">{errors.provinceCode}</p>
            )}
          </div>

          {/* District Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Quận/Huyện *
            </label>
            <select
              value={formData.districtCode}
              onChange={handleDistrictChange}
              disabled={!formData.provinceCode || loadingDistricts}
              className={`
                w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.districtCode ? 'border-red-500' : 'border-gray-300'}
                ${(!formData.provinceCode || loadingDistricts) ? 'bg-gray-100 cursor-not-allowed' : ''}
              `}
            >
              <option value="">
                {loadingDistricts ? 'Đang tải...' : '-- Chọn Quận/Huyện --'}
              </option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.name}
                </option>
              ))}
            </select>
            {errors.districtCode && (
              <p className="text-red-500 text-xs mt-1">{errors.districtCode}</p>
            )}
          </div>

          {/* Ward Dropdown */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Phường/Xã *
            </label>
            <select
              value={formData.wardCode}
              onChange={handleWardChange}
              disabled={!formData.districtCode || loadingWards}
              className={`
                w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${errors.wardCode ? 'border-red-500' : 'border-gray-300'}
                ${(!formData.districtCode || loadingWards) ? 'bg-gray-100 cursor-not-allowed' : ''}
              `}
            >
              <option value="">
                {loadingWards ? 'Đang tải...' : '-- Chọn Phường/Xã --'}
              </option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.name}
                </option>
              ))}
            </select>
            {errors.wardCode && (
              <p className="text-red-500 text-xs mt-1">{errors.wardCode}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button type="submit" variant="primary" className="flex-1">
              Xác nhận địa chỉ
            </Button>
            {addresses.length > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setShowNewAddressForm(false);
                }}
                className="flex-1"
              >
                Hủy
              </Button>
            )}
          </div>
        </form>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressForm;
