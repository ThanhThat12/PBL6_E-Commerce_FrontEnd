import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiSearch, FiFilter, FiEye, FiCheck, FiX, FiClock, 
  FiUser, FiPhone, FiMail, FiMapPin, FiCamera, FiLoader,
  FiChevronLeft, FiChevronRight, FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import Layout from '../../../components/admin/layout/Layout';
import {
  searchPendingApplications,
  getPendingCount,
  getApplicationDetail,
  approveRegistration,
  rejectRegistration,
} from '../../../services/sellerRegistrationService';

// Default images from environment
const DEFAULT_AVATAR = process.env.REACT_APP_DEFAULT_AVATAR || 'https://res.cloudinary.com/dejjhkhl1/image/upload/v1764912002/default-avatar-icon-of-social-media-user-vector_moeijq.jpg';

/**
 * SellerRegistrationsPage - Admin page for managing seller registration applications
 * Features:
 * - List pending applications with search and pagination
 * - View application details with KYC images
 * - Approve or reject applications
 */
const SellerRegistrationsPage = () => {
  // State for list
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  
  // Search & Filter
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterStatus, setFilterStatus] = useState('PENDING');
  
  // Modal state
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Image preview
  const [previewImage, setPreviewImage] = useState(null);

  // Load pending count
  const loadPendingCount = useCallback(async () => {
    try {
      const response = await getPendingCount();
      setPendingCount(response?.data?.count || 0);
    } catch (error) {
      console.error('Error loading pending count:', error);
    }
  }, []);

  // Load applications
  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await searchPendingApplications({
        keyword: searchKeyword,
        status: filterStatus,
        page: currentPage,
        size: pageSize,
        sortBy: 'submittedAt',
        sortDirection: 'DESC',
      });
      
      const data = response?.data;
      if (data) {
        setApplications(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      // Check if it's a permission error (403)
      if (error?.type === 'permission' || error?.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập trang này');
      } else if (error?.type === 'auth' || error?.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      } else {
        toast.error('Không thể tải danh sách đơn đăng ký');
      }
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, filterStatus, currentPage, pageSize]);

  // Initial load
  useEffect(() => {
    loadPendingCount();
  }, [loadPendingCount]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    loadApplications();
  };

  // Handle view detail
  const handleViewDetail = async (shopId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const response = await getApplicationDetail(shopId);
      setSelectedApplication(response?.data);
    } catch (error) {
      console.error('Error loading application detail:', error);
      toast.error('Không thể tải chi tiết đơn đăng ký');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle approve
  const handleApprove = async () => {
    if (!selectedApplication) return;
    
    setActionLoading(true);
    try {
      await approveRegistration(selectedApplication.shopId);
      toast.success(`Đã duyệt đơn đăng ký của "${selectedApplication.shopName}"`);
      setShowApproveModal(false);
      setShowDetailModal(false);
      setSelectedApplication(null);
      loadApplications();
      loadPendingCount();
    } catch (error) {
      console.error('Error approving application:', error);
      toast.error(error?.message || 'Không thể duyệt đơn đăng ký');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!selectedApplication) return;
    
    if (!rejectReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    
    setActionLoading(true);
    try {
      await rejectRegistration(selectedApplication.shopId, rejectReason);
      toast.success(`Đã từ chối đơn đăng ký của "${selectedApplication.shopName}"`);
      setShowRejectModal(false);
      setShowDetailModal(false);
      setSelectedApplication(null);
      setRejectReason('');
      loadApplications();
      loadPendingCount();
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error(error?.message || 'Không thể từ chối đơn đăng ký');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FiClock className="w-3 h-3" /> Chờ duyệt
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FiCheck className="w-3 h-3" /> Đã duyệt
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FiX className="w-3 h-3" /> Từ chối
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Duyệt đăng ký Seller</h1>
            <p className="text-gray-600 mt-1">
              Quản lý các đơn đăng ký trở thành người bán
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {pendingCount} chờ duyệt
                </span>
              )}
            </p>
          </div>
          
          <button
            onClick={() => loadApplications()}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm theo tên shop, email, số điện thoại..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <FiFilter className="w-5 h-5 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(0);
                }}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="PENDING">Chờ duyệt</option>
                <option value="ACTIVE">Đã duyệt</option>
                <option value="REJECTED">Từ chối</option>
                <option value="">Tất cả</option>
              </select>
            </div>
            
            <button
              type="submit"
              className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <FiLoader className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Không có đơn đăng ký</h3>
              <p className="text-gray-500">
                {filterStatus === 'PENDING' 
                  ? 'Hiện không có đơn đăng ký nào đang chờ duyệt'
                  : 'Không tìm thấy đơn đăng ký phù hợp'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shop</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Liên hệ</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Địa chỉ</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ngày nộp</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applications.map((app) => (
                      <tr key={app.shopId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={app.logoUrl || DEFAULT_AVATAR}
                              alt={app.shopName}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                            />
                            <div>
                              <div className="font-medium text-gray-900">{app.shopName}</div>
                              <div className="text-sm text-gray-500">ID: {app.shopId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-900">
                              <FiPhone className="w-4 h-4 text-gray-400" />
                              {app.shopPhone || '-'}
                            </div>
                            <div className="flex items-center gap-1 text-gray-500 mt-1">
                              <FiMail className="w-4 h-4 text-gray-400" />
                              {app.shopEmail || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 max-w-xs truncate">
                            {app.provinceName || app.fullAddress || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(app.submittedAt || app.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleViewDetail(app.shopId)}
                              className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                              title="Xem chi tiết"
                            >
                              <FiEye className="w-5 h-5" />
                            </button>
                            {app.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setShowApproveModal(true);
                                  }}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Duyệt"
                                >
                                  <FiCheck className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedApplication(app);
                                    setShowRejectModal(true);
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Từ chối"
                                >
                                  <FiX className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Hiển thị {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalElements)} trên {totalElements} đơn
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => !detailLoading && setShowDetailModal(false)} />
              
              <div className="inline-block w-full max-w-4xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-2xl shadow-xl sm:my-8 sm:align-middle sm:p-6">
                {detailLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <FiLoader className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                ) : selectedApplication ? (
                  <>
                    {/* Modal Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">Chi tiết đơn đăng ký</h2>
                        <p className="text-gray-500 mt-1">Shop ID: {selectedApplication.shopId}</p>
                      </div>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                      >
                        <FiX className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Modal Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column - Shop Info */}
                      <div className="space-y-6">
                        {/* Shop Basic Info */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FiUser className="w-5 h-5 text-primary-500" />
                            Thông tin Shop
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tên shop:</span>
                              <span className="font-medium text-gray-900">{selectedApplication.shopName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">SĐT:</span>
                              <span className="font-medium text-gray-900">{selectedApplication.shopPhone || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium text-gray-900">{selectedApplication.shopEmail || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Trạng thái:</span>
                              {getStatusBadge(selectedApplication.status)}
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Ngày nộp:</span>
                              <span className="font-medium text-gray-900">{formatDate(selectedApplication.submittedAt || selectedApplication.createdAt)}</span>
                            </div>
                          </div>
                          {selectedApplication.description && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <span className="text-gray-600 text-sm">Mô tả:</span>
                              <p className="text-gray-900 mt-1">{selectedApplication.description}</p>
                            </div>
                          )}
                        </div>

                        {/* Address Info */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FiMapPin className="w-5 h-5 text-primary-500" />
                            Địa chỉ
                          </h3>
                          <div className="space-y-2 text-sm">
                            {selectedApplication.fullAddress && (
                              <p className="text-gray-900">{selectedApplication.fullAddress}</p>
                            )}
                            <p className="text-gray-600">
                              {[selectedApplication.wardName, selectedApplication.districtName, selectedApplication.provinceName]
                                .filter(Boolean).join(', ') || '-'}
                            </p>
                          </div>
                        </div>

                        {/* Owner Info */}
                        {selectedApplication.ownerName && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FiUser className="w-5 h-5 text-primary-500" />
                              Thông tin chủ shop
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Họ tên:</span>
                                <span className="font-medium text-gray-900">{selectedApplication.ownerName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium text-gray-900">{selectedApplication.ownerEmail}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">SĐT:</span>
                                <span className="font-medium text-gray-900">{selectedApplication.ownerPhone || '-'}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column - KYC Info */}
                      <div className="space-y-6">
                        {/* KYC Info */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <FiCamera className="w-5 h-5 text-primary-500" />
                            Xác thực KYC
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Số CMND/CCCD:</span>
                              <span className="font-medium text-gray-900">{selectedApplication.idCardNumber || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Họ tên trên CMND:</span>
                              <span className="font-medium text-gray-900">{selectedApplication.idCardName || '-'}</span>
                            </div>
                          </div>
                        </div>

                        {/* KYC Images */}
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-900 mb-3">Ảnh KYC</h3>
                          <div className="grid grid-cols-2 gap-3">
                            {/* ID Front */}
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Mặt trước CMND/CCCD</p>
                              {selectedApplication.idCardFrontUrl ? (
                                <img
                                  src={selectedApplication.idCardFrontUrl}
                                  alt="ID Front"
                                  className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                                  onClick={() => setPreviewImage(selectedApplication.idCardFrontUrl)}
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                  Chưa có
                                </div>
                              )}
                            </div>
                            
                            {/* ID Back */}
                            <div>
                              <p className="text-xs text-gray-600 mb-1">Mặt sau CMND/CCCD</p>
                              {selectedApplication.idCardBackUrl ? (
                                <img
                                  src={selectedApplication.idCardBackUrl}
                                  alt="ID Back"
                                  className="w-full h-24 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                                  onClick={() => setPreviewImage(selectedApplication.idCardBackUrl)}
                                />
                              ) : (
                                <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                  Chưa có
                                </div>
                              )}
                            </div>
                            
                            {/* Selfie */}
                            <div className="col-span-2">
                              <p className="text-xs text-gray-600 mb-1">Ảnh selfie với CMND/CCCD</p>
                              {selectedApplication.selfieWithIdUrl ? (
                                <img
                                  src={selectedApplication.selfieWithIdUrl}
                                  alt="Selfie"
                                  className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90"
                                  onClick={() => setPreviewImage(selectedApplication.selfieWithIdUrl)}
                                />
                              ) : (
                                <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                  Chưa có (tùy chọn)
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Rejection Reason (if rejected) */}
                        {selectedApplication.status === 'REJECTED' && selectedApplication.rejectionReason && (
                          <div className="bg-red-50 rounded-xl p-4">
                            <h3 className="font-semibold text-red-800 mb-2">Lý do từ chối</h3>
                            <p className="text-red-700">{selectedApplication.rejectionReason}</p>
                            {selectedApplication.reviewedAt && (
                              <p className="text-red-600 text-sm mt-2">
                                Từ chối lúc: {formatDate(selectedApplication.reviewedAt)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Modal Actions */}
                    {selectedApplication.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setShowDetailModal(false)}
                          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Đóng
                        </button>
                        <button
                          onClick={() => setShowRejectModal(true)}
                          className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <FiX className="w-4 h-4 inline mr-1" />
                          Từ chối
                        </button>
                        <button
                          onClick={() => setShowApproveModal(true)}
                          className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <FiCheck className="w-4 h-4 inline mr-1" />
                          Duyệt đơn
                        </button>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Approve Confirmation Modal */}
        {showApproveModal && selectedApplication && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => !actionLoading && setShowApproveModal(false)} />
              
              <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận duyệt đơn</h3>
                  <p className="text-gray-600 mb-6">
                    Bạn có chắc muốn duyệt đơn đăng ký của shop "{selectedApplication.shopName}"?
                    <br />
                    <span className="text-sm text-gray-500">
                      Người dùng sẽ được cấp quyền SELLER và có thể bắt đầu bán hàng.
                    </span>
                  </p>
                  
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setShowApproveModal(false)}
                      disabled={actionLoading}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading && <FiLoader className="w-4 h-4 animate-spin" />}
                      Xác nhận duyệt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && selectedApplication && (
          <div className="fixed inset-0 z-[60] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4">
              <div className="fixed inset-0 transition-opacity bg-black bg-opacity-50" onClick={() => !actionLoading && setShowRejectModal(false)} />
              
              <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiX className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Từ chối đơn đăng ký</h3>
                  <p className="text-gray-600">
                    Shop "{selectedApplication.shopName}"
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do từ chối <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối đơn đăng ký..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                    }}
                    disabled={actionLoading}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading && <FiLoader className="w-4 h-4 animate-spin" />}
                    Xác nhận từ chối
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Image Preview Modal */}
        {previewImage && (
          <div 
            className="fixed inset-0 z-[70] bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              onClick={() => setPreviewImage(null)}
            >
              <FiX className="w-8 h-8" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SellerRegistrationsPage;
