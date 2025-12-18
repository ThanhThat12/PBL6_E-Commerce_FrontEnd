import React, { useState, useEffect } from 'react';
import { Search, Users, UserCheck, ShoppingBag, Receipt } from 'lucide-react';
import CustomerActions from './CustomerActions';
import CustomerDetailModal from './CustomerDetailModal';
import AddCustomerModal from './AddCustomerModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import Toast from '../common/Toast';
import { getCustomersByStatus, getCustomerDetail, getCustomerStats, deleteUser } from '../../../services/adminService';
import './CustomersTable.css';

const CustomersTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    totalRevenue: 0
  });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [_totalElements, setTotalElements] = useState(0); // eslint-disable-line no-unused-vars
  const [pageSize] = useState(10);

  // Fetch customers and stats from API
  useEffect(() => {
    fetchCustomers();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Re-fetch when page changes

  // Re-fetch when status filter changes
  useEffect(() => {
    setCurrentPage(0); // Reset to first page when filter changes
    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Map frontend filter to backend status
      // Frontend: 'All', 'Active', 'Inactive'
      // Backend: 'ALL', 'ACTIVE', 'INACTIVE'
      const backendStatus = statusFilter.toUpperCase();
      
      console.log(`📡 [CustomersTable] Fetching customers with status=${backendStatus}, page=${currentPage}, size=${pageSize}`);
      const response = await getCustomersByStatus(backendStatus, currentPage, pageSize);
      
      if (response.status === 200 && response.data) {
        // Response structure: ResponseDTO<Page<ListCustomerUserDTO>>
        const pageData = response.data;
        
        console.log('✅ [CustomersTable] Page data:', pageData);
        
        // Backend response: {content: [...], page: {totalPages, totalElements, size, number}}
        const paginationInfo = pageData.page || {};
        setTotalPages(paginationInfo.totalPages || 0);
        setTotalElements(paginationInfo.totalElements || 0);
        
        console.log('🔍 [DEBUG] paginationInfo:', paginationInfo);
        console.log('🔍 [DEBUG] totalPages:', paginationInfo.totalPages, 'totalElements:', paginationInfo.totalElements);
        
        // Set customers from content array
        const customersList = pageData.content || [];
        setCustomers(Array.isArray(customersList) ? customersList : []);
        
        console.log(`📊 [CustomersTable] Loaded ${customersList.length} customers with status ${backendStatus}, Total: ${paginationInfo.totalElements}, Pages: ${paginationInfo.totalPages}`);
      }
    } catch (err) {
      console.error('❌ [CustomersTable] Error fetching customers:', err);
      setError('Failed to load customers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 [CustomersTable] Fetching customer stats from API...');
      const response = await getCustomerStats();
      
      console.log('📦 [CustomersTable] Stats Response:', response);
      
      if (response.status === 200 && response.data) {
        console.log('✅ [CustomersTable] Stats loaded:', response.data);
        setStats(response.data);
      } else {
        console.warn('⚠️ [CustomersTable] Unexpected stats response:', response);
      }
    } catch (err) {
      console.error('❌ [CustomersTable] Error fetching stats:', err);
      // Don't set error state for stats - just log it
    }
  };
  
  // Format revenue display
  const formatRevenue = (revenue) => {
    if (revenue >= 1000000) {
      return `$${(revenue / 1000000).toFixed(1)}M`;
    } else if (revenue >= 1000) {
      return `$${(revenue / 1000).toFixed(1)}K`;
    } else {
      return `$${revenue.toFixed(0)}`;
    }
  };

  // Dữ liệu thống kê cho khách hàng từ API
  const statsData = [
    { 
      title: 'Total Customers', 
      value: stats.totalCustomers.toLocaleString(), 
      icon: <Users size={24} />, 
      color: 'blue',
    },
    { 
      title: 'Active Customers', 
      value: stats.activeCustomers.toLocaleString(), 
      icon: <UserCheck size={24} />, 
      color: 'green',
    },
    { 
      title: 'New This Month', 
      value: stats.newThisMonth.toLocaleString(), 
      icon: <ShoppingBag size={24} />, 
      color: 'yellow',
    },
    { 
      title: 'Total Revenue', 
      value: formatRevenue(stats.totalRevenue), 
      icon: <Receipt size={24} />, 
      color: 'purple',
    }
  ];
  

  // Status class helpers - kept for future use
  // eslint-disable-next-line no-unused-vars
  const _getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      default: return '';
    }
  };

  // eslint-disable-next-line no-unused-vars
  const _getStatusDot = (status) => {
    switch(status) {
      case 'Active': return '●';
      case 'Inactive': return '●';
      default: return '';
    }
  };

  // TODO: Implement API call for customer detail
  const handleView = async (customer) => {
    try {
      console.log('👁️ [CustomersTable] Fetching detail for customer ID:', customer.id);
      setLoading(true);
      
      const response = await getCustomerDetail(customer.id);
      
      console.log('📦 [CustomersTable] Customer detail response:', response);
      
      if (response.status === 200 && response.data) {
        console.log('✅ [CustomersTable] Customer detail loaded:', response.data);
        setSelectedCustomer(response.data);
        setShowModal(true);
      } else {
        console.warn('⚠️ [CustomersTable] Unexpected detail response:', response);
        alert('Failed to load customer detail');
      }
    } catch (err) {
      console.error('❌ [CustomersTable] Error loading customer detail:', err);
      alert('Failed to load customer detail: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (customer) => {
    console.log('🗑️ [CustomersTable] Opening delete confirmation for customer:', customer);
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    
    const customer = customerToDelete;
    const customerName = customer.username || customer.name || `Customer #${customer.id}`;
    
    try {
      setLoading(true);
      console.log('🗑️ [CustomersTable] Calling deleteUser API for customer ID:', customer.id);
      
      const response = await deleteUser(customer.id);
      
      if (response.status === 200) {
        console.log('✅ [CustomersTable] Customer deleted successfully:', response.message);
        
        // Show success toast instead of alert
        setToast({
          show: true,
          message: `Customer "${customerName}" has been removed from the system.`,
          type: 'success'
        });
        
        // Refresh customers list and stats after successful deletion
        await fetchCustomers();
        await fetchStats();
      }
    } catch (error) {
      console.error('❌ [CustomersTable] Error deleting customer:', error);
      
      // Show error toast instead of alert
      const errorMessage = error.message || 'Failed to delete customer. Please try again.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setCustomerToDelete(null);
    }
  };


  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const handleCustomerUpdate = async (updatedCustomer) => {
    try {
      console.log('🔄 Refreshing customer data after update...');
      
      // Re-fetch customer detail to update modal with latest data from API
      const detailResponse = await getCustomerDetail(updatedCustomer.id);
      if (detailResponse.status === 200 && detailResponse.data) {
        setSelectedCustomer(detailResponse.data);
      }
      
      // Refresh table data and stats
      await fetchCustomers();
      await fetchStats();
      
      console.log('✅ All customer data refreshed successfully');
    } catch (error) {
      console.error('❌ Error refreshing customer data:', error);
    }
  };

  // handleAddCustomer - used when Add Customer button is enabled
  // eslint-disable-next-line no-unused-vars
  const _handleAddCustomer = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleSubmitCustomer = (formData) => {
    console.log('New customer data:', formData);
    // TODO: Implement API call to create customer
    // After successful creation, refresh the customer list
  };

  return (
    <div>
      {/* Header Section */}
      <div className="customers-header">
        <div className="customers-title-section">
          <h1 className="customers-title">Customers Management</h1>
        </div>
        
        {/* Search and Filter */}
        <div className="customers-actions">
          <div className="customer-search-container">
            <Search className="customer-search-icon" size={20} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          {/* Status Filter Dropdown */}
          <div className="filter-container">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* <button className="add-customer-btn" onClick={handleAddCustomer}>
            <UserPlus size={20} />
            Add Customer
          </button> */}
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
      <div className="customers-table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading customers...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            <p>Error: {error}</p>
            <button onClick={fetchCustomers} style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No customers found</p>
          </div>
        ) : (
          <table className="customers-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Customer ID</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers
                .filter(customer => {
                  // Only apply search filter here - status filter is already applied by backend
                  const searchMatch = searchTerm === '' || 
                    (customer.username || customer.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (customer.phoneNumber || customer.phone)?.toLowerCase().includes(searchTerm.toLowerCase());
                  
                  return searchMatch;
                })
                .map((customer, index) => (
                  <tr key={customer.id || index} className="table-row">
                    <td className="customer-name">{customer.username || customer.name || 'N/A'}</td>
                    <td className="customer-id">#{customer.id}</td>
                    <td className="customer-email">{customer.email || 'N/A'}</td>
                    <td className="customer-phone">{customer.phoneNumber || customer.phone || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${(customer.activated !== undefined ? customer.activated : customer.status === 'Active') ? 'status-active' : 'status-inactive'}`}>
                        <span className="status-dot">●</span>
                        {(customer.activated !== undefined ? customer.activated : customer.status === 'Active') ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="action-cell">
                      <CustomerActions 
                        customer={customer}
                        onView={handleView}
                        onDelete={handleDelete}
                      />
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
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

      {/* Customer Detail Modal */}
      {showModal && selectedCustomer && (
        <CustomerDetailModal 
          customer={selectedCustomer}
          onClose={handleCloseModal}
          onUpdate={handleCustomerUpdate}
        />
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal 
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitCustomer}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCustomerToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Customer"
        userName={customerToDelete?.username || customerToDelete?.name || `Customer #${customerToDelete?.id}`}
        userType="customer"
        deletionDetails={[
          'Customer account',
          'Shopping cart and cart items',
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

export default CustomersTable;