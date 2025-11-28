import React, { useState, useEffect } from 'react';
import { Plus, Search, Ticket, CheckCircle, Calendar, TrendingUp, Tags } from 'lucide-react';
import { getVouchers, getVoucherStats, deleteVoucher, getVouchersByStatus } from '../../../services/adminVoucherService';
import VoucherActions from './VoucherActions';
import VoucherDetailModal from './VoucherDetailModal';
import AddVoucherModal from './AddVoucherModal';
import VoucherFilters from './VoucherFilters';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import Toast from '../common/Toast';
import './VouchersTable.css';

const VouchersTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [voucherToDelete, setVoucherToDelete] = useState(null);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [stats, setStats] = useState({
    totalVouchers: 0,
    activeVouchers: 0,
    expiredVouchers: 0,
    usedVouchers: 0
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Mock data for development
  const mockVouchers = [
    {
      id: 1,
      code: 'SUMMER2024',
      discountAmount: 50000,
      discountType: 'FIXED', // FIXED or PERCENTAGE
      minOrderValue: 200000,
      quantity: 100,
      usedCount: 45,
      status: 'ACTIVE',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      description: 'Summer sale voucher'
    },
    {
      id: 2,
      code: 'NEWUSER10',
      discountAmount: 10,
      discountType: 'PERCENTAGE',
      minOrderValue: 100000,
      quantity: 500,
      usedCount: 230,
      status: 'ACTIVE',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      description: 'New user discount'
    },
    {
      id: 3,
      code: 'FLASH50',
      discountAmount: 50000,
      discountType: 'FIXED',
      minOrderValue: 300000,
      quantity: 50,
      usedCount: 50,
      status: 'EXPIRED',
      startDate: '2024-05-01',
      endDate: '2024-05-15',
      description: 'Flash sale voucher'
    },
    {
      id: 4,
      code: 'WELCOME20',
      discountAmount: 20,
      discountType: 'PERCENTAGE',
      minOrderValue: 150000,
      quantity: 200,
      usedCount: 0,
      status: 'INACTIVE',
      startDate: '2024-09-01',
      endDate: '2024-12-31',
      description: 'Welcome bonus'
    },
  ];

  // Fetch vouchers from API
  useEffect(() => {
    fetchVouchersData();
    fetchStatsData();
  }, [currentPage]); // Re-fetch when page changes

  const fetchVouchersData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📡 [VouchersTable] Fetching vouchers page ${currentPage}, size ${pageSize}...`);
      
      const response = await getVouchers(currentPage, pageSize);
      
      console.log('🔍 [VouchersTable] Full API response:', response);
      
      if (response.status === 200 && response.data) {
        // Backend returns ResponseDTO<Page<AdminVoucherListDTO>>
        // Structure: { status: 200, data: { content: [], page: { totalPages: 3, totalElements: 24 } } }
        const pageData = response.data;
        const paginationInfo = pageData.page || {};
        
        console.log('✅ [VouchersTable] Page data:', pageData);
        console.log('📄 [VouchersTable] totalPages:', paginationInfo.totalPages);
        console.log('📄 [VouchersTable] totalElements:', paginationInfo.totalElements);
        console.log('📄 [VouchersTable] size:', paginationInfo.size);
        console.log('📄 [VouchersTable] number (current page):', paginationInfo.number);
        console.log('📄 [VouchersTable] content length:', pageData.content?.length);
        
        // Extract pagination info from Spring Page object
        const pages = paginationInfo.totalPages || 1;
        const elements = paginationInfo.totalElements || 0;
        
        setTotalPages(pages);
        setTotalElements(elements);
        
        // Extract vouchers list
        const vouchersList = pageData.content || [];
        setVouchers(vouchersList);
        
        console.log(`📊 [VouchersTable] Successfully loaded ${vouchersList.length} vouchers`);
        console.log(`📊 [VouchersTable] Pagination: Page ${currentPage + 1}/${pages}, Total items: ${elements}`);
        console.log('🔍 [VouchersTable] First voucher sample:', vouchersList[0]);
      }
      setLoading(false);
    } catch (err) {
      console.error('❌ [VouchersTable] Error fetching vouchers:', err);
      setError('Failed to load vouchers. Please try again later.');
      setLoading(false);
    }
  };

  const fetchStatsData = async () => {
    try {
      console.log('📊 [VouchersTable] Fetching voucher stats...');
      const response = await getVoucherStats();
      
      if (response.status === 200 && response.data) {
        console.log('✅ [VouchersTable] Stats loaded:', response.data);
        setStats({
          totalVouchers: response.data.totalVouchers || 0,
          activeVouchers: response.data.activeVouchers || 0,
          expiredVouchers: response.data.expiredVouchers || 0,
          usedVouchers: response.data.usedVouchers || 0
        });
      }
    } catch (err) {
      console.error('❌ [VouchersTable] Error fetching stats:', err);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Format discount display
  const formatDiscount = (voucher) => {
    if (voucher.discountType === 'PERCENTAGE') {
      return `${voucher.discountValue}%`;
    } else {
      return formatCurrency(voucher.discountValue);
    }
  };

  // Stats data
  const statsData = [
    {
      title: 'Total Vouchers',
      value: stats.totalVouchers.toLocaleString(),
      icon: <Ticket size={24} />,
      color: 'blue',
    },
    {
      title: 'Active Vouchers',
      value: stats.activeVouchers.toLocaleString(),
      icon: <CheckCircle size={24} />,
      color: 'green',
    },
    {
      title: 'Expired Vouchers',
      value: stats.expiredVouchers.toLocaleString(),
      icon: <Calendar size={24} />,
      color: 'yellow',
    },
    {
      title: 'Used Vouchers',
      value: stats.usedVouchers.toLocaleString(),
      icon: <TrendingUp size={24} />,
      color: 'purple',
    }
  ];

  // Handle actions
  const handleViewDetail = (voucher) => {
    console.log('👁️ [VouchersTable] View voucher:', voucher);
    console.log('👁️ [VouchersTable] Voucher ID:', voucher.id);
    setSelectedVoucher(voucher);
    setShowDetailModal(true);
  };

  const handleUpdateVoucher = async (updatedData) => {
    try {
      console.log('🔄 [VouchersTable] Voucher updated, refreshing data...');
      
      // Refresh vouchers list and stats
      await fetchVouchersData();
      await fetchStatsData();
      
      console.log('✅ [VouchersTable] Data refreshed after update');
    } catch (error) {
      console.error('❌ [VouchersTable] Error refreshing data:', error);
    }
  };

  const handleDelete = (voucher) => {
    console.log('🗑️ [VouchersTable] Delete voucher:', voucher.code);
    setVoucherToDelete(voucher);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!voucherToDelete) return;

    try {
      console.log('🗑️ [VouchersTable] Deleting voucher ID:', voucherToDelete.id);
      
      const response = await deleteVoucher(voucherToDelete.id);
      
      if (response.status === 200) {
        console.log('✅ [VouchersTable] Voucher deleted successfully');
        setToast({
          show: true,
          message: `Voucher "${voucherToDelete.code}" has been deleted successfully.`,
          type: 'success'
        });
        
        // Refresh data
        await fetchVouchersData();
        await fetchStatsData();
      }
    } catch (error) {
      console.error('❌ [VouchersTable] Error deleting voucher:', error);
      setToast({
        show: true,
        message: error.message || 'Failed to delete voucher. Please try again.',
        type: 'error'
      });
    } finally {
      setShowDeleteModal(false);
      setVoucherToDelete(null);
    }
  };

  const handleAddVoucher = () => {
    console.log('➥ [VouchersTable] Open add voucher modal');
    setShowAddModal(true);
  };

  const handleAddVoucherSubmit = async (voucherData) => {
    console.log('➥ [VouchersTable] Voucher added, refreshing data...');
    
    // Refresh vouchers list and stats after successful creation
    await fetchVouchersData();
    await fetchStatsData();
    
    setToast({
      show: true,
      message: `Voucher "${voucherData.code}" has been created successfully.`,
      type: 'success'
    });
  };

  // Filter vouchers by search term only
  const filteredVouchers = vouchers.filter(voucher => {
    if (!searchTerm) return true;
    return voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle status filter change
  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'admin-vouchers-status-badge admin-vouchers-status-active';
      case 'EXPIRED':
        return 'admin-vouchers-status-badge admin-vouchers-status-expired';
      case 'UPCOMING':
        return 'admin-vouchers-status-badge admin-vouchers-status-upcoming';
      case 'INACTIVE':
        return 'admin-vouchers-status-badge admin-vouchers-status-inactive';
      default:
        return 'admin-vouchers-status-badge';
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="admin-vouchers-header">
        <div className="admin-vouchers-title-section">
          <h1 className="admin-vouchers-title">Vouchers Management</h1>
        </div>

        <div className="admin-vouchers-actions">
          <div className="admin-vouchers-search-container">
            <Search className="admin-vouchers-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search vouchers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-vouchers-search-input"
            />
          </div>



          <button className="admin-vouchers-add-btn" onClick={handleAddVoucher}>
            <Plus size={18} />
            Add Voucher
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-vouchers-stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className={`admin-vouchers-stat-card admin-vouchers-stat-${stat.color}`}>
            <div className="admin-vouchers-stat-icon">
              {stat.icon}
            </div>
            <div className="admin-vouchers-stat-content">
              <p className="admin-vouchers-stat-label">{stat.title}</p>
              <p className="admin-vouchers-stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Vouchers Table */}
      <div className="admin-vouchers-table-container">
        {loading ? (
          <div className="admin-vouchers-loading-state">
            <div className="admin-vouchers-loading-spinner"></div>
            <p>Loading vouchers...</p>
          </div>
        ) : error ? (
          <div className="admin-vouchers-error-state">
            <p>{error}</p>
            <button onClick={() => { setLoading(true); setError(null); fetchVouchersData(); }}>
              Try Again
            </button>
          </div>
        ) : (
          <table className="admin-vouchers-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount Type</th>
                <th>Discount Value</th>
                <th>Min Order Value</th>
                <th>Usage Limit</th>
                <th>Used Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher, index) => (
                  <tr key={`${voucher.code}-${index}`}>
                    <td>
                      <div className="admin-vouchers-code-cell">
                        <Tags size={16} className="admin-vouchers-icon" />
                        <span className="admin-vouchers-code">{voucher.code}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-vouchers-type-badge ${
                        voucher.discountType === 'PERCENTAGE' 
                          ? 'admin-vouchers-type-percentage' 
                          : 'admin-vouchers-type-fixed'
                      }`}>
                        {voucher.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed Amount'}
                      </span>
                    </td>
                    <td className="admin-vouchers-discount-cell">{formatDiscount(voucher)}</td>
                    <td>{formatCurrency(voucher.minOrderValue)}</td>
                    <td>
                      <span className="admin-vouchers-quantity-badge">{voucher.usageLimit}</span>
                    </td>
                    <td>
                      <span className="admin-vouchers-used-badge">{voucher.usedCount}</span>
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(voucher.status)}>
                        {voucher.status}
                      </span>
                    </td>
                    <td className="admin-vouchers-action-cell">
                      <VoucherActions
                        voucher={voucher}
                        onView={handleViewDetail}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="admin-vouchers-empty-state-row">
                    <div className="admin-vouchers-empty-state">
                      <Tags size={48} />
                      <h3>No vouchers found</h3>
                      <p>Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

       {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          <button 
            className="pagination-nav"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0 || loading}
          >
            <span>← Previous</span>
          </button>
        </div>
        
        <div className="pagination-numbers">
          {totalPages > 0 ? (
            [...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                className={`page-btn ${currentPage === index ? 'active' : ''}`}
                onClick={() => setCurrentPage(index)}
                disabled={loading}
              >
                {index + 1}
              </button>
            ))
          ) : (
            <button className="page-btn active" disabled>
              1
            </button>
          )}
        </div>
        
        <div className="pagination-info">
          <span style={{ marginRight: '12px', color: '#64748b', fontSize: '14px' }}>
            Page {currentPage + 1} of {totalPages || 1} | Total: {totalElements} vouchers
          </span>
          <button 
            className="pagination-nav"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1 || loading}
          >
            <span>Next →</span>
          </button>
        </div>
      </div>

      {/* Voucher Detail Modal */}
      {showDetailModal && selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedVoucher(null);
          }}
        />
      )}

      {/* Add Voucher Modal */}
      {showAddModal && (
        <AddVoucherModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddVoucherSubmit}
        />
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete Voucher"
        userName={voucherToDelete?.code}
        userType="voucher"
        deletionDetails={[
          `Discount: ${voucherToDelete ? formatDiscount(voucherToDelete) : ''}`,
          `Used: ${voucherToDelete?.usedCount || 0} times`,
          "This action cannot be undone"
        ]}
      />

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        duration={3000}
      />
    </div>
  );
};

export default VouchersTable;
