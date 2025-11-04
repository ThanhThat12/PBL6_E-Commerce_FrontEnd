import React, { useState, useEffect } from 'react';
import addressService from '../../services/addressService';

/**
 * ShippingFeeCalculator Component
 * Tính phí vận chuyển dựa trên địa chỉ và trọng lượng
 */
const ShippingFeeCalculator = ({ shippingAddress, weightGrams, onFeeCalculated }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingInfo, setShippingInfo] = useState(null);

  // Tính phí vận chuyển khi địa chỉ thay đổi
  useEffect(() => {
    const calculateShippingFee = async () => {
      // Nếu không có địa chỉ hoặc thiếu thông tin
      if (!shippingAddress || !shippingAddress.toDistrictId || !shippingAddress.toWardCode) {
        setShippingFee(0);
        setShippingInfo(null);
        onFeeCalculated(0, null);
        return;
      }

      setIsCalculating(true);

      try {
        // Gọi API tính phí vận chuyển
        const response = await addressService.calculateShippingFee({
          toDistrictId: parseInt(shippingAddress.toDistrictId),
          toWardCode: shippingAddress.toWardCode,
          weight: weightGrams || 500,
          insuranceValue: 0 // Có thể thêm giá trị bảo hiểm sau
        });

        console.log('📦 Shipping fee response:', response);

        if (response && response.total) {
          const fee = response.total;
          const info = {
            serviceName: response.service_type_name || 'Giao hàng tiêu chuẩn',
            expectedDelivery: response.expected_delivery_time || 'Dự kiến 3-5 ngày',
            fee: fee
          };

          setShippingFee(fee);
          setShippingInfo(info);
          onFeeCalculated(fee, info);
        } else {
          // Fallback: Tính phí cố định theo khu vực
          const defaultFee = calculateDefaultFee(shippingAddress);
          setShippingFee(defaultFee);
          setShippingInfo({
            serviceName: 'Giao hàng tiêu chuẩn',
            expectedDelivery: 'Dự kiến 3-5 ngày',
            fee: defaultFee
          });
          onFeeCalculated(defaultFee, null);
        }
      } catch (error) {
        console.error('❌ Error calculating shipping fee:', error);
        
        // Fallback: Tính phí mặc định
        const defaultFee = calculateDefaultFee(shippingAddress);
        setShippingFee(defaultFee);
        setShippingInfo({
          serviceName: 'Giao hàng tiêu chuẩn',
          expectedDelivery: 'Dự kiến 3-5 ngày',
          fee: defaultFee
        });
        onFeeCalculated(defaultFee, null);
      } finally {
        setIsCalculating(false);
      }
    };

    calculateShippingFee();
  }, [shippingAddress, weightGrams, onFeeCalculated]);

  // Tính phí mặc định nếu API thất bại
  const calculateDefaultFee = (address) => {
    if (!address || !address.province) return 30000; // Mặc định 30k

    const province = address.province.toLowerCase();
    
    // Miễn phí cho HCM và Hà Nội
    if (province.includes('hồ chí minh') || province.includes('hà nội')) {
      return 0;
    }
    
    // 20k cho các thành phố lớn
    if (province.includes('đà nẵng') || province.includes('cần thơ') || province.includes('hải phòng')) {
      return 20000;
    }
    
    // 30k cho các tỉnh còn lại
    return 30000;
  };

  // Hiển thị trạng thái tính phí
  if (isCalculating) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span>Đang tính phí vận chuyển...</span>
      </div>
    );
  }

  // Hiển thị thông tin phí vận chuyển
  if (shippingInfo) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium text-gray-900">{shippingInfo.serviceName}</p>
            <p className="text-xs text-gray-500">{shippingInfo.expectedDelivery}</p>
          </div>
          <div className="text-right">
            {shippingFee === 0 ? (
              <span className="font-semibold text-green-600">Miễn phí</span>
            ) : (
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(shippingFee)}
              </span>
            )}
          </div>
        </div>
        {shippingFee === 0 && (
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            <span>🎉</span>
            <span>Miễn phí vận chuyển cho khu vực này</span>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default ShippingFeeCalculator;
