import React, { useState, useEffect } from 'react';
import { FiX, FiUser, FiPhone } from 'react-icons/fi';
import Button from '../common/Button';
import Loading from '../common/Loading';
import LocationDropdown from '../common/LocationDropdown';
import { useAddressMaster } from '../../hooks/useAddressMaster';

/**
 * AddressFormModal
 * Modal form để thêm/sửa địa chỉ
 * Sử dụng LocationDropdown với GHN Master Data API
 */
const AddressFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    recipientName: '',
    phoneNumber: '',
    provinceId: null,
    districtId: null,
    wardId: null,
    streetAddress: '',
    isPrimary: false
  });

  // Location state for dropdown display
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Use the custom hook to fetch location data
  const {
    provinces,
    districts,
    wards,
    loadingDistricts,
    loadingWards,
    selectProvince,
    selectDistrict,
    error: locationError
  } = useAddressMaster();

  // Khởi tạo dropdown khi mở modal hoặc khi initialData thay đổi
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      // Parse IDs to ensure they are numbers
      const provinceId = initialData.provinceId ? Number(initialData.provinceId) : null;
      const districtId = initialData.districtId ? Number(initialData.districtId) : null;
      const wardId = initialData.wardId || initialData.wardCode || null;

      // Tách phần đầu trước dấu phẩy làm streetAddress
      let streetAddress = initialData.streetAddress || initialData.fullAddress || '';
      if (streetAddress.includes(',')) {
        streetAddress = streetAddress.split(',')[0].trim();
      }

      console.log('Loading address data:', { provinceId, districtId, wardId });

      setFormData({
        recipientName: initialData.recipientName || initialData.contactName || '',
        phoneNumber: initialData.phoneNumber || initialData.contactPhone || '',
        provinceId: provinceId,
        districtId: districtId,
        wardId: wardId,
        streetAddress: streetAddress,
        isPrimary: initialData.isPrimary || false
      });

      // Load province và trigger load districts
      if (provinceId && provinces.length > 0) {
        console.log('All provinces:', provinces);
        console.log('Looking for province with ID:', provinceId);
        let province = provinces.find(p => Number(p.id) === provinceId);
        
        // Fallback: tìm theo tên nếu không tìm thấy theo ID
        if (!province && initialData.provinceName) {
          console.log('Province ID not found, trying to find by name:', initialData.provinceName);
          // Remove "Tỉnh" or "Thành phố" prefix và tìm kiếm linh hoạt
          const searchName = initialData.provinceName
            .replace(/^(Tỉnh|Thành phố)\s+/i, '')
            .trim()
            .toLowerCase();
          console.log('Search name:', searchName);
          
          province = provinces.find(p => {
            if (!p.name) return false;
            const pName = p.name.toLowerCase();
            // Exact match hoặc chứa tên
            return pName === searchName || 
                   pName.includes(searchName) || 
                   searchName.includes(pName);
          });
          
          if (province) {
            console.log('Found province by name:', province);
            // Cập nhật lại provinceId đúng
            setFormData(prev => ({ ...prev, provinceId: Number(province.id) }));
          } else {
            console.warn('Province not found by name. Trying first province with similar name...');
            // Last resort: tìm province có tên gần giống nhất
            const firstMatch = provinces.find(p => 
              p.name && (
                p.name.toLowerCase().includes('vĩnh') ||
                p.name.toLowerCase().includes('vinh')
              )
            );
            if (firstMatch) {
              console.log('Found similar province:', firstMatch);
              province = firstMatch;
              setFormData(prev => ({ ...prev, provinceId: Number(firstMatch.id) }));
            }
          }
        }
        
        if (province) {
          console.log('Using province:', province);
          setSelectedProvince(province);
          selectProvince(Number(province.id)); // Trigger load districts
        } else {
          console.warn('Province not found in list:', provinceId);
          console.warn('Available province IDs:', provinces.map(p => p.id));
          console.warn('Available province names:', provinces.map(p => p.name));
          setSelectedProvince(null);
        }
      } else {
        setSelectedProvince(null);
      }
    } else {
      // Reset form khi thêm mới
      setFormData({
        recipientName: '',
        phoneNumber: '',
        provinceId: null,
        districtId: null,
        wardId: null,
        streetAddress: '',
        isPrimary: false
      });
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialData, provinces]);

  // Separate effect to load district when provinces become available
  useEffect(() => {
    if (!isOpen || !formData.provinceId || !provinces.length) return;
    
    // Check if we need to load districts for editing
    if (formData.districtId && districts.length === 0) {
      console.log('Loading districts for province:', formData.provinceId);
      selectProvince(formData.provinceId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinces, formData.provinceId, isOpen]);

  // Khi danh sách districts thay đổi, set lại selectedDistrict nếu có
  useEffect(() => {
    if (formData.districtId && districts.length > 0) {
      const districtId = Number(formData.districtId);
      let district = districts.find(d => Number(d.id) === districtId);
      
      // Fallback: tìm theo tên nếu không tìm thấy theo ID
      if (!district && initialData?.districtName) {
        console.log('District ID not found, trying to find by name:', initialData.districtName);
        // Remove "Huyện" or "Quận" or "Thành phố" or "Thị xã" prefix
        const searchName = initialData.districtName
          .replace(/^(Huyện|Quận|Thành phố|Thị xã)\s+/i, '')
          .trim()
          .toLowerCase();
        console.log('Search district name:', searchName);
        
        district = districts.find(d => {
          if (!d.name) return false;
          const dName = d.name.toLowerCase();
          return dName === searchName || 
                 dName.includes(searchName) || 
                 searchName.includes(dName);
        });
        
        if (district) {
          console.log('Found district by name:', district);
          setFormData(prev => ({ ...prev, districtId: Number(district.id) }));
        }
      }
      
      if (district) {
        console.log('Found district:', district);
        setSelectedDistrict(district);
        // Trigger load wards nếu có wardId và chưa load wards
        if (formData.wardId && wards.length === 0) {
          selectDistrict(Number(district.id));
        }
      } else {
        console.warn('District not found:', districtId);
        setSelectedDistrict(null);
      }
    } else {
      setSelectedDistrict(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.districtId, districts]);

  // Khi danh sách wards thay đổi, set lại selectedWard nếu có
  useEffect(() => {
    if (formData.wardId && wards.length > 0) {
      let ward = wards.find(w => String(w.id) === String(formData.wardId) || String(w.code) === String(formData.wardId));
      
      // Fallback: tìm theo tên nếu không tìm thấy theo ID/code
      if (!ward && initialData?.wardName) {
        console.log('Ward not found by ID/code, trying to find by name:', initialData.wardName);
        // Remove "Xã" or "Phường" or "Thị trấn" prefix
        const searchName = initialData.wardName
          .replace(/^(Xã|Phường|Thị trấn)\s+/i, '')
          .trim()
          .toLowerCase();
        console.log('Search ward name:', searchName);
        
        ward = wards.find(w => {
          if (!w.name) return false;
          const wName = w.name.toLowerCase();
          return wName === searchName || 
                 wName.includes(searchName) || 
                 searchName.includes(wName);
        });
        
        if (ward) {
          console.log('Found ward by name:', ward);
          setFormData(prev => ({ ...prev, wardId: ward.id }));
        }
      }
      
      if (ward) {
        console.log('Found ward:', ward);
        setSelectedWard(ward);
      } else {
        console.warn('Ward not found:', formData.wardId);
        setSelectedWard(null);
      }
    } else {
      setSelectedWard(null);
    }
  }, [formData.wardId, wards, initialData]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.recipientName.trim()) {
      newErrors.recipientName = 'Vui lòng nhập tên người nhận';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }

    if (!formData.provinceId) {
      newErrors.provinceId = 'Vui lòng chọn tỉnh/thành phố';
    }

    if (!formData.districtId) {
      newErrors.districtId = 'Vui lòng chọn quận/huyện';
    }

    if (!formData.wardId) {
      newErrors.wardId = 'Vui lòng chọn phường/xã';
    }

    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Vui lòng nhập địa chỉ cụ thể';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      recipientName: '',
      phoneNumber: '',
      provinceId: null,
      districtId: null,
      wardId: null,
      streetAddress: '',
      isPrimary: false
    });
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setErrors({});
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Ghép fullAddress từ streetAddress + tỉnh/huyện/xã đang chọn
      const provinceName = selectedProvince?.name || '';
      const districtName = selectedDistrict?.name || '';
      const wardName = selectedWard?.name || '';
      const street = formData.streetAddress || '';
      let fullAddress = street;
      if (wardName) fullAddress += ', ' + wardName;
      if (districtName) fullAddress += ', ' + districtName;
      if (provinceName) fullAddress += ', ' + provinceName;

      // Always set label to 'Buyer', contact_name to recipientName
      const addressData = {
        label: 'Buyer',
        contactName: formData.recipientName,
        fullAddress,
        provinceId: formData.provinceId,
        districtId: formData.districtId,
        wardCode: String(formData.wardId),
        contactPhone: formData.phoneNumber,
        primaryAddress: formData.isPrimary
      };

      await onSave(addressData);
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      // Error handled in parent component
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {initialData ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Recipient Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiUser className="inline mr-2" />
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.recipientName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nguyễn Văn A"
                  disabled={loading}
                />
                {errors.recipientName && (
                  <p className="mt-1 text-sm text-red-600">{errors.recipientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FiPhone className="inline mr-2" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                    errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0123456789"
                  disabled={loading}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                )}
              </div>
            </div>

            {/* City, District, Ward - Using LocationDropdown */}
            <LocationDropdown
              selectedProvince={selectedProvince}
              selectedDistrict={selectedDistrict}
              selectedWard={selectedWard}
              provinces={provinces}
              districts={districts}
              wards={wards}
              onProvinceChange={(province) => {
                console.log('Province selected:', province);
                setSelectedProvince(province);
                setFormData(prev => ({
                  ...prev,
                  provinceId: province?.id ? Number(province.id) : null,
                  districtId: null,
                  wardId: null
                }));
                if (province?.id) {
                  selectProvince(Number(province.id));
                }
                setSelectedDistrict(null);
                setSelectedWard(null);
                setErrors(prev => ({
                  ...prev,
                  provinceId: '',
                  districtId: '',
                  wardId: ''
                }));
              }}
              onDistrictChange={(district) => {
                console.log('District selected:', district);
                setSelectedDistrict(district);
                setFormData(prev => ({
                  ...prev,
                  districtId: district?.id ? Number(district.id) : null,
                  wardId: null
                }));
                if (district?.id) {
                  selectDistrict(Number(district.id));
                }
                setSelectedWard(null);
                setErrors(prev => ({
                  ...prev,
                  districtId: '',
                  wardId: ''
                }));
              }}
              onWardChange={(ward) => {
                setSelectedWard(ward);
                setFormData(prev => ({
                  ...prev,
                  wardId: ward?.id || null
                }));
                setErrors(prev => ({
                  ...prev,
                  wardId: ''
                }));
              }}
              loadingDistricts={loadingDistricts}
              loadingWards={loadingWards}
              error={locationError}
              disabled={loading}
            />

            {/* Display validation errors for location fields */}
            {(errors.provinceId || errors.districtId || errors.wardId) && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-1">
                {errors.provinceId && <p className="text-sm text-red-600">{errors.provinceId}</p>}
                {errors.districtId && <p className="text-sm text-red-600">{errors.districtId}</p>}
                {errors.wardId && <p className="text-sm text-red-600">{errors.wardId}</p>}
              </div>
            )}

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ cụ thể
              </label>
              <textarea
                name="streetAddress"
                value={formData.streetAddress}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.streetAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Số nhà, tên đường..."
                disabled={loading}
              />
              {errors.streetAddress && (
                <p className="mt-1 text-sm text-red-600">{errors.streetAddress}</p>
              )}
            </div>

            {/* Set as Primary */}
            {!initialData?.isPrimary && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  name="isPrimary"
                  checked={formData.isPrimary}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  disabled={loading}
                />
                <label htmlFor="isPrimary" className="text-sm text-gray-700">
                  Đặt làm địa chỉ mặc định
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loading size="sm" />
                    <span>Đang lưu...</span>
                  </div>
                ) : (
                  initialData ? 'Cập Nhật' : 'Thêm Địa Chỉ'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressFormModal;
