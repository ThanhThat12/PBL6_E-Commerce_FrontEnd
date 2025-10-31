import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentStatus.css';

/**
 * Payment Success Page
 * Displayed after successful MoMo payment
 * Route: /payment/success?orderId=...&transId=...&message=...
 */
export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const transId = searchParams.get('transId');
  const message = searchParams.get('message');

  useEffect(() => {
    // Simulate fetching order details
    setOrderData({
      orderId: orderId || 'N/A',
      transId: transId || 'N/A',
      message: message || 'Payment Successful',
      timestamp: new Date().toLocaleString('vi-VN'),
    });
    setLoading(false);
  }, [orderId, transId, message]);

  const handleContinueShopping = () => {
    navigate('/');
  };

  const handleViewOrder = () => {
    navigate(`/profile`);
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
      <div className="payment-status-card success">
        {/* Success Icon */}
        <div className="status-icon success-icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="40" fill="#D4EDDA" />
            <path
              d="M56 32L36 52L24 40"
              stroke="#28A745"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="status-title success-title">Thanh Toán Thành Công!</h1>

        {/* Message */}
        <p className="status-message">
          Cảm ơn bạn! Đơn hàng của bạn đã được xác nhận.
        </p>

        {/* Order Details */}
        <div className="order-details">
          <div className="detail-row">
            <span className="detail-label">Mã Đơn Hàng:</span>
            <span className="detail-value">{orderData?.orderId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Mã Giao Dịch:</span>
            <span className="detail-value">{orderData?.transId}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Trạng Thái:</span>
            <span className="detail-value success-text">✓ {orderData?.message}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Thời Gian:</span>
            <span className="detail-value">{orderData?.timestamp}</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box success-info">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#0066CC" strokeWidth="1.5" />
            <path d="M10 6V10M10 14H10.01" stroke="#0066CC" strokeWidth="1.5" />
          </svg>
          <p>
            Email xác nhận đã được gửi đến địa chỉ email của bạn. 
            Hãy kiểm tra hộp thư để nhận hướng dẫn tiếp theo.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="btn btn-primary" 
            onClick={handleViewOrder}
          >
            Xem Chi Tiết Đơn Hàng
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleContinueShopping}
          >
            Tiếp Tục Mua Sắm
          </button>
        </div>

        {/* Footer Info */}
        <div className="status-footer">
          <p>Nếu có bất kỳ câu hỏi nào, vui lòng</p>
          <a href="/contact">liên hệ với chúng tôi</a>
        </div>
      </div>
    </div>
  );
}
