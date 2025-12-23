import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from '../../common/Card/Card';

/**
 * VoucherSection - Hiển thị voucher sàn (platform vouchers)
 * Data từ API: GET /api/public/vouchers
 */
const VoucherSection = ({ vouchers = [], title = 'Voucher Sàn' }) => {
  const [copiedId, setCopiedId] = useState(null);

  if (!vouchers || vouchers.length === 0) {
    return null; // Don't render if no vouchers
  }

  // Handle copy to clipboard with notification
  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000); // Hide after 2s
  };

  // Format discount value for display
  const formatDiscount = (voucher) => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`;
    }
    return `${(voucher.discountValue / 1000).toFixed(0)}K`;
  };

  // Format min order value
  const formatMinOrder = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}TR`;
    }
    return `${(value / 1000).toFixed(0)}K`;
  };

  // Calculate usage percentage
  const getUsagePercentage = (voucher) => {
    if (!voucher.usageLimit) return 0;
    return Math.min(100, (voucher.usedCount / voucher.usageLimit) * 100);
  };

  return (
    <section className="py-4 md:py-6">
      <h2 className="text-lg md:text-xl font-bold text-text-primary flex items-center gap-2 mb-3">
        <span className="text-xl">🎟️</span>
        {title}
      </h2>

      {/* Horizontal scroll container - 1 row only */}
      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
        <div className="flex gap-3 pb-2">
          {vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="w-[240px] flex-shrink-0"
            >
              <Card
                hoverable
                shadow="soft"
                className="overflow-hidden h-full bg-gradient-to-br from-primary-50 via-white to-accent-50 border border-primary-200"
              >
                <div className="p-3">
                  {/* Voucher header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-600 text-white rounded text-xs font-bold mb-1.5">
                        <span className="text-sm">🎁</span>
                        {formatDiscount(voucher)}
                      </div>
                      <h3 className="font-bold text-gray-900 text-xs line-clamp-2">
                        {voucher.description || voucher.code}
                      </h3>
                    </div>
                  </div>

                  {/* Voucher code with copy button */}
                  <div className="mb-2 p-1.5 bg-white rounded border border-dashed border-primary-400 relative">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-xs font-mono font-bold text-primary-700 truncate">
                        {voucher.code}
                      </code>
                      <button
                        onClick={() => handleCopy(voucher.code, voucher.id)}
                        className="px-1.5 py-0.5 text-xs font-semibold text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors flex-shrink-0"
                      >
                        {copiedId === voucher.id ? '✓ Đã sao' : 'Sao chép'}
                      </button>
                    </div>
                    {copiedId === voucher.id && (
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                        Đã sao chép!
                      </div>
                    )}
                  </div>

                  {/* Voucher details */}
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span>Đơn tối thiểu: <strong className="text-gray-900">{formatMinOrder(voucher.minOrderValue)}</strong></span>
                    </div>
                    {voucher.maxDiscountAmount && (
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Giảm tối đa: <strong className="text-gray-900">{formatMinOrder(voucher.maxDiscountAmount)}</strong></span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>HSD: <strong className="text-gray-900">{new Date(voucher.endDate).toLocaleDateString('vi-VN')}</strong></span>
                    </div>
                  </div>

                  {/* Usage bar */}
                  {voucher.usageLimit && (
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-[10px] text-gray-600 mb-0.5">
                        <span>Đã dùng</span>
                        <span className="font-semibold">{voucher.usedCount}/{voucher.usageLimit}</span>
                      </div>
                      <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300"
                          style={{ width: `${getUsagePercentage(voucher)}%` }}
                        />
                      </div>
                    </div>
                  )}

                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

VoucherSection.propTypes = {
  vouchers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      code: PropTypes.string.isRequired,
      description: PropTypes.string,
      discountType: PropTypes.string.isRequired,
      discountValue: PropTypes.number.isRequired,
      minOrderValue: PropTypes.number.isRequired,
      maxDiscountAmount: PropTypes.number,
      endDate: PropTypes.string.isRequired,
      usageLimit: PropTypes.number,
      usedCount: PropTypes.number,
      status: PropTypes.string,
    })
  ),
  title: PropTypes.string,
};

export default VoucherSection;
