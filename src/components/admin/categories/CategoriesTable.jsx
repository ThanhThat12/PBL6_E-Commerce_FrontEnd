import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, Package, Grid, TrendingUp } from 'lucide-react';
import './CategoriesTable.css';
import CategoryModal from './CategoryModal';
import CategoryActions from './CategoryActions';
import Toast from '../common/Toast';
import DeleteConfirmModal from '../common/DeleteConfirmModal';
import { getAdminCategories, getCategoryStats, createCategory, updateCategory, deleteCategory } from '../../../services/adminService';

const CategoriesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalProducts: 0,
    productsSold: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [operationLoading, setOperationLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Fetch categories and stats from API
  useEffect(() => {
    fetchCategories();
    fetchStats();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('📡 [CategoriesTable] Fetching categories from API...');
      const response = await getAdminCategories();
      
      if (response.status === 200 && response.data) {
        console.log('✅ [CategoriesTable] Categories loaded:', response.data);
        setCategories(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('❌ [CategoriesTable] Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 [CategoriesTable] Fetching category stats from API...');
      const response = await getCategoryStats();
      
      if (response.status === 200 && response.data) {
        console.log('✅ [CategoriesTable] Stats loaded:', response.data);
        setStats(response.data);
      }
    } catch (err) {
      console.error('❌ [CategoriesTable] Error fetching stats:', err);
      // Don't set error state for stats - just log it
    }
  };

  // Stats data for display
  const statsData = [
    {
      title: 'Total Categories',
      value: stats.totalCategories.toString(),
      icon: <Grid size={24} />,
      color: 'blue',
      description: 'All categories'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: <Package size={24} />,
      color: 'purple',
      description: 'Across all categories'
    },
    {
      title: 'Products Sold',
      value: stats.productsSold.toLocaleString(),
      icon: <TrendingUp size={24} />,
      color: 'green',
      description: 'Total sold products'
    }
  ];

  const handleAddCategory = () => {
    setEditingCategory(null);
    setShowModal(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setOperationLoading(true);
      console.log('🗑️ [CategoriesTable] Deleting category:', categoryToDelete.id);
      
      await deleteCategory(categoryToDelete.id);
      
      setToast({
        show: true,
        message: `Category "${categoryToDelete.name}" has been deleted successfully.`,
        type: 'success'
      });
      
      // Refresh data from API after deletion
      await fetchCategories();
      await fetchStats();
      
    } catch (error) {
      console.error('❌ [CategoriesTable] Error deleting category:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete category. Please try again.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setOperationLoading(false);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      setOperationLoading(true);
      
      if (editingCategory) {
        // Update existing category
        console.log('📝 [CategoriesTable] Updating category:', editingCategory.id, categoryData);
        await updateCategory(editingCategory.id, categoryData);
        
        setToast({
          show: true,
          message: `Category "${categoryData.name}" has been updated successfully.`,
          type: 'success'
        });
      } else {
        // Create new category
        console.log('📝 [CategoriesTable] Creating new category:', categoryData);
        await createCategory(categoryData);
        
        setToast({
          show: true,
          message: `Category "${categoryData.name}" has been created successfully.`,
          type: 'success'
        });
      }
      
      setShowModal(false);
      setEditingCategory(null);
      
      // Refresh data from API after save
      await fetchCategories();
      await fetchStats();
      
    } catch (error) {
      console.error('❌ [CategoriesTable] Error saving category:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save category. Please try again.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header Section */}
      <div className="categories-header">
        <div className="categories-title-section">
          <h1 className="categories-title">Categories Management</h1>
        </div>

        <div className="categories-actions">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <button className="add-category-btn" onClick={handleAddCategory}>
            <Plus size={18} />
            Add Category
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

      {/* Categories Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading categories...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => { setLoading(true); setError(null); fetchCategories(); fetchStats(); }}>
              Try Again
            </button>
          </div>
        ) : (
          <table className="categories-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Category Name</th>
                <th>Total Products</th>
                <th>Total Sold Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>#{category.id}</td>
                    <td>
                      <div className="category-name-cell">
                        <span className="category-name-text">{category.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stat-badge stat-badge-purple">
                        <Package size={14} />
                        <span>{category.totalProducts || 0}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stat-badge stat-badge-green">
                        <TrendingUp size={14} />
                        <span>{(category.totalSoldProducts || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="action-cell">
                      <CategoryActions 
                        category={category}
                        onEdit={handleEditCategory}
                        onDelete={handleDeleteCategory}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state-row">
                    <div className="empty-state">
                      <Layers size={48} />
                      <h3>No categories found</h3>
                      <p>Try adjusting your search or add a new category</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={handleCloseModal}
          onSave={handleSaveCategory}
          loading={operationLoading}
        />
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Confirm Delete Category"
        userName={categoryToDelete?.name}
        userType="category"
        deletionDetails={[
          "All products in this category may be affected",
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

export default CategoriesTable;
