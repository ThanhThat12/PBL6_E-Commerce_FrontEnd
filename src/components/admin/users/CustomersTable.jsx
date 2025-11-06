import React, { useState, useEffect } from 'react';
import { UserPlus , Search, Filter, Users, UserCheck, Star, Package, TrendingUp, ShoppingBag, Receipt } from 'lucide-react';
import CustomerActions from './CustomerActions';
import CustomerDetailModal from './CustomerDetailModal';
import AddCustomerModal from './AddCustomerModal';
import { getCustomers, getCustomerDetail, getCustomerStats } from '../../../services/adminService';
import './CustomersTable.css';

const CustomersTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    newThisMonth: 0,
    totalRevenue: 0
  });

  // Fetch customers and stats from API
  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 [CustomersTable] Fetching customers from API...');
      const response = await getCustomers();
      
      console.log('📦 [CustomersTable] Full API Response:', response);
      console.log('📦 [CustomersTable] Response status:', response.status);
      console.log('📦 [CustomersTable] Response data:', response.data);
      
      if (response.status === 200 && response.data) {
        console.log('✅ [CustomersTable] Customers loaded:', response.data.length, 'customers');
        console.log('👤 [CustomersTable] First customer:', response.data[0]);
        setCustomers(response.data);
      } else {
        console.warn('⚠️ [CustomersTable] Unexpected response format:', response);
        setError('Unexpected response format from API');
      }
    } catch (err) {
      console.error('❌ [CustomersTable] Error fetching customers:', err);
      console.error('❌ [CustomersTable] Error details:', err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || 'Failed to load customers');
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
  
  // Mock data dựa theo ảnh - Thêm đầy đủ thông tin cho modal
  const mockCustomersData = [
    { 
      id: '#CUST001', 
      name: 'John Doe', 
      email: 'john.doe@example.com',
      phone: '+1234567890', 
      address: '123 Main St, New York, NY 10001',
      orderCount: 25, 
      totalSpend: 3450.00, 
      status: 'Active',
      registerAt: '2024-01-15',
      lastOrderDate: '2024-10-20'
    },
    { 
      id: '#CUST002', 
      name: 'Jane Smith', 
      email: 'jane.smith@example.com',
      phone: '+1234567891', 
      address: '456 Oak Ave, Los Angeles, CA 90001',
      orderCount: 5, 
      totalSpend: 250.00, 
      status: 'Inactive',
      registerAt: '2024-03-10',
      lastOrderDate: '2024-08-15'
    },

    { 
      id: '#CUST004', 
      name: 'Michael Brown', 
      email: 'michael.brown@example.com',
      phone: '+1234567893', 
      address: '321 Elm St, Houston, TX 77001',
      orderCount: 15, 
      totalSpend: 1890.00, 
      status: 'Active',
      registerAt: '2024-02-28',
      lastOrderDate: '2024-10-18'
    },
    { 
      id: '#CUST005', 
      name: 'Sarah Wilson', 
      email: 'sarah.wilson@example.com',
      phone: '+1234567894', 
      address: '654 Maple Dr, Phoenix, AZ 85001',
      orderCount: 8, 
      totalSpend: 675.00, 
      status: 'Active',
      registerAt: '2024-04-05',
      lastOrderDate: '2024-10-10'
    },
    { 
      id: '#CUST006', 
      name: 'David Lee', 
      email: 'david.lee@example.com',
      phone: '+1234567895', 
      address: '987 Cedar Ln, Philadelphia, PA 19101',
      orderCount: 3, 
      totalSpend: 180.00, 
      status: 'Inactive',
      registerAt: '2024-05-12',
      lastOrderDate: '2024-07-25'
    },
    { 
      id: '#CUST008', 
      name: 'James Taylor', 
      email: 'james.taylor@example.com',
      phone: '+1234567897', 
      address: '258 Spruce Ave, San Diego, CA 92101',
      orderCount: 12, 
      totalSpend: 1540.00, 
      status: 'Active',
      registerAt: '2024-01-30',
      lastOrderDate: '2024-10-19'
    },
    { 
      id: '#CUST009', 
      name: 'Maria Garcia', 
      email: 'maria.garcia@example.com',
      phone: '+1234567898', 
      address: '369 Willow Way, Dallas, TX 75201',
      orderCount: 18, 
      totalSpend: 2340.00, 
      status: 'Active',
      registerAt: '2023-12-15',
      lastOrderDate: '2024-10-17'
    },
    { 
      id: '#CUST010', 
      name: 'Robert Martinez', 
      email: 'robert.martinez@example.com',
      phone: '+1234567899', 
      address: '741 Ash Blvd, San Jose, CA 95101',
      orderCount: 6, 
      totalSpend: 420.00, 
      status: 'Inactive',
      registerAt: '2024-06-22',
      lastOrderDate: '2024-09-05'
    },
  ];

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      default: return '';
    }
  };

  const getStatusDot = (status) => {
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

  // TODO: Implement API call for delete customer
  const handleDelete = (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.username || customer.name}?`)) {
      // Simulate delete from local state
      setCustomers(customers.filter(c => c.id !== customer.id));
      // Refresh stats after deletion
      fetchStats();
      alert(`Customer ${customer.username || customer.name} has been deleted successfully`);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCustomer(null);
  };

  const handleAddCustomer = () => {
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
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button className="filter-btn">
            <Filter size={20} />
            Filter
          </button>

          <button className="add-customer-btn" onClick={handleAddCustomer}>
            <UserPlus size={20} />
            Add Customer
          </button>
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
                .filter(customer => 
                  (customer.username || customer.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (customer.phoneNumber || customer.phone)?.toLowerCase().includes(searchTerm.toLowerCase())
                )
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

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          <button className="pagination-nav">
            <span>← Previous</span>
          </button>
        </div>
        
        <div className="pagination-numbers">
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <button className="page-btn">4</button>
          <button className="page-btn">5</button>
          <span className="pagination-dots">...</span>
          <button className="page-btn">24</button>
        </div>
        
        <div className="pagination-info">
          <button className="pagination-nav">
            <span>Next →</span>
          </button>
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showModal && (
        <CustomerDetailModal 
          customer={selectedCustomer}
          onClose={handleCloseModal}
        />
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <AddCustomerModal 
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitCustomer}
        />
      )}
    </div>
  );
};

export default CustomersTable;