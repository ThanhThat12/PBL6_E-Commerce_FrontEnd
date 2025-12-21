import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Users, CheckCircle, Clock, XCircle } from 'lucide-react';
import SellerDetailModal from './SellerDetailModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import Toast from '../common/Toast';
import { getSellerStats, getSellerDetail, getSellersFromShop, deleteUser } from '../../../services/adminService';
import './SellersTable.css';

const SellersTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sellerToDelete, setSellerToDelete] = useState(null);
  const [sellersData, setSellersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [statsData, setStatsData] = useState([
    { title: 'Total Sellers', value: '0', icon: <Users size={24} />, color: 'indigo' },
    { title: 'Active', value: '0', icon: <CheckCircle size={24} />, color: 'green' },
    { title: 'Pending', value: '0', icon: <Clock size={24} />, color: 'yellow' },
    { title: 'Inactive', value: '0', icon: <XCircle size={24} />, color: 'red' }
  ]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // Fetch sellers and stats from API
  useEffect(() => {
    fetchSellers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Re-fetch when page changes

  // Re-fetch when status filter changes (reset to first page)
  useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0); // Reset to first page when filter changes
    } else {
      fetchSellers(); // If already on page 0, just refetch
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      console.log('📊 Fetching seller stats...');
      const response = await getSellerStats();
      console.log('📊 Stats response:', response);
      
      if (response.status === 200 && response.data) {
        const stats = response.data;
        console.log('📊 Stats data:', stats);
        
        setStatsData([
          { 
            title: 'Total Sellers', 
            value: (stats.totalSellers || 0).toString(), 
            icon: <Users size={24} />, 
            color: 'indigo' 
          },
          { 
            title: 'Active', 
            value: (stats.activeSellers || 0).toString(), 
            icon: <CheckCircle size={24} />, 
            color: 'green' 
          },
          { 
            title: 'Pending', 
            value: (stats.pendingSellers || 0).toString(), 
            icon: <Clock size={24} />, 
            color: 'yellow' 
          },
          { 
            title: 'Inactive', 
            value: (stats.inactiveSellers || 0).toString(), 
            icon: <XCircle size={24} />, 
            color: 'red' 
          }
        ]);
        
        console.log('✅ Stats updated successfully');
      } else {
        console.warn('⚠️ Invalid stats response:', response);
      }
    } catch (err) {
      console.error('❌ Error fetching seller stats:', err);
    }
  };



  const fetchSellers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📡 [SellersTable] Fetching sellers from shop table, page ${currentPage}, size ${pageSize}...`);
      
      // Sử dụng API mới lấy tất cả sellers từ bảng shop
      const response = await getSellersFromShop(currentPage, pageSize);
      
      if (response.status === 200 && response.data) {
        // Response structure: ResponseDTO<Page<ListSellerUserDTO>>
        const pageData = response.data;
        
        console.log('✅ [SellersTable] Page data:', pageData);
        
        // Backend trả về structure: {content: [], page: {totalPages, totalElements, size, number}}
        const paginationInfo = pageData.page || {};
        setTotalPages(paginationInfo.totalPages || 0);
        setTotalElements(paginationInfo.totalElements || 0);
        
        console.log('🔍 [DEBUG] paginationInfo:', paginationInfo);
        
        // Set sellers from content array
        const sellersList = pageData.content || [];
        
        // Map API response to component state
        const mappedSellers = (Array.isArray(sellersList) ? sellersList : []).map(seller => ({
          id: seller.id,
          name: seller.shopName || seller.username || 'N/A',
          email: seller.email || 'N/A',
          phone: seller.phoneNumber || 'N/A',
          avatar: seller.avatar || 'https://via.placeholder.com/40',
          status: seller.status || 'Pending',
          products: seller.totalProducts || 0,
          sales: seller.revenue 
            ? `${seller.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })} VND` 
            : '0 VND',
          shopName: seller.shopName || 'No Shop',
          shopId: seller.shopId || null
        }));
        
        setSellersData(mappedSellers);
        console.log(`📊 [SellersTable] Loaded ${mappedSellers.length} sellers from shop table, Total: ${paginationInfo.totalElements}, Pages: ${paginationInfo.totalPages}`);
      } else {
        console.warn('⚠️ [SellersTable] Unexpected response format:', response);
        setSellersData([]);
      }
    } catch (err) {
      console.error('❌ [SellersTable] Error fetching sellers:', err);
      setError('Failed to load sellers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // _formatCurrency - kept for future use
  // eslint-disable-next-line no-unused-vars
  // eslint-disable-next-line no-unused-vars
  const _formatCurrency = (amount) => {
    if (!amount) return '0';
    return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
  };

  const getStatusClass = (status) => {
    const upperStatus = status?.toUpperCase();
    switch(upperStatus) {
      case 'ACTIVE': return 'status-active';
      case 'PENDING': return 'status-pending';
      case 'INACTIVE': return 'status-inactive';
      case 'REJECTED': return 'status-rejected';
      case 'SUSPENDED': return 'status-suspended';
      case 'CLOSED': return 'status-closed';
      default: return 'status-pending';
    }
  };

  const getStatusDisplay = (status) => {
    // Convert ACTIVE -> Active, PENDING -> Pending, INACTIVE -> Inactive
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getStatusDot = (status) => {
    return '●';
  };

  const handleViewDetails = async (seller) => {
    try {
      console.log('🔍 Viewing details for seller:', seller);
      
      if (!seller.id) {
        console.error('❌ Seller ID is missing:', seller);
        alert('Cannot view details: Seller ID is missing');
        return;
      }
      
      // Fetch detailed seller information from API
      const response = await getSellerDetail(seller.id);
      
      if (response.status === 200 && response.data) {
        const detailData = response.data;
        console.log('📊 Seller detail data from API:', detailData);
        
        // Transform API data to match modal format
        const transformedSeller = {
          id: detailData.id,
          name: detailData.shopName || seller.name,
          owner: detailData.fullName || 'N/A',
          username: detailData.username || 'N/A',
          email: detailData.email || seller.email,
          phone: detailData.phoneNumber || seller.phone,
          address: detailData.shopAddress || 'Not provided',
          shopDescription: detailData.shopDescription || 'No description available',
          status: detailData.shopStatus || seller.status,
          joinDate: detailData.createdAt || seller.joinDate,
          products: detailData.totalProductsSeller || seller.products,
          totalSales: detailData.totalRevenue || seller.totalSales,
          avatar: detailData.avatar || seller.avatar
        };
        
        console.log('✅ Transformed seller detail:', transformedSeller);
        setSelectedSeller(transformedSeller);
        setShowModal(true);
      } else {
        alert('Failed to load seller details');
      }
    } catch (error) {
      console.error('Error fetching seller details:', error);
      alert('Failed to load seller details. Please try again.');
    }
  };

  const handleUpdateSeller = async (sellerId, updatedData) => {
    try {
      console.log('🔄 Refreshing seller data after update...');
      
      // Re-fetch sellers list to update table
      await fetchSellers();
      
      // Re-fetch stats to update counts
      await fetchStats();
      
      // Re-fetch seller detail to update modal (but pass via callback, not setState)
      const detailResponse = await getSellerDetail(sellerId);
      if (detailResponse.status === 200 && detailResponse.data) {
        const detailData = detailResponse.data;
        const transformedSeller = {
          id: detailData.id,
          name: detailData.shopName,
          owner: detailData.fullName || 'N/A',
          username: detailData.username || 'N/A',
          email: detailData.email,
          phone: detailData.phoneNumber,
          address: detailData.shopAddress || 'Not provided',
          shopDescription: detailData.shopDescription || 'No description available',
          status: detailData.shopStatus,
          joinDate: detailData.createdAt,
          products: detailData.totalProductsSeller,
          totalSales: detailData.totalRevenue,
          avatar: detailData.avatar
        };
        
        // Update selected seller to refresh modal content smoothly
        setSelectedSeller(prev => ({
          ...prev,
          ...transformedSeller
        }));
      }
      
      console.log('✅ All data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing seller data:', error);
    }
  };

  const handleDelete = (seller) => {
    console.log('🗑️ [SellersTable] Opening delete confirmation for seller:', seller);
    setSellerToDelete(seller);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!sellerToDelete) return;
    
    const seller = sellerToDelete;
    const sellerName = seller.name || `Seller #${seller.id}`;
    
    try {
      setLoading(true);
      console.log('🗑️ [SellersTable] Calling deleteUser API for seller ID:', seller.id);
      
      const response = await deleteUser(seller.id);
      
      if (response.status === 200) {
        console.log('✅ [SellersTable] Seller deleted successfully:', response.message);
        
        // Show success toast instead of alert
        setToast({
          show: true,
          message: `Seller "${sellerName}" and all related data have been removed from the system.`,
          type: 'success'
        });
        
        // Refresh sellers list and stats after successful deletion
        await fetchSellers();
        await fetchStats();
      }
    } catch (error) {
      console.error('❌ [SellersTable] Error deleting seller:', error);
      
      // Show error toast instead of alert
      const errorMessage = error.message || 'Failed to delete seller. Please try again.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setSellerToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSeller(null);
  };

  // Filter sellers based on search and status
  const filteredSellers = sellersData.filter(seller => {
    // Search filter
    const matchesSearch = seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         seller.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter (client-side since API doesn't support it yet)
    const upperStatus = seller.status?.toUpperCase();
    const matchesStatus = statusFilter === 'All' || 
                         statusFilter.toUpperCase() === upperStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading sellers...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchSellers} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="sellers-header">
        <div className="sellers-title-section">
          <h1 className="sellers-title">Sellers Management</h1>
        </div>
        
        {/* Actions */}
        <div className="sellers-actions">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Status Filter */}
          <div className="filter-container">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="All">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          
          <div className="action-buttons">
            <button className="approve-btn">
              <CheckCircle size={18} />
              Approve Pending
            </button>
            {/* <button className="export-btn">
              <TrendingUp size={18} />
              Export Report
            </button> */}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.title}</p>
              <p className="stat-value">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="sellers-table-container">
        <table className="sellers-table">
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Products</th>
              <th>Revenue</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-results">
                  <div className="no-results-content">
                    <p>No sellers found</p>
                    <span>Try adjusting your search or filter criteria</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSellers.map((seller, index) => (
                <tr key={index} className="table-row">

                <td className="seller-info">
                  <div className="seller-avatar-container">
                    {/* <img 
                      src={seller.avatar} 
                      className="seller-avatar"
                    /> */}
                    <div className="seller-details">
                      <div className="seller-name">{seller.name}</div>
                    </div>
                  </div>
                </td>

                <td className="seller-contact">
                  <div className="contact-email">{seller.email}</div>
                  <div className="contact-phone">{seller.phone}</div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(seller.status)}`}>
                    <span className="status-dot">{getStatusDot(seller.status)}</span>
                    {getStatusDisplay(seller.status)}
                  </span>
                </td>
                <td className="seller-products">
                  <span className="products-count">{seller.products}</span>
                </td>
                <td className="seller-revenue">
                  <span className="revenue-amount">{seller.sales}</span>
                </td>

                <td className="action-cell">
                  <div className="customer-actions seller-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={(e) => { e.stopPropagation(); handleViewDetails(seller); }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDelete(seller); }}
                      title="Delete Seller"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
                
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="pagination-container">
        <div className="pagination-info">
          <button 
            className="pagination-nav"
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            <span>← Previous</span>
          </button>
        </div>
        
        <div className="pagination-numbers">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`page-btn ${currentPage === index ? 'active' : ''}`}
              onClick={() => setCurrentPage(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
        
        <div className="pagination-info">
          <button 
            className="pagination-nav"
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
          >
            <span>Next →</span>
          </button>
        </div>
      </div>

      {/* Seller Detail Modal */}
      {showModal && (
        <SellerDetailModal 
          seller={selectedSeller}
          onClose={handleCloseModal}
          onUpdate={handleUpdateSeller}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSellerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Seller"
        userName={sellerToDelete?.name || `Seller #${sellerToDelete?.id}`}
        userType="seller"
        deletionDetails={[
          'Seller account',
          'Shop information',
          `All products (${sellerToDelete?.products || 0} products)`,
          'All shop vouchers',
          'All addresses',
          'Verification codes'
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

export default SellersTable;