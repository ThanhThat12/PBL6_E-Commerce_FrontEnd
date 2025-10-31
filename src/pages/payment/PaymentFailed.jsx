import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentStatus.css';

/**
 * Payment Failed Page
 * Displayed after failed MoMo payment
 * Route: /payment/failed?orderId=...&message=...
 */
export default function PaymentFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const message = searchParams.get('message');

  useEffect(() => {
    setOrderData({
      orderId: orderId || 'N/A',
      message: message || 'Payment Failed',
      timestamp: new Date().toLocaleString('vi-VN'),
    });
    setLoading(false);
  }, [orderId, message]);

  const handleRetry = () => {
    // Navigate back to checkout to retry payment
    navigate(`/checkout?orderId=${orderId}`, { replace: true });
  };

  const handleContinueShopping = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="payment-status-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="payment-status-container">
      <div className="payment-status-card failed">
        {/* Failed Icon */}
        <div className="status-icon failed-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="40" fill="#F8D7DA" />
            <path
              d="M24 24L56 56M56 24L24 56"
              stroke="#DC3545"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="status-title failed-title">Thanh Toán Thất Bại</h1>

        {/* Message */}
        <p className="status-message">
          Rất tiếc, quá trình thanh toán của bạn không thành công.
        </p>

        {/* Order Details */}
        <div className="order-details">
          <div className="detail-row">
            <span className="detail-label">Mã Đơn Hàng:</span>
            <span className="detail-value">{orderData?.orderId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Lý Do:</span>
            <span className="detail-value error-text">✗ {orderData?.message}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Thời Gian:</span>
            <span className="detail-value">{orderData?.timestamp}</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box error-info">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#DC3545" strokeWidth="1.5" />
            <path d="M10 6V10M10 14H10.01" stroke="#DC3545" strokeWidth="1.5" />
          </svg>
          <p>
            Vui lòng kiểm tra lại thông tin thanh toán của bạn và thử lại. 
            Nếu vấn đề tiếp tục, hãy liên hệ với ngân hàng hoặc nhà cung cấp dịch vụ.
          </p>
        </div>

        {/* Possible Reasons */}
        <div className="reasons-box">
          <h3>Những Lý Do Có Thể:</h3>
          <ul>
            <li>Số dư tài khoản không đủ</li>
            <li>Thẻ/Tài khoản đã hết hạn</li>
            <li>Bạn từ chối xác nhận giao dịch</li>
            <li>Lỗi kết nối hoặc timeout</li>
            <li>Tài khoản bị khóa hoặc giới hạn giao dịch</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn btn-danger" 
            onClick={handleRetry}
          >
            Thử Lại Thanh Toán
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleContinueShopping}
          >
            Quay Lại Trang Chủ
          </button>
        </div>

        {/* Footer Info */}
        <div className="status-footer">
          <p>Cần hỗ trợ?</p>
          <a href="/contact">Liên hệ với đội hỗ trợ của chúng tôi</a>
        </div>
      </div>
    </div>
  );
}
