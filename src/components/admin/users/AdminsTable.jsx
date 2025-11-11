import React, { useState } from 'react';
import { UserPlus, Search, Filter, Users, Shield, Clock, UserCheck, Settings, Crown, Eye, Trash2 } from 'lucide-react';
import AddAdminModal from './AddAdminModal';
import './AdminsTable.css';

const AdminsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Mock data cho admins
  const adminsData = [
    { 
      id: 'ADM001', 
      name: 'John Smith', 
      email: 'john.smith@company.com', 
      phone: '+1234567890', 
      role: 'Super Admin',
      status: 'Active', 
      lastLogin: '2024-10-14 09:30', 
      permissions: ['All Access'], 
      department: 'IT',
      joinDate: '2024-01-15',
      avatar: null // TODO: Load from API
    },
    { 
      id: 'ADM002', 
      name: 'Sarah Johnson', 
      email: 'sarah.j@company.com', 
      phone: '+1234567891', 
      role: 'Admin',
      status: 'Active', 
      lastLogin: '2024-10-14 08:45', 
      permissions: ['User Management', 'Content Management'], 
      department: 'Operations',
      joinDate: '2024-02-20',
      avatar: null // TODO: Load from API
    },
    { 
      id: 'ADM003', 
      name: 'Michael Davis', 
      email: 'michael.d@company.com', 
      phone: '+1234567892', 
      role: 'Moderator',
      status: 'Active', 
      lastLogin: '2024-10-13 16:20', 
      permissions: ['Content Management'], 
      department: 'Content',
      joinDate: '2024-03-10',
      avatar: null // TODO: Load from API
    },
    { 
      id: 'ADM004', 
      name: 'Emily Wilson', 
      email: 'emily.w@company.com', 
      phone: '+1234567893', 
      role: 'Admin',
      status: 'Inactive', 
      lastLogin: '2024-10-10 14:30', 
      permissions: ['Reports', 'Analytics'], 
      department: 'Analytics',
      joinDate: '2024-04-05',
      avatar: null // TODO: Load from API
    },
    { 
      id: 'ADM005', 
      name: 'David Brown', 
      email: 'david.b@company.com', 
      phone: '+1234567894', 
      role: 'Support Admin',
      status: 'Active', 
      lastLogin: '2024-10-14 07:15', 
      permissions: ['User Support', 'Ticket Management'], 
      department: 'Support',
      joinDate: '2024-05-12',
      avatar: null // TODO: Load from API
    }
  ];

  // Stats data cho admins
  const statsData = [
    { 
      title: 'Total Admins', 
      value: '15', 
      icon: <Users size={24} />, 
      color: 'blue',
    },
    { 
      title: 'Super Admins', 
      value: '3', 
      icon: <Crown size={24} />, 
      color: 'purple',
    },
    { 
      title: 'Active Sessions', 
      value: '12', 
      icon: <UserCheck size={24} />, 
      color: 'green',
    },
    { 
      title: 'Inactive', 
      value: '3', 
      icon: <Clock size={24} />, 
      color: 'orange',
    }
  ];

  const getRoleClass = (role) => {
    switch(role) {
      case 'Super Admin': return 'role-super-admin';
      case 'Admin': return 'role-admin';
      case 'Moderator': return 'role-moderator';
      case 'Support Admin': return 'role-support';
      default: return 'role-default';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Active': return 'status-active';
      case 'Inactive': return 'status-inactive';
      default: return 'status-default';
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'Super Admin': return <Crown size={16} />;
      case 'Admin': return <Shield size={16} />;
      case 'Moderator': return <Settings size={16} />;
      case 'Support Admin': return <UserCheck size={16} />;
      default: return <Users size={16} />;
    }
  };

  const formatLastLogin = (datetime) => {
    const date = new Date(datetime);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  const handleViewDetails = (admin) => {
    console.log('View details:', admin);
    alert(`Viewing details for ${admin.name}`);
  };

  const handleDelete = (admin) => {
    console.log('Delete admin:', admin);
    if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
      alert(`${admin.name} has been deleted`);
    }
  };

  const handleAddAdmin = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleSubmitAdmin = (formData) => {
    console.log('New admin data:', formData);
    // TODO: Implement API call to create admin
    // After successful creation, refresh the admin list
  };

  return (
    <div>
      {/* Header Section */}
      <div className="admins-header">
        <div className="admins-title-section">
          <h1 className="admins-title">Admin Management</h1>
          {/* <p className="admins-subtitle">Manage administrator accounts and permissions</p> */}
        </div>
        
        {/* Actions */}
        <div className="admins-actions">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search administrators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="action-buttons">
            <button className="add-admin-btn" onClick={handleAddAdmin}>
              <UserPlus size={18} />
              Add Admin
            </button>
            <button className="export-btn">
              <Settings size={18} />
              Manage Roles
            </button>
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
      <div className="admins-table-container">
        <table className="admins-table">
          <thead>
            <tr>
              <th>Administrator</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adminsData.map((admin, index) => (
              <tr key={index} className="table-row">
                <td className="admin-info">
                  <div className="admin-avatar-container">
                    <img 
                      src={admin.avatar} 
                      alt={admin.name}
                      className="admin-avatar"
                    />
                    <div className="admin-details">
                      <div className="admin-name">{admin.name}</div>
                      <div className="admin-id">ID: {admin.id}</div>
                    </div>
                  </div>
                </td>
                <td className="admin-email">
                  <span className="email-text">{admin.email}</span>
                </td>
                <td className="admin-phone">
                  <span className="phone-text">{admin.phone}</span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(admin.status)}`}>
                    <span className="status-dot">●</span>
                    {admin.status}
                  </span>
                </td>
                <td className="last-login">
                  <div className="login-time">{formatLastLogin(admin.lastLogin)}</div>
                </td>
                <td className="action-cell">
                  <div className="customer-actions admin-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={(e) => { e.stopPropagation(); handleViewDetails(admin); }}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={(e) => { e.stopPropagation(); handleDelete(admin); }}
                      title="Delete Admin"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      {/* Add Admin Modal */}
      {showAddModal && (
        <AddAdminModal 
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitAdmin}
        />
      )}
    </div>
  );
};

export default AdminsTable;