import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiClock, FiCheck, FiX, FiRefreshCw, FiShoppingBag as FiStore, 
  FiCalendar, FiAlertCircle, FiArrowRight
} from 'react-icons/fi';
import { useAuth } from '../../hooks/useAuth';
import { getRegistrationStatus, cancelRejectedApplication } from '../../services/sellerRegistrationService';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';

/**
 * RegistrationStatusPage
 * Hiển thị trạng thái đơn đăng ký seller
 */
const RegistrationStatusPage = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [canceling, setCanceling] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await getRegistrationStatus();
        setStatus(response?.data);
      } catch (error) {
        console.error('Error fetching status:', error);
        // No application found
        setStatus(null);
      } finally {
        setLoading(false);
      }
    };

    if (user && !hasRole('SELLER')) {
      fetchStatus();
    } else {
      setLoading(false);
    }
  }, [user, hasRole]);

  const handleCancelAndResubmit = async () => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn đăng ký hiện tại để đăng ký lại?')) {
      return;
    }

    setCanceling(true);
    try {
      await cancelRejectedApplication();
      toast.success('Đã hủy đơn đăng ký. Bạn có thể đăng ký lại.');
      navigate('/seller/register');
    } catch (error) {
      console.error('Error canceling:', error);
      toast.error('Không thể hủy đơn đăng ký');
    } finally {
      setCanceling(false);
    }
  };

  const getStatusConfig = () => {
    switch (status?.status) {
      case 'PENDING':
        return {
          icon: FiClock,
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          title: 'Đang chờ xét duyệt',
          description: 'Đơn đăng ký của bạn đang được xem xét. Chúng tôi sẽ thông báo kết quả sớm nhất.',
          badgeColor: 'bg-yellow-100 text-yellow-800',
        };
      case 'REJECTED':
        return {
          icon: FiX,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          title: 'Đơn bị từ chối',
          description: 'Rất tiếc, đơn đăng ký của bạn không được chấp nhận.',
          badgeColor: 'bg-red-100 text-red-800',
        };
      case 'ACTIVE':
        return {
          icon: FiCheck,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          title: 'Đã được duyệt',
          description: 'Chúc mừng! Bạn đã trở thành người bán trên SportZone.',
          badgeColor: 'bg-green-100 text-green-800',
        };
      default:
        return {
          icon: FiAlertCircle,
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
          title: 'Không tìm thấy',
          description: 'Không tìm thấy đơn đăng ký nào.',
          badgeColor: 'bg-gray-100 text-gray-800',
        };
    }
  };

  // If user is already seller
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
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
            >
              Vào Kênh Người bán
              <FiArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FiRefreshCw className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No application found
  if (!status) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiStore className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn đăng ký</h2>
            <p className="text-gray-600 mb-6">
              Bạn chưa đăng ký trở thành người bán. Hãy bắt đầu ngay!
            </p>
            <button
              onClick={() => navigate('/seller/register')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Đăng ký bán hàng
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className={`p-6 ${config.iconBg}`}>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md`}>
                  <StatusIcon className={`w-8 h-8 ${config.iconColor}`} />
                </div>
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.badgeColor} mb-2`}>
                    {status.statusDescription}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-6">{config.description}</p>

              {/* Rejection Reason */}
              {status.status === 'REJECTED' && status.rejectionReason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5" />
                    Lý do từ chối
                  </h3>
                  <p className="text-red-700">{status.rejectionReason}</p>
                </div>
              )}

              {/* Application Details */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thông tin đơn đăng ký</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FiStore className="w-4 h-4" />
                      Tên shop
                    </span>
                    <span className="font-medium text-gray-900">{status.shopName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center gap-2">
                      <FiCalendar className="w-4 h-4" />
                      Ngày nộp đơn
                    </span>
                    <span className="font-medium text-gray-900">
                      {status.submittedAt 
                        ? new Date(status.submittedAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '-'}
                    </span>
                  </div>
                  {status.reviewedAt && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center gap-2">
                        <FiCheck className="w-4 h-4" />
                        Ngày xét duyệt
                      </span>
                      <span className="font-medium text-gray-900">
                        {new Date(status.reviewedAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {status.shopPhone && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Điện thoại</span>
                      <span className="font-medium text-gray-900">{status.shopPhone}</span>
                    </div>
                  )}
                  {status.shopEmail && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium text-gray-900">{status.shopEmail}</span>
                    </div>
                  )}
                  {status.idCardNumberMasked && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">CMND/CCCD</span>
                      <span className="font-medium text-gray-900">{status.idCardNumberMasked}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {status.status === 'REJECTED' && (
                  <button
                    onClick={handleCancelAndResubmit}
                    disabled={canceling}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {canceling ? (
                      <>
                        <FiRefreshCw className="w-5 h-5 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FiRefreshCw className="w-5 h-5" />
                        Đăng ký lại
                      </>
                    )}
                  </button>
                )}
                {status.status === 'ACTIVE' && (
                  <button
                    onClick={() => navigate('/seller/dashboard')}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  >
                    Vào Kênh Người bán
                    <FiArrowRight className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Về Trang chủ
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegistrationStatusPage;
