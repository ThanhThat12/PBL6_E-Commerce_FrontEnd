import React, { useState } from 'react';
import Button from '../common/Button';
import { XMarkIcon, TicketIcon } from '@heroicons/react/24/outline';

/**
 * VoucherSelector Component
 * Component để chọn và áp dụng voucher giảm giá
 */
const VoucherSelector = ({ onVoucherApply, subtotal }) => {
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [showVoucherInput, setShowVoucherInput] = useState(false);

  // Mock vouchers - sau này có thể fetch từ API
  const availableVouchers = [
    {
      code: 'FREESHIP',
      name: 'Miễn phí vận chuyển',
      description: 'Miễn phí ship cho đơn hàng từ 500k',
      type: 'SHIPPING',
      value: 30000,
      minOrderValue: 500000,
      icon: '🚚'
    },
    {
      code: 'SAVE10',
      name: 'Giảm 10%',
      description: 'Giảm 10% tối đa 50k',
      type: 'PERCENTAGE',
      value: 10,
      maxDiscount: 50000,
      minOrderValue: 300000,
      icon: '💰'
    },
    {
      code: 'NEW50K',
      name: 'Giảm 50k',
      description: 'Giảm 50k cho đơn từ 200k',
      type: 'FIXED',
      value: 50000,
      minOrderValue: 200000,
      icon: '🎁'
    }
  ];

  // Kiểm tra voucher có hợp lệ không
  const validateVoucher = (voucher) => {
    if (!voucher) return { valid: false, message: 'Mã voucher không tồn tại' };
    
    if (subtotal < voucher.minOrderValue) {
      return {
        valid: false,
        message: `Đơn hàng tối thiểu ${new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(voucher.minOrderValue)}`
      };
    }
    
    return { valid: true, message: 'Áp dụng thành công!' };
  };

  // Tính giá trị giảm giá
  const calculateDiscount = (voucher) => {
    if (!voucher) return 0;
    
    switch (voucher.type) {
      case 'PERCENTAGE':
        const percentDiscount = (subtotal * voucher.value) / 100;
        return Math.min(percentDiscount, voucher.maxDiscount || percentDiscount);
      case 'FIXED':
        return voucher.value;
      case 'SHIPPING':
        return voucher.value;
      default:
        return 0;
    }
  };

  // Áp dụng voucher
  const handleApplyVoucher = (voucher) => {
    setIsApplying(true);
    
    setTimeout(() => {
      const validation = validateVoucher(voucher);
      
      if (validation.valid) {
        const discount = calculateDiscount(voucher);
        setAppliedVoucher({ ...voucher, discount });
        onVoucherApply({ ...voucher, discount });
        setShowVoucherInput(false);
        setVoucherCode('');
      } else {
        alert(validation.message);
      }
      
      setIsApplying(false);
    }, 500);
  };

  // Nhập mã voucher
  const handleApplyCode = () => {
    const voucher = availableVouchers.find(
      v => v.code.toLowerCase() === voucherCode.toLowerCase()
    );
    
    if (voucher) {
      handleApplyVoucher(voucher);
    } else {
      alert('Mã voucher không hợp lệ');
    }
  };

  // Xóa voucher
  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    onVoucherApply(null);
  };

  return (
    <div className="space-y-4">
      {/* Applied Voucher Display */}
      {appliedVoucher && (
        <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{appliedVoucher.icon}</span>
            <div>
              <p className="font-semibold text-green-900">{appliedVoucher.name}</p>
              <p className="text-sm text-green-700">
                Giảm {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(appliedVoucher.discount)}
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveVoucher}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
            aria-label="Xóa voucher"
          >
            <XMarkIcon className="w-5 h-5 text-green-700" />
          </button>
        </div>
      )}

      {/* Voucher Input Toggle */}
      {!appliedVoucher && !showVoucherInput && (
        <button
          onClick={() => setShowVoucherInput(true)}
          className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
        >
          <TicketIcon className="w-5 h-5 text-gray-500 group-hover:text-blue-600" />
          <span className="text-gray-700 group-hover:text-blue-600 font-medium">
            Chọn hoặc nhập mã giảm giá
          </span>
        </button>
      )}

      {/* Voucher Input Form */}
      {!appliedVoucher && showVoucherInput && (
        <div className="space-y-4 p-4 border-2 border-blue-300 rounded-lg bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Chọn mã giảm giá</h3>
            <button
              onClick={() => setShowVoucherInput(false)}
              className="p-1 hover:bg-blue-100 rounded"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Manual Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Nhập mã voucher"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleApplyCode()}
            />
            <Button
              onClick={handleApplyCode}
              disabled={!voucherCode || isApplying}
              loading={isApplying}
              variant="primary"
            >
              Áp dụng
            </Button>
          </div>

          {/* Available Vouchers List */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Voucher khả dụng:</p>
            {availableVouchers.map((voucher) => {
              const validation = validateVoucher(voucher);
              const isValid = validation.valid;
              
              return (
                <div
                  key={voucher.code}
                  className={`
                    p-3 border rounded-lg transition-all
                    ${isValid 
                      ? 'border-blue-300 bg-white hover:border-blue-500 cursor-pointer' 
                      : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'}
                  `}
                  onClick={() => isValid && handleApplyVoucher(voucher)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3 flex-1">
                      <span className="text-2xl">{voucher.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-900">{voucher.name}</p>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded font-mono">
                            {voucher.code}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{voucher.description}</p>
                        {!isValid && (
                          <p className="text-xs text-red-600 mt-1">{validation.message}</p>
                        )}
                      </div>
                    </div>
                    {isValid && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApplyVoucher(voucher);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Chọn
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherSelector;
