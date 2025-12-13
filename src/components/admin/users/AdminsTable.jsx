import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Users, Shield, Clock, UserCheck, Settings, Crown, Edit2, Trash2 } from 'lucide-react';
import AddAdminModal from './AddAdminModal';
import AdminEditModal from './AdminEditModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import Toast from '../common/Toast';
import { getAdminsPage, getAdminStats, deleteUser } from '../../../services/adminService';
import './AdminsTable.css';

const AdminsTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminsData, setAdminsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [statsData, setStatsData] = useState({
    totalAdmins: 0,
    activeAdmins: 0,
    inactiveAdmins: 0
  });
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [_totalElements, setTotalElements] = useState(0); // eslint-disable-line no-unused-vars
  const [pageSize] = useState(10);

  // Fetch admins data from API
  useEffect(() => {
    fetchAdmins();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Re-fetch when page changes

  const fetchStats = async () => {
    try {
      console.log('📊 [AdminsTable] Fetching admin stats...');
      const response = await getAdminStats();
      
      if (response.status === 200 && response.data) {
        console.log('✅ [AdminsTable] Admin stats:', response.data);
        setStatsData({
          totalAdmins: response.data.totalAdmins,
          activeAdmins: response.data.activeAdmins,
          inactiveAdmins: response.data.inactiveAdmins
        });
      }
    } catch (error) {
      console.error('❌ [AdminsTable] Error fetching stats:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      console.log(`📡 [AdminsTable] Fetching admins page ${currentPage}...`);
      const response = await getAdminsPage(currentPage, pageSize);
      
      if (response.status === 200 && response.data) {
        // Response structure: ResponseDTO<Page<ListAdminUserDTO>>
        const pageData = response.data.data || response.data;
        
        console.log('✅ [AdminsTable] Page data:', pageData);
        
        // Backend trả về structure: {content: [], page: {totalPages, totalElements, size, number}}
        const paginationInfo = pageData.page || {};
        setTotalPages(paginationInfo.totalPages || 0);
        setTotalElements(paginationInfo.totalElements || 0);
        
        console.log('🔍 [DEBUG] paginationInfo:', paginationInfo);
        
        // Set admins from content array
        const adminsList = pageData.content || [];
        
        // Map API response to component format
        const mappedAdmins = (Array.isArray(adminsList) ? adminsList : []).map(admin => ({
          id: admin.id,
          name: admin.username || 'N/A',
          email: admin.email || 'N/A',
          phone: admin.phoneNumber || 'N/A',
          avatar: admin.avatar || 'https://via.placeholder.com/40',
          role: mapRoleFromAPI(admin.role),
          status: admin.activated ? 'Active' : 'Inactive',
          createdAt: admin.createdAt || null
        }));
        
        setAdminsData(mappedAdmins);
        console.log(`📊 [AdminsTable] Loaded ${mappedAdmins.length} admins, Total: ${paginationInfo.totalElements}, Pages: ${paginationInfo.totalPages}`);
      }
    } catch (error) {
      console.error('❌ [AdminsTable] Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Map API role to display role
  const mapRoleFromAPI = (apiRole) => {
    const roleMap = {
      'ADMIN': 'Admin',
      'SUPER_ADMIN': 'Super Admin',
      'MODERATOR': 'Moderator',
      'SUPPORT_ADMIN': 'Support Admin'
    };
    return roleMap[apiRole] || apiRole;
  };

  // Get permissions based on role - kept for future use
  // eslint-disable-next-line no-unused-vars
  const _getRolePermissions = (role) => {
    const permissionsMap = {
      'ADMIN': ['User Management', 'Content Management', 'Reports'],
      'SUPER_ADMIN': ['All Access'],
      'MODERATOR': ['Content Management'],
      'SUPPORT_ADMIN': ['User Support', 'Ticket Management']
    };
    return permissionsMap[role] || [];
  };

  // Stats cards data - Use data from API
  const statsCards = [
    { 
      title: 'Total Admins', 
      value: statsData.totalAdmins.toString(), 
      icon: <Users size={24} />, 
      color: 'blue',
    },
    { 
      title: 'Active', 
      value: statsData.activeAdmins.toString(), 
      icon: <UserCheck size={24} />, 
      color: 'green',
    },
    { 
      title: 'Inactive', 
      value: statsData.inactiveAdmins.toString(), 
      icon: <Clock size={24} />, 
      color: 'orange',
    }
  ];

  // Role/status helpers - kept for future use
  // eslint-disable-next-line no-unused-vars
  const _getRoleClass = (role) => {
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

  // eslint-disable-next-line no-unused-vars
  const _getRoleIcon = (role) => {
    switch(role) {
      case 'Super Admin': return <Crown size={16} />;
      case 'Admin': return <Shield size={16} />;
      case 'Moderator': return <Settings size={16} />;
      case 'Support Admin': return <UserCheck size={16} />;
      default: return <Users size={16} />;
    }
  };

  // eslint-disable-next-line no-unused-vars
  const _formatLastLogin = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCreatedAt = (datetime) => {
    if (!datetime) return 'N/A';
    const date = new Date(datetime);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // eslint-disable-next-line no-unused-vars
  const _handleViewDetails = (admin) => {
    console.log('View details:', admin);
    alert(`Viewing details for ${admin.name}`);
  };

  const handleEdit = (admin) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async (updatedAdmin) => {
    console.log('Updating admin:', updatedAdmin);
    
    // Refresh admins list and stats after update
    await fetchAdmins();
    await fetchStats();
    
    // Update selected admin to show changes in modal immediately
    setSelectedAdmin(updatedAdmin);
  };

  const handleDelete = (admin) => {
    console.log('🗑️ [AdminsTable] Opening delete confirmation for admin:', admin);
    setAdminToDelete(admin);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    
    const admin = adminToDelete;
    
    try {
      setLoading(true);
      console.log('🗑️ [AdminsTable] Calling deleteUser API for admin ID:', admin.id);
      
      const response = await deleteUser(admin.id);
      
      if (response.status === 200) {
        console.log('✅ [AdminsTable] Admin deleted successfully:', response.message);
        
        // Show success toast instead of alert
        setToast({
          show: true,
          message: `Admin "${admin.name}" has been removed from the system.`,
          type: 'success'
        });
        
        // Refresh admins list and stats after successful deletion
        await fetchAdmins();
        await fetchStats();
      }
    } catch (error) {
      console.error('❌ [AdminsTable] Error deleting admin:', error);
      
      // Show error toast instead of alert
      const errorMessage = error.message || 'Failed to delete admin. Please try again.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setAdminToDelete(null);
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
    fetchAdmins();
    fetchStats(); // Refresh stats after adding new admin
  };

  // Filter admins based on search term
  const filteredAdmins = adminsData.filter(admin => {
    const searchLower = searchTerm.toLowerCase();
    return (
      admin.name.toLowerCase().includes(searchLower) ||
      admin.email.toLowerCase().includes(searchLower) ||
      admin.role.toLowerCase().includes(searchLower) ||
      admin.phone.toLowerCase().includes(searchLower)
    );
  });

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
        {statsCards.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.title}</p>
              <p className="stat-value">{loading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="admins-table-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>Loading admins...</p>
          </div>
        ) : adminsData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <p>No admin users found.</p>
          </div>
        ) : (
          <table className="admins-table">
          <thead>
            <tr>
              <th>Administrator</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.map((admin, index) => (
              <tr key={index} className="table-row">
                <td className="admin-info">
                  <div className="admin-avatar-container">
                    {/* <img 
                      // src={admin.avatar} 
                      alt={admin.name}
                      className="admin-avatar"
                    /> */}
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
                <td className="created-at">
                  <div className="created-time">{formatCreatedAt(admin.createdAt)}</div>
                </td>
                <td className="action-cell">
                  <div className="customer-actions admin-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={(e) => { e.stopPropagation(); handleEdit(admin); }}
                      title="Edit Admin"
                    >
                      <Edit2 size={16} />
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

      {/* Add Admin Modal */}
      {showAddModal && (
        <AddAdminModal 
          onClose={handleCloseAddModal}
          onSubmit={handleSubmitAdmin}
        />
      )}

      {/* Edit Admin Modal */}
      {showEditModal && (
        <AdminEditModal
          admin={selectedAdmin}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
          }}
          onUpdate={handleUpdateAdmin}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setAdminToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Admin"
        userName={adminToDelete?.name || `Admin #${adminToDelete?.id}`}
        userType="admin"
        deletionDetails={[
          'Admin account',
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

export default AdminsTable;