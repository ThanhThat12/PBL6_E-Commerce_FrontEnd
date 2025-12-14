import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, Clock, Percent } from 'lucide-react';

/**
 * VoucherSection - Hiển thị voucher do sàn phát hành
 */
const VoucherSection = ({ vouchers = [], title = "🎟️ Voucher Đề Xuất", subtitle = "" }) => {
  const navigate = useNavigate();

  if (!vouchers || vouchers.length === 0) {
    return null;
  }

  const handleVoucherClick = (voucher) => {
    // TODO: Navigate to voucher detail or auto-apply
    console.log('Voucher clicked:', voucher);
  };

  const formatDiscount = (voucher) => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`;
    }
    return `${Number(voucher.discountValue).toLocaleString('vi-VN')}₫`;
  };

  const formatMinOrder = (minOrderValue) => {
    if (!minOrderValue) return 'Không giới hạn';
    return `Đơn tối thiểu ${Number(minOrderValue).toLocaleString('vi-VN')}₫`;
  };

  const formatEndDate = (endDate) => {
    const date = new Date(endDate);
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        <p className="text-gray-600 mt-2">
          {subtitle || 'Voucher độc quyền từ sàn - Giảm ngay cho đơn hàng của bạn'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id || voucher.code}
            onClick={() => handleVoucherClick(voucher)}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden group"
          >
            {/* Voucher Header with Gradient */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Tag className="w-5 h-5" />
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
                  {voucher.shop ? 'Shop' : 'Platform'}
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {formatDiscount(voucher)}
              </div>
              {voucher.maxDiscountAmount && (
                <div className="text-xs opacity-90">
                  Giảm tối đa {Number(voucher.maxDiscountAmount).toLocaleString('vi-VN')}₫
                </div>
              )}
            </div>

            {/* Voucher Body */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">
                {voucher.description || voucher.code}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4 text-primary-500" />
                  <span>{formatMinOrder(voucher.minOrderValue)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-500" />
                  <span>HSD: {formatEndDate(voucher.endDate)}</span>
                </div>
              </div>

              {/* Voucher Code */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Mã:</span>
                  <span className="font-mono font-bold text-primary-600 text-sm">
                    {voucher.code}
                  </span>
                </div>
              </div>

              {/* Usage Limit */}
              {voucher.usageLimit && voucher.usedCount !== undefined && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Đã dùng: {voucher.usedCount}/{voucher.usageLimit}</span>
                    <span>{Math.floor((voucher.usedCount / voucher.usageLimit) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-primary-500 h-1.5 rounded-full transition-all"
                      style={{ width: `${(voucher.usedCount / voucher.usageLimit) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hover Effect Bottom */}
            <div className="bg-primary-50 p-3 text-center text-sm font-semibold text-primary-600 group-hover:bg-primary-100 transition-colors">
              Sử dụng ngay
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
      {vouchers.length >= 4 && (
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/vouchers')}
            className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2 mx-auto"
          >
            Xem tất cả voucher
            <span>→</span>
          </button>
        </div>
      )}
    </section>
  );
};

export default VoucherSection;
