import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiShoppingBag as FiStore, FiPhone, FiMail, FiMapPin, FiCreditCard, 
  FiUser, FiCamera, FiCheck, FiLoader,
  FiUpload, FiX, FiInfo
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { useAddressMaster } from '../../hooks/useAddressMaster';
import { submitSellerRegistration, getRegistrationStatus, canSubmitRegistration } from '../../services/sellerRegistrationService';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';

/**
 * SellerRegistrationPage
 * Form đăng ký trở thành người bán cho BUYER
 */
const SellerRegistrationPage = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  // Check eligibility state
  const [canSubmit, setCanSubmit] = useState(true);
  const [existingStatus, setExistingStatus] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    // Shop info
    shopName: '',
    description: '',
    shopPhone: '',
    shopEmail: '',
    // Address
    fullAddress: '',
    provinceId: '',
    districtId: '',
    wardCode: '',
    provinceName: '',
    districtName: '',
    wardName: '',
    contactPhone: '',
    contactName: '',
    // KYC
    idCardNumber: '',
    idCardName: '',
    idCardFrontUrl: '',
    idCardFrontPublicId: '',
    idCardBackUrl: '',
    idCardBackPublicId: '',
    selfieWithIdUrl: '',
    selfieWithIdPublicId: '',
    // Logo (optional)
    logoUrl: '',
    logoPublicId: '',
    // Banner (optional)
    bannerUrl: '',
    bannerPublicId: '',
  });

  // Upload states
  const [uploading, setUploading] = useState({
    idCardFront: false,
    idCardBack: false,
    selfie: false,
    logo: false,
    banner: false,
  });

  // Form submission
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Use address master hook
  const {
    provinces,
    districts,
    wards,
    loading: loadingProvinces,
    loadingDistricts,
    loadingWards,
    selectProvince,
    selectDistrict,
  } = useAddressMaster();

  // Check if user can submit registration
  useEffect(() => {
    const checkEligibility = async () => {
      if (!user || hasRole('SELLER') || hasRole('ADMIN')) {
        setCheckingEligibility(false);
        return;
      }

      try {
        // First check if can submit
        const canSubmitRes = await canSubmitRegistration();
        if (canSubmitRes?.data?.canSubmit === false) {
          setCanSubmit(false);
          // Get existing status
          try {
            const statusRes = await getRegistrationStatus();
            setExistingStatus(statusRes?.data);
          } catch (err) {
            console.log('No existing registration');
          }
        }
      } catch (error) {
        console.error('Error checking eligibility:', error);
      } finally {
        setCheckingEligibility(false);
      }
    };

    checkEligibility();
  }, [user, hasRole]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle province change - use useAddressMaster hook
  const handleProvinceChange = (e) => {
    const provinceId = e.target.value;
    const province = provinces.find(p => String(p.id) === provinceId);
    selectProvince(provinceId ? parseInt(provinceId) : null);
    setFormData(prev => ({
      ...prev,
      provinceId: provinceId,
      provinceName: province?.name || '',
      districtId: '',
      districtName: '',
      wardCode: '',
      wardName: '',
    }));
  };

  // Handle district change - use useAddressMaster hook
  const handleDistrictChange = (e) => {
    const districtId = e.target.value;
    const district = districts.find(d => String(d.id) === districtId);
    selectDistrict(districtId ? parseInt(districtId) : null);
    setFormData(prev => ({
      ...prev,
      districtId: districtId,
      districtName: district?.name || '',
      wardCode: '',
      wardName: '',
    }));
  };

  // Handle ward change
  const handleWardChange = (e) => {
    const wardCode = e.target.value;
    const ward = wards.find(w => w.id === wardCode);
    setFormData(prev => ({
      ...prev,
      wardCode: wardCode,
      wardName: ward?.name || '',
    }));
  };

  // Handle image upload (KYC, logo, banner)
  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    
    // Different size limits for different types
    const maxSize = type === 'banner' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Kích thước ảnh tối đa ${type === 'banner' ? '10MB' : '5MB'}`);
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));

    try {
      // Determine folder based on type
      let folder = 'kyc';
      if (type === 'logo') folder = 'shop-logos';
      if (type === 'banner') folder = 'shop-banners';

      // Upload to general image endpoint
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('folder', folder);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'https://localhost:8081/api/'}images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`,
        },
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      const imageData = result.data || result;

      // Update form data based on type
      if (type === 'idCardFront') {
        setFormData(prev => ({
          ...prev,
          idCardFrontUrl: imageData.url || imageData.imageUrl,
          idCardFrontPublicId: imageData.publicId,
        }));
      } else if (type === 'idCardBack') {
        setFormData(prev => ({
          ...prev,
          idCardBackUrl: imageData.url || imageData.imageUrl,
          idCardBackPublicId: imageData.publicId,
        }));
      } else if (type === 'selfie') {
        setFormData(prev => ({
          ...prev,
          selfieWithIdUrl: imageData.url || imageData.imageUrl,
          selfieWithIdPublicId: imageData.publicId,
        }));
      } else if (type === 'logo') {
        setFormData(prev => ({
          ...prev,
          logoUrl: imageData.url || imageData.imageUrl,
          logoPublicId: imageData.publicId,
        }));
      } else if (type === 'banner') {
        setFormData(prev => ({
          ...prev,
          bannerUrl: imageData.url || imageData.imageUrl,
          bannerPublicId: imageData.publicId,
        }));
      }

      toast.success('Tải ảnh thành công');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Tải ảnh thất bại');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  // Remove uploaded image
  const removeImage = (type) => {
    if (type === 'idCardFront') {
      setFormData(prev => ({ ...prev, idCardFrontUrl: '', idCardFrontPublicId: '' }));
    } else if (type === 'idCardBack') {
      setFormData(prev => ({ ...prev, idCardBackUrl: '', idCardBackPublicId: '' }));
    } else if (type === 'selfie') {
      setFormData(prev => ({ ...prev, selfieWithIdUrl: '', selfieWithIdPublicId: '' }));
    } else if (type === 'logo') {
      setFormData(prev => ({ ...prev, logoUrl: '', logoPublicId: '' }));
    } else if (type === 'banner') {
      setFormData(prev => ({ ...prev, bannerUrl: '', bannerPublicId: '' }));
    }
  };

  // Validate step
  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.shopName?.trim()) {
          toast.error('Vui lòng nhập tên shop');
          return false;
        }
        if (!formData.shopPhone?.trim()) {
          toast.error('Vui lòng nhập số điện thoại shop');
          return false;
        }
        if (!/^0[0-9]{9,10}$/.test(formData.shopPhone)) {
          toast.error('Số điện thoại không hợp lệ');
          return false;
        }
        if (!formData.shopEmail?.trim()) {
          toast.error('Vui lòng nhập email shop');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.shopEmail)) {
          toast.error('Email không hợp lệ');
          return false;
        }
        return true;

      case 2:
        if (!formData.provinceId) {
          toast.error('Vui lòng chọn Tỉnh/Thành phố');
          return false;
        }
        if (!formData.districtId) {
          toast.error('Vui lòng chọn Quận/Huyện');
          return false;
        }
        if (!formData.wardCode) {
          toast.error('Vui lòng chọn Phường/Xã');
          return false;
        }
        if (!formData.fullAddress?.trim()) {
          toast.error('Vui lòng nhập địa chỉ chi tiết');
          return false;
        }
        return true;

      case 3:
        if (!formData.idCardNumber?.trim()) {
          toast.error('Vui lòng nhập số CMND/CCCD');
          return false;
        }
        if (!/^[0-9]{9}$|^[0-9]{12}$/.test(formData.idCardNumber)) {
          toast.error('Số CMND (9 số) hoặc CCCD (12 số) không hợp lệ');
          return false;
        }
        if (!formData.idCardName?.trim()) {
          toast.error('Vui lòng nhập họ tên trên CMND/CCCD');
          return false;
        }
        if (!formData.idCardFrontUrl) {
          toast.error('Vui lòng tải ảnh mặt trước CMND/CCCD');
          return false;
        }
        if (!formData.idCardBackUrl) {
          toast.error('Vui lòng tải ảnh mặt sau CMND/CCCD');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(3)) return;

    setSubmitting(true);
    try {
      const response = await submitSellerRegistration(formData);
      
      if (response?.statusCode === 201 || response?.data?.success) {
        toast.success('Đăng ký thành công! Đơn của bạn đang chờ xét duyệt.');
        navigate('/seller/registration-status');
      } else {
        toast.error(response?.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Render loading
  if (checkingEligibility) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FiLoader className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang kiểm tra...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render if already seller
  if (hasRole('SELLER')) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bạn đã là Người bán!</h2>
            <p className="text-gray-600 mb-6">
              Tài khoản của bạn đã được kích hoạt quyền bán hàng.
            </p>
            <button
              onClick={() => navigate('/seller/dashboard')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Vào Kênh Người bán
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render existing application status
  if (!canSubmit && existingStatus) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg">
            <div className="text-center mb-6">
              {existingStatus.status === 'PENDING' && (
                <>
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiLoader className="w-8 h-8 text-yellow-600 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Đơn đang chờ duyệt</h2>
                  <p className="text-gray-600">
                    Đơn đăng ký của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.
                  </p>
                </>
              )}
              {existingStatus.status === 'REJECTED' && (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiX className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Đơn bị từ chối</h2>
                  <p className="text-gray-600 mb-4">{existingStatus.rejectionReason}</p>
                  <button
                    onClick={() => {
                      // TODO: Call cancelRejectedApplication API then reload
                      setCanSubmit(true);
                      setExistingStatus(null);
                    }}
                    className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Đăng ký lại
                  </button>
                </>
              )}
            </div>

            {/* Application details */}
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thông tin đơn đăng ký</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên shop:</span>
                  <span className="font-medium">{existingStatus.shopName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày nộp:</span>
                  <span className="font-medium">
                    {existingStatus.submittedAt ? new Date(existingStatus.submittedAt).toLocaleDateString('vi-VN') : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className={`font-medium ${
                    existingStatus.status === 'PENDING' ? 'text-yellow-600' :
                    existingStatus.status === 'REJECTED' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {existingStatus.statusDescription}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Render registration form
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiStore className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đăng ký bán hàng</h1>
            <p className="text-gray-600">
              Trở thành người bán trên SportZone và bắt đầu kinh doanh ngay hôm nay!
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full font-semibold
                  ${currentStep >= step 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-500'}
                `}>
                  {currentStep > step ? <FiCheck className="w-5 h-5" /> : step}
                </div>
                {step < 3 && (
                  <div className={`w-16 md:w-24 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Step labels */}
          <div className="flex justify-between mb-8 text-sm text-gray-600 max-w-md mx-auto">
            <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : ''}>Thông tin shop</span>
            <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : ''}>Địa chỉ</span>
            <span className={currentStep >= 3 ? 'text-primary-600 font-medium' : ''}>Xác thực</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            {/* Step 1: Shop Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiStore className="w-5 h-5 text-primary-600" />
                  Thông tin Shop
                </h2>

                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên Shop <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    placeholder="VD: Sport Pro Shop"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả Shop
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Giới thiệu về shop của bạn..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiPhone className="inline w-4 h-4 mr-1" />
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="shopPhone"
                      value={formData.shopPhone}
                      onChange={handleChange}
                      placeholder="0901234567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FiMail className="inline w-4 h-4 mr-1" />
                      Email Shop <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="shopEmail"
                      value={formData.shopEmail}
                      onChange={handleChange}
                      placeholder="shop@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Logo Upload (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo Shop (Tùy chọn)
                  </label>
                  <div className="flex items-center gap-4">
                    {formData.logoUrl ? (
                      <div className="relative">
                        <img
                          src={formData.logoUrl}
                          alt="Shop logo"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('logo')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        {uploading.logo ? (
                          <FiLoader className="w-6 h-6 text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <FiUpload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Upload</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'logo')}
                          className="hidden"
                          disabled={uploading.logo}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Banner Upload (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Shop (Tùy chọn)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Kích thước khuyến nghị: 1200x300px</p>
                  <div className="flex items-center gap-4">
                    {formData.bannerUrl ? (
                      <div className="relative w-full max-w-md">
                        <img
                          src={formData.bannerUrl}
                          alt="Shop banner"
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('banner')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full max-w-md h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        {uploading.banner ? (
                          <FiLoader className="w-6 h-6 text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <FiUpload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">Upload Banner</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'banner')}
                          className="hidden"
                          disabled={uploading.banner}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiMapPin className="w-5 h-5 text-primary-600" />
                  Địa chỉ lấy hàng
                </h2>

                {/* Province/District/Ward */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tỉnh/Thành phố <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.provinceId}
                      onChange={handleProvinceChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={loadingProvinces}
                      required
                    >
                      <option value="">{loadingProvinces ? 'Đang tải...' : 'Chọn Tỉnh/TP'}</option>
                      {provinces.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quận/Huyện <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.districtId}
                      onChange={handleDistrictChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={!formData.provinceId || loadingDistricts}
                      required
                    >
                      <option value="">{loadingDistricts ? 'Đang tải...' : 'Chọn Quận/Huyện'}</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phường/Xã <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.wardCode}
                      onChange={handleWardChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={!formData.districtId || loadingWards}
                      required
                    >
                      <option value="">{loadingWards ? 'Đang tải...' : 'Chọn Phường/Xã'}</option>
                      {wards.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ chi tiết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    placeholder="Số nhà, tên đường..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên người liên hệ
                    </label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Tên người nhận/gửi hàng"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SĐT liên hệ
                    </label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="SĐT lấy hàng"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: KYC Verification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FiCreditCard className="w-5 h-5 text-primary-600" />
                  Xác thực danh tính (KYC)
                </h2>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                  <FiInfo className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Thông tin bảo mật</p>
                    <p>Thông tin CMND/CCCD của bạn được bảo mật và chỉ dùng để xác thực danh tính.</p>
                  </div>
                </div>

                {/* ID Card Number & Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số CMND/CCCD <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="idCardNumber"
                      value={formData.idCardNumber}
                      onChange={handleChange}
                      placeholder="9 hoặc 12 số"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ tên (trên CMND/CCCD) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="idCardName"
                      value={formData.idCardName}
                      onChange={handleChange}
                      placeholder="NGUYEN VAN A"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                      required
                    />
                  </div>
                </div>

                {/* ID Card Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Front */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh mặt trước <span className="text-red-500">*</span>
                    </label>
                    {formData.idCardFrontUrl ? (
                      <div className="relative">
                        <img
                          src={formData.idCardFrontUrl}
                          alt="ID Front"
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('idCardFront')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        {uploading.idCardFront ? (
                          <FiLoader className="w-8 h-8 text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <FiCamera className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Tải ảnh mặt trước</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'idCardFront')}
                          className="hidden"
                          disabled={uploading.idCardFront}
                        />
                      </label>
                    )}
                  </div>

                  {/* Back */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh mặt sau <span className="text-red-500">*</span>
                    </label>
                    {formData.idCardBackUrl ? (
                      <div className="relative">
                        <img
                          src={formData.idCardBackUrl}
                          alt="ID Back"
                          className="w-full h-40 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('idCardBack')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                        {uploading.idCardBack ? (
                          <FiLoader className="w-8 h-8 text-gray-400 animate-spin" />
                        ) : (
                          <>
                            <FiCamera className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Tải ảnh mặt sau</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'idCardBack')}
                          className="hidden"
                          disabled={uploading.idCardBack}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Selfie with ID (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ảnh chân dung cầm CMND/CCCD (Tùy chọn - tăng độ tin cậy)
                  </label>
                  {formData.selfieWithIdUrl ? (
                    <div className="relative w-48">
                      <img
                        src={formData.selfieWithIdUrl}
                        alt="Selfie with ID"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('selfie')}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                      {uploading.selfie ? (
                        <FiLoader className="w-8 h-8 text-gray-400 animate-spin" />
                      ) : (
                        <>
                          <FiUser className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500 text-center px-2">
                            Ảnh chân dung cầm CMND
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'selfie')}
                        className="hidden"
                        disabled={uploading.selfie}
                      />
                    </label>
                  )}
                </div>

                {/* Payment Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                    <FiCreditCard className="w-5 h-5" />
                    Phương thức thanh toán
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <FiCheck className="w-5 h-5" />
                      <span>Thanh toán khi nhận hàng (COD)</span>
                    </div>
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      Mặc định
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-2">
                    * Các phương thức thanh toán khác sẽ được bổ sung sau.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Quay lại
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <FiLoader className="w-5 h-5 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5" />
                      Gửi đăng ký
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SellerRegistrationPage;
