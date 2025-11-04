import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, Layers, Package, Grid, TrendingUp } from 'lucide-react';
import './CategoriesTable.css';
import CategoryModal from './CategoryModal';

const CategoriesTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      productCount: 245,
      soldCount: 1823,
      icon: '📱',
      createdAt: '2024-01-15'
    },
    {
      id: 2,
      name: 'Fashion',
      description: 'Clothing, shoes, and accessories',
      productCount: 532,
      soldCount: 3456,
      icon: '👔',
      createdAt: '2024-01-20'
    },
    {
      id: 3,
      name: 'Furniture',
      description: 'Home and office furniture',
      productCount: 128,
      soldCount: 687,
      icon: '🪑',
      createdAt: '2024-02-05'
    },
    {
      id: 4,
      name: 'Sports',
      description: 'Sports equipment and fitness gear',
      productCount: 87,
      soldCount: 412,
      icon: '⚽',
      createdAt: '2024-02-12'
    },
    {
      id: 5,
      name: 'Books',
      description: 'Books, magazines, and reading materials',
      productCount: 156,
      soldCount: 934,
      icon: '📚',
      createdAt: '2024-03-01'
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Stats data
  const statsData = [
    {
      title: 'Total Categories',
      value: categories.length.toString(),
      icon: <Grid size={24} />,
      color: 'blue',
      description: 'All categories'
    },
    {
      title: 'Total Products',
      value: categories.reduce((sum, c) => sum + c.productCount, 0).toLocaleString(),
      icon: <Package size={24} />,
      color: 'purple',
      description: 'Across all categories'
    },
    {
      title: 'Products Sold',
      value: categories.reduce((sum, c) => sum + c.soldCount, 0).toLocaleString(),
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
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      setCategories(categories.filter(c => c.id !== category.id));
      alert(`Category "${category.name}" has been deleted`);
    }
  };

  const handleSaveCategory = (categoryData) => {
    if (editingCategory) {
      // Update existing category
      setCategories(categories.map(c => 
        c.id === editingCategory.id 
          ? { ...c, ...categoryData }
          : c
      ));
      alert('Category updated successfully!');
    } else {
      // Add new category
      const newCategory = {
        ...categoryData,
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        productCount: 0,
        soldCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setCategories([...categories, newCategory]);
      alert('Category added successfully!');
    }
    setShowModal(false);
    setEditingCategory(null);
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

      {/* Categories Grid */}
      <div className="categories-grid">
        {filteredCategories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-card-header">
              <div className="category-icon-wrapper">
                <span className="category-icon-emoji">{category.icon}</span>
              </div>
              <div className="category-actions">
                <button
                  className="action-btn edit-btn"
                  onClick={() => handleEditCategory(category)}
                  title="Edit Category"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="action-btn delete-btn"
                  onClick={() => handleDeleteCategory(category)}
                  title="Delete Category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="category-card-body">
              <h3 className="category-name">{category.name}</h3>
              <p className="category-description">{category.description}</p>

              <div className="category-meta">
                <div className="category-stat">
                  <Package size={16} />
                  <span>{category.productCount} products</span>
                </div>
                <div className="category-stat">
                  <TrendingUp size={16} />
                  <span>{category.soldCount.toLocaleString()} sold</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="empty-state">
          <Layers size={48} />
          <h3>No categories found</h3>
          <p>Try adjusting your search or add a new category</p>
        </div>
      )}

      {/* Category Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={handleCloseModal}
          onSave={handleSaveCategory}
        />
      )}
    </div>
  );
};

export default CategoriesTable;
