import React, { useState, useEffect } from 'react';
import { UserPlus , Search, Filter, Users, UserCheck, Star, Package, TrendingUp, ShoppingBag, Receipt } from 'lucide-react';
import CustomerActions from './CustomerActions';
import CustomerDetailModal from './CustomerDetailModal';
import AddCustomerModal from './AddCustomerModal';
import { getCustomers, getCustomerDetail, deleteUser } from '../../../services/adminService';
import './CustomersTable.css';

const CustomersTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching customers from API...');
      console.log('📍 API URL:', 'http://localhost:8081/api/admin/users/customers');
      console.log('🔑 Token:', localStorage.getItem('adminToken'));
      
      const response = await getCustomers();
      console.log('✅ API Response:', response);
      
      if (response.statusCode === 200 && response.data) {
        setCustomers(response.data);
        setError(null);
        console.log('👥 Customers loaded from API:', response.data.length);
      } else {
        // Fallback to mock data
        console.warn('⚠️ Bad response from API, using mock data');
        setCustomers(mockCustomersData);
        setError(null);
      }
    } catch (err) {
      console.error('❌ Error fetching customers:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      
      // Fallback to mock data when API fails
      console.log('📦 Using mock data (backend not running)');
      setCustomers(mockCustomersData);
      setError(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Dữ liệu thống kê cho khách hàng
  const statsData = [
    { 
      title: 'Total Customers', 
      value: '2,847', 
      icon: <Users size={24} />, 
      color: 'blue',
    },
    { 
      title: 'Active Customers', 
      value: '1,942', 
      icon: <UserCheck size={24} />, 
      color: 'green',
    },
    { 
      title: 'Total order', 
      value: '156', 
      icon: <ShoppingBag size={24} />, 
      color: 'yellow',
    },
    { 
      title: 'Total Revenue', 
      value: '$2845', 
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

  const handleView = async (customer) => {
    try {
      console.log('👀 Fetching customer detail for:', customer.id);
      
      // Try to fetch detailed customer info from API
      const response = await getCustomerDetail(customer.id);
      
      if (response.statusCode === 200 && response.data) {
        console.log('✅ Customer detail from API:', response.data);
        setSelectedCustomer(response.data);
        setShowModal(true);
      } else {
        console.warn('⚠️ Failed to fetch from API, using local data');
        // Fallback to local customer data
        setSelectedCustomer(customer);
        setShowModal(true);
      }
    } catch (error) {
      console.error('❌ Error fetching customer detail:', error);
      console.log('📦 Using local customer data (backend not running)');
      // Fallback to local customer data when API fails
      setSelectedCustomer(customer);
      setShowModal(true);
    }
  };

  const handleDelete = async (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.username || customer.name}?`)) {
      try {
        console.log('🗑️ Deleting customer:', customer.id);
        const response = await deleteUser(customer.id);
        
        if (response.statusCode === 200) {
          console.log('✅ Customer deleted successfully');
          alert(`Customer ${customer.username || customer.name} has been deleted successfully`);
          // Refresh customer list
          fetchCustomers();
        } else {
          alert('Failed to delete customer');
        }
      } catch (error) {
        console.error('❌ Error deleting customer:', error);
        console.log('📦 Simulating delete (backend not running)');
        // Simulate delete in mock data
        setCustomers(customers.filter(c => c.id !== customer.id));
        alert(`Customer ${customer.username || customer.name} has been deleted (simulated)`);
      }
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
            <p>{error}</p>
            <button onClick={fetchCustomers} style={{ marginTop: '10px' }}>Retry</button>
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