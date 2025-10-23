import React, { useState } from 'react';
import { Search, Filter, Users, Shield, Clock, UserCheck, Settings, Crown } from 'lucide-react';
import AdminActions from './AdminActions';
import './AdminsTable.css';

const AdminsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
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
      avatar: 'https://via.placeholder.com/40'
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
      avatar: 'https://via.placeholder.com/40'
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
      avatar: 'https://via.placeholder.com/40'
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
      avatar: 'https://via.placeholder.com/40'
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
      avatar: 'https://via.placeholder.com/40'
    }
  ];

  // Stats data cho admins
  const statsData = [
    { 
      title: 'Total Admins', 
      value: '15', 
      icon: <Users size={24} />, 
      color: 'blue',
      description: 'Active admin accounts'
    },
    { 
      title: 'Super Admins', 
      value: '3', 
      icon: <Crown size={24} />, 
      color: 'purple',
      description: 'Full access administrators'
    },
    { 
      title: 'Active Sessions', 
      value: '12', 
      icon: <UserCheck size={24} />, 
      color: 'green',
      description: 'Currently logged in'
    },
    { 
      title: 'Inactive', 
      value: '3', 
      icon: <Clock size={24} />, 
      color: 'orange',
      description: 'Inactive admin accounts'
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

  const handleAdminAction = {
    onView: (admin) => {
      console.log('View admin:', admin);
    },
    onEdit: (admin) => {
      console.log('Edit admin:', admin);
    },
    onChangeRole: (admin) => {
      console.log('Change role for admin:', admin);
    },
    onToggleStatus: (admin) => {
      console.log('Toggle status for admin:', admin);
      const action = admin.status === 'Active' ? 'deactivate' : 'activate';
      if (window.confirm(`Are you sure you want to ${action} ${admin.name}?`)) {
        // Toggle logic here
      }
    },
    onDelete: (admin) => {
      console.log('Delete admin:', admin);
      if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
        // Delete logic here
      }
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="admins-header">
        <div className="admins-title-section">
          <h1 className="admins-title">Admin Management</h1>
          <p className="admins-subtitle">Manage administrator accounts and permissions</p>
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
            <button className="add-admin-btn">
              <Users size={18} />
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
              <p className="stat-description">{stat.description}</p>
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
              <th>Contact</th>
              <th>Role</th>
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
                <td className="admin-contact">
                  <div className="contact-email">{admin.email}</div>
                  <div className="contact-phone">{admin.phone}</div>
                </td>
                <td>
                  <div className={`role-badge ${getRoleClass(admin.role)}`}>
                    <span className="role-icon">{getRoleIcon(admin.role)}</span>
                    {admin.role}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${getStatusClass(admin.status)}`}>
                    <span className="status-dot">●</span>
                    {admin.status}
                  </span>
                </td>
                <td className="last-login">
                  <div className="login-time">{formatLastLogin(admin.lastLogin)}</div>
                  <div className="login-date">{admin.lastLogin.split(' ')[0]}</div>
                </td>
                <td className="action-cell">
                  <AdminActions 
                    admin={admin}
                    onView={handleAdminAction.onView}
                    onEdit={handleAdminAction.onEdit}
                    onChangeRole={handleAdminAction.onChangeRole}
                    onToggleStatus={handleAdminAction.onToggleStatus}
                    onDelete={handleAdminAction.onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-container">
        <div className="pagination-info">
          <span>Showing 1 to 5 of {adminsData.length} results</span>
        </div>
        
        <div className="pagination-controls">
          <button className="pagination-btn">Previous</button>
          <div className="pagination-numbers">
            <button className="page-btn active">1</button>
            <button className="page-btn">2</button>
            <button className="page-btn">3</button>
          </div>
          <button className="pagination-btn">Next</button>
        </div>
      </div>
    </div>
  );
};

export default AdminsTable;