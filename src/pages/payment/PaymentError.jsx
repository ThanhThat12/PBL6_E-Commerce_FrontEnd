import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentStatus.css';

/**
 * Payment Error Page
 * Displayed when there's an unexpected error during payment
 * Route: /payment/error?message=...
 */
export default function PaymentError() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const message = searchParams.get('message') || 'An unexpected error occurred';

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="payment-status-container">
      <div className="payment-status-card error">
        {/* Error Icon */}
        <div className="status-icon error-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="40" fill="#FFE5E5" />
            <path
              d="M40 20V40M40 55H40.01"
              stroke="#FF6B6B"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="status-title error-title">Có Lỗi Xảy Ra</h1>

        {/* Message */}
        <p className="status-message">
          Xin lỗi! Đã xảy ra lỗi khi xử lý yêu cầu của bạn.
        </p>

        {/* Error Details */}
        <div className="error-details">
          <p className="error-message">{message}</p>
        </div>

        {/* Info Box */}
        <div className="info-box error-info">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#FF6B6B" strokeWidth="1.5" />
            <path d="M10 6V10M10 14H10.01" stroke="#FF6B6B" strokeWidth="1.5" />
          </svg>
          <p>
            Nếu sự cố tiếp tục xảy ra, vui lòng liên hệ với bộ phận hỗ trợ khách hàng của chúng tôi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn btn-primary" 
            onClick={handleGoHome}
          >
            Quay Lại Trang Chủ
          </button>
        </div>

        {/* Footer Info */}
        <div className="status-footer">
          <p>Cần giúp đỡ?</p>
          <a href="/contact">Liên hệ với chúng tôi</a>
        </div>
      </div>
    </div>
  );
}
