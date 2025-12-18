import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, Result, message } from 'antd';
import { CloseCircleOutlined, EditOutlined } from '@ant-design/icons';
import { getRegistrationStatus } from '../../services/seller/shopService';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * RejectionStatusPage Component
 * Displayed when seller's shop registration is REJECTED by admin
 * Shows rejection reason and allows re-submission by editing
 */
const RejectionStatusPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [rejectionData, setRejectionData] = useState(null);

  // Get rejection info from navigation state OR fetch from API
  const stateData = location.state || {};

  useEffect(() => {
    const fetchRejectionStatus = async () => {
      try {
        setLoading(true);
        const data = await getRegistrationStatus();
        
        if (data.status !== 'REJECTED') {
          // Not rejected anymore, redirect to appropriate page
          if (data.status === 'PENDING') {
            navigate('/seller/registration-status', { replace: true });
          } else if (data.status === 'ACTIVE') {
            navigate('/seller', { replace: true });
          }
          return;
        }

        setRejectionData({
          shopName: data.shopName,
          rejectionReason: data.rejectionReason,
          reviewedAt: data.reviewedAt,
          shopId: data.shopId
        });
      } catch (error) {
        console.error('Error fetching rejection status:', error);
        message.error('Không thể tải thông tin đơn đăng ký');
      } finally {
        setLoading(false);
      }
    };

    fetchRejectionStatus();
  }, [navigate]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Navigate to seller registration page to edit
  const handleEditApplication = () => {
    navigate('/seller/register?mode=edit', {
      state: {
        isEditing: true,
        shopId: rejectionData?.shopId,
        rejectionReason: rejectionData?.rejectionReason
      }
    });
  };

  // Navigate back to buyer portal
  const handleBackToBuyer = () => {
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  const displayData = rejectionData || stateData;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full shadow-lg">
        <Result
          status="error"
          icon={<CloseCircleOutlined className="text-red-500" />}
          title={<span className="text-2xl font-bold text-red-800">Đơn đăng ký bị từ chối</span>}
          subTitle={
            <div className="text-left space-y-4 mt-6">
              {displayData?.shopName && (
                <div>
                  <p className="text-sm text-gray-500">Tên cửa hàng:</p>
                  <p className="text-lg font-semibold text-gray-800">{displayData.shopName}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-gray-500">Lý do từ chối:</p>
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mt-2">
                  <p className="text-red-800 font-medium">
                    {displayData?.rejectionReason || 'Không có lý do cụ thể được cung cấp'}
                  </p>
                </div>
              </div>

              {displayData?.reviewedAt && (
                <div>
                  <p className="text-sm text-gray-500">Thời gian xét duyệt:</p>
                  <p className="text-gray-700">{formatDate(displayData.reviewedAt)}</p>
                </div>
              )}

              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Hướng dẫn:</strong> Vui lòng đọc kỹ lý do từ chối và chỉnh sửa thông tin theo yêu cầu 
                  của admin. Nhấn nút "Chỉnh sửa đơn đăng ký" để cập nhật thông tin và gửi lại cho admin xét duyệt.
                </p>
              </div>
            </div>
          }
          extra={[
            <Button 
              key="edit" 
              type="primary" 
              size="large"
              icon={<EditOutlined />}
              onClick={handleEditApplication}
              className="mr-2"
            >
              Chỉnh sửa đơn đăng ký
            </Button>,
            <Button 
              key="back" 
              size="large"
              onClick={handleBackToBuyer}
            >
              Quay lại trang chủ
            </Button>
          ]}
        />
      </Card>
    </div>
  );
};

export default RejectionStatusPage;