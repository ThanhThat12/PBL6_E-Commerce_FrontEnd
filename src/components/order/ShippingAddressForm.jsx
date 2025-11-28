import React, { useState, useEffect, useCallback } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../context/AuthContext';
import addressService from '../../services/addressService';
// Use GHN master data for province/district/ward to avoid CORS and to match GHN shipping IDs
import userService from '../../services/userService';
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
  const [errors, setErrors] = useState({});

  // Initialize from storage if available (keeps data across refresh)
  useEffect(() => {
    const saved = getItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS);
    if (saved) {
      if (saved.addressId) {
        setSelectedAddressId(saved.addressId);
        const { toName, ...restData } = saved;
        setFormData(prev => ({ ...prev, ...restData }));
        onAddressChange(saved);
      } else {
        setFormData(saved);
        onAddressChange(saved);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load provinces on mount — prefer GHN master data to avoid open-api CORS
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        // Use GHN master list from backend proxy (safer with CORS and matches GHN IDs)
        // Transform GHN response { ProvinceID, ProvinceName } -> { code, name }
        const ghnProvinces = await userService.getProvinces();
        const transformed = Array.isArray(ghnProvinces)
          ? ghnProvinces.map(p => ({ code: p.ProvinceID, name: p.ProvinceName }))
          : [];
        setProvinces(transformed);
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
            // GHN expects province_id
            const districts = await userService.getDistricts(formData.provinceCode);
            const transformed = Array.isArray(districts)
              ? districts.map(d => ({ code: d.DistrictID, name: d.DistrictName }))
              : [];
            const data = transformed;
          setDistricts(data);
        } catch (error) {
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
            // GHN expects district_id
            const wardsData = await userService.getWards(formData.districtCode);
            const transformedWards = Array.isArray(wardsData)
              ? wardsData.map(w => ({ code: w.WardCode, name: w.WardName }))
              : [];
            const data = transformedWards;
          setWards(data);
        } catch (error) {
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

  // Handle address selection
  const handleSelectAddress = useCallback(async (address) => {
    setSelectedAddressId(address.id);
    setShowNewAddressForm(false);

    let recipientName = address.contactName || address.receiverName || user?.name || user?.fullName || '';
    if (!recipientName || recipientName.trim() === '') {
      try {
        const profile = await userService.getProfile();
        recipientName = profile.data?.name || profile.data?.fullName || '';
      } catch (error) {
        recipientName = '';
      }
    }
    if (!recipientName || recipientName.trim() === '') {
      toast.error('Vui lòng cập nhật tên trong hồ sơ cá nhân hoặc thêm địa chỉ mới với tên người nhận!');
      recipientName = '';
    }

    let streetAddress = address.fullAddress || '';
    let wardName = '';
    let districtName = '';
    let provinceName = '';

    const addressParts = address.fullAddress.split(',').map(part => part.trim());
    if (addressParts.length >= 4) {
      streetAddress = addressParts[0];
      wardName = addressParts[addressParts.length - 3] || '';
      districtName = addressParts[addressParts.length - 2] || '';
      provinceName = addressParts[addressParts.length - 1] || '';
    } else {
      streetAddress = address.fullAddress;
      wardName = address.wardName || address.ward || '';
      districtName = address.districtName || address.district || '';
      provinceName = address.provinceName || address.province || '';
    }

    const fullAddressDisplay = [streetAddress, wardName, districtName, provinceName]
      .filter(part => part && part.trim())
      .join(', ');

    const addressData = {
      addressId: address.id,
      label: address.label || '',
      toName: recipientName,
      toPhone: address.contactPhone,
      toAddress: fullAddressDisplay,
      toDistrictId: address.districtId?.toString() || '',
      toWardCode: address.wardCode || '',
      province: provinceName,
      district: districtName,
      ward: wardName,
      provinceCode: address.provinceId || address.provinceCode || '',
      districtCode: address.districtId || address.districtCode || '',
      wardCode: address.wardCode || ''
    };

    setFormData(addressData);
    onAddressChange(addressData);
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
      // Ghép full address đúng chuẩn
      const fullAddress = [formData.toAddress, formData.ward, formData.district, formData.province].filter(Boolean).join(', ');

      // Lưu địa chỉ vào database
      try {
        const addressToSave = {
          label: 'Buyer',
          fullAddress,
          contactName: formData.toName,
          contactPhone: formData.toPhone,
          provinceId: parseInt(formData.provinceCode) || undefined,
          districtId: parseInt(formData.districtCode) || undefined,
          wardCode: formData.wardCode,
          provinceName: formData.province,
          districtName: formData.district,
          wardName: formData.ward,
          primaryAddress: addresses.length === 0
        };
        const response = await userService.createAddress(addressToSave);
        if (response.status === 200) {
          // Reload addresses list and select the new address
          const addressesResponse = await userService.getAddresses();
          if (addressesResponse.status === 200) {
            setAddresses(addressesResponse.data || []);
            const newAddress = addressesResponse.data[addressesResponse.data.length - 1];
            if (newAddress) {
              setSelectedAddressId(newAddress.id);
              const persisted = { ...formData, addressId: newAddress.id, fullAddress };
              setItem(STORAGE_KEYS.CHECKOUT_SHIPPING_ADDRESS, persisted, true);
              onAddressChange({ ...formData, addressId: newAddress.id, fullAddress });
            }
          }
        }
        setShowNewAddressForm(false);
        toast.success('Đã cập nhật địa chỉ giao hàng');
      } catch (error) {
        console.error('Failed to save address:', error);
      }
    }
  };

  return (
    <div>
      {/* List addresses */}
      {addresses.length > 0 && !showNewAddressForm && (
        <div className="space-y-4 mb-4">
          {addresses.map((address) => {
            const fullAddress = address.fullAddress ||
              [address.toAddress, address.wardName || address.ward, address.districtName || address.district, address.provinceName || address.province]
                .filter(Boolean).join(', ');
            return (
              <label
                key={address.id}
                className={`block border rounded-lg p-4 cursor-pointer ${selectedAddressId === address.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
              >
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === address.id}
                  onChange={() => handleSelectAddress(address)}
                  className="mr-2"
                />
                {/* Đổi Địa chỉ thành tên người nhận */}
                <span className="font-semibold">{address.contactName || address.receiverName || 'Người nhận'}</span>
                {address.primaryAddress && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Mặc định</span>
                )}
                <div className="mt-1 text-gray-700">{fullAddress}</div>
                <div className="mt-1 text-pink-600 flex items-center">
                  <span className="material-icons text-base mr-1">phone</span>
                  {address.contactPhone}
                </div>
              </label>
            );
          })}
        </div>
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
            {/* BỎ input label */}
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

            <div className="flex gap-2">
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

      {/* Nếu chưa có địa chỉ nào */}
      {addresses.length === 0 && !showNewAddressForm && (
        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-600 mb-2">📍 Chưa có địa chỉ giao hàng</p>
          <p className="text-sm text-gray-500">Vui lòng thêm địa chỉ giao hàng để tiếp tục</p>
        </div>
      )}
    </div>
  );
};

export default ShippingAddressForm;
