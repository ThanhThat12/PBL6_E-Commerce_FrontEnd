import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';

import ProductCard from '../../components/product/ProductCard';
import ProductFilter from '../../components/product/ProductFilter';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { getProducts, searchProducts, getProductsByCategory, getCategories } from '../../services/productService';
import { addToCart } from '../../services/cartService';

/**
 * ProductListPage
 * Display products with filters, search, pagination
 */
const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categories: [],
    priceMin: undefined,
    priceMax: undefined
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('name'); // name, price-asc, price-desc, newest
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(20);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getCategories();
        console.log('📦 ProductListPage - Categories response:', response);
        
        if (response.code === 200) {
          setCategories(response.data);
          console.log('✅ Categories loaded:', response.data.length, 'items');
        } else {
          console.warn('❌ Categories load failed:', response.message);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    loadCategories();
  }, []);

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let response;
        
        if (searchQuery) {
          // Search products
          response = await searchProducts(searchQuery, currentPage, pageSize);
        } else if (filters.categories.length > 0) {
          // Filter by category (only first category for now)
          response = await getProductsByCategory(filters.categories[0], currentPage, pageSize);
        } else {
          // Get all products
          response = await getProducts(currentPage, pageSize);
        }

        console.log('📦 ProductListPage - Products response:', response);

        if (response.code === 200) {
          let productList = response.data.content || response.data;
          console.log('✅ Products loaded:', productList.length, 'items');
          
          // Apply price filter
          if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
            productList = productList.filter(product => {
              const price = product.price || product.basePrice || 0;
              const minCheck = filters.priceMin === undefined || price >= filters.priceMin;
              const maxCheck = filters.priceMax === undefined || price <= filters.priceMax;
              return minCheck && maxCheck;
            });
          }

          // Apply sorting
          productList = sortProducts(productList, sortBy);

          setProducts(productList);
          setTotalPages(response.data.totalPages || 1);
        } else {
          console.warn('❌ Products load failed:', response.message);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, pageSize, searchQuery, filters, sortBy]);

  const sortProducts = (productList, sortType) => {
    const sorted = [...productList];
    switch (sortType) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
      case 'price-desc':
        return sorted.sort((a, b) => (b.basePrice || 0) - (a.basePrice || 0));
      case 'newest':
        return sorted.sort((a, b) => b.id - a.id);
      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setSearchParams(searchQuery ? { search: searchQuery } : {});
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      categories: [],
      priceMin: undefined,
      priceMax: undefined
    });
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(0);
  };

  const handleAddToCart = async (product, variant) => {
    try {
      const variantId = variant?.id || product.variants?.[0]?.id;
      if (!variantId) {
        toast.error('Please select a variant');
        return;
      }

      const response = await addToCart(variantId, 1);
      if (response.code === 200) {
        toast.success('Added to cart!');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Failed to add to cart');
    }
  };

  const handleWishlist = (product) => {
    toast.info('Wishlist feature coming soon!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">
            Discover our collection of sports accessories
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </div>
        </form>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <ProductFilter
              categories={categories}
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-600">
                    {products.length} products found
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>

                  {/* View Mode */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <FiGrid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 border-l border-gray-300 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <FiList className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loading size="lg" text="Loading products..." />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg">
                <p className="text-gray-600">No products found</p>
                <Button onClick={handleClearFilters} variant="outline" className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onWishlist={handleWishlist}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = currentPage < 3 ? i : currentPage - 2 + i;
                    if (page >= totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                      >
                        {page + 1}
                      </button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                  disabled={currentPage === totalPages - 1}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
