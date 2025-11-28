import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  FiSearch, 
  FiGrid, 
  FiList, 
  FiFilter, 
  FiChevronDown,
  FiStar,
  FiMapPin,
  FiTrendingUp,
  FiSliders
} from 'react-icons/fi';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import ProductCard from '../../components/product/ProductCard';
import ProductFilter from '../../components/product/ProductFilter';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { getProducts, searchProducts, getProductsByCategory } from '../../services/productService';
import { getCategories } from '../../services/homeService';
import useCart from '../../hooks/useCart';

/**
 * ProductListPage - Shopee Style
 * Enhanced product listing with better UI/UX
 */
const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart: addItemToCart } = useCart();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    categoryId: searchParams.get('category') ? parseInt(searchParams.get('category')) : null,
    priceMin: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')) : undefined,
    priceMax: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')) : undefined,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')) : undefined,
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('newest'); // name, price-asc, price-desc, newest
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        toast.error('Không thể tải danh mục');
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
        
        if (searchQuery || filters.categoryId || filters.priceMin || filters.priceMax || filters.minRating) {
          // Use search API with filters
          response = await searchProducts({
            keyword: searchQuery,
            categoryId: filters.categoryId,
            minPrice: filters.priceMin,
            maxPrice: filters.priceMax,
            minRating: filters.minRating,
            page: currentPage,
            size: pageSize,
          });
        } else {
          // Get all products
          response = await getProducts(currentPage, pageSize);
        }

          console.log('📦 Product response:', response);

        // Handle ResponseDTO structure: { status, error, message, data }
        if (response && response.data) {
          const pageData = response.data;
          let productList = pageData.content || pageData || [];

          console.log('📦 Page data:', pageData);
          console.log('📦 Raw product list:', productList);
          console.log('📦 First 3 products full data:', productList.slice(0, 3));
          console.log('📦 First product mainImage:', productList[0]?.mainImage);
          console.log('📦 First product image:', productList[0]?.image);
          console.log('📦 Total pages:', pageData.totalPages);
          console.log('📦 Total elements:', pageData.totalElements);          // Apply client-side sorting
          productList = sortProducts(productList, sortBy);

          setProducts(productList);
          setTotalPages(pageData.totalPages || 1);
          setTotalElements(pageData.totalElements || 0);
        } else {
          console.warn('Unexpected response structure:', response);
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        toast.error('Không thể tải sản phẩm');
        setProducts([]);
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
    
    // Update URL params
    const params = {};
    if (newFilters.categoryId) params.category = newFilters.categoryId;
    if (newFilters.priceMin) params.minPrice = newFilters.priceMin;
    if (newFilters.priceMax) params.maxPrice = newFilters.priceMax;
    if (newFilters.minRating) params.minRating = newFilters.minRating;
    if (searchQuery) params.search = searchQuery;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({
      categoryId: null,
      priceMin: undefined,
      priceMax: undefined,
      minRating: undefined,
    });
    setSearchQuery('');
    setSearchParams({});
    setCurrentPage(0);
  };

  const handleAddToCart = async (product, variant) => {
    try {
      // Check if product is active
      if (!product.isActive) {
        toast.error('Sản phẩm này hiện không khả dụng');
        return;
      }

      // Get variant or first available variant
      const selectedVariant = variant || product.variants?.[0];
      
      if (!selectedVariant) {
        toast.error('Sản phẩm không có phiên bản khả dụng');
        return;
      }

      // Check stock
      if (selectedVariant.stock === 0) {
        toast.error('Sản phẩm đã hết hàng');
        return;
      }

      await addItemToCart(selectedVariant.id, 1);
      toast.success('Đã thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Add to cart error:', error);
      if (error.response?.status === 404) {
        toast.error('Không tìm thấy sản phẩm');
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message || 'Số lượng không hợp lệ');
      } else {
        toast.error('Không thể thêm vào giỏ hàng');
      }
    }
  };

  const handleWishlist = (product) => {
    toast.info('Tính năng yêu thích đang phát triển!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        {/* Search Header - Shopee Style */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  className="w-full pl-12 pr-20 py-4 text-gray-900 bg-white rounded-lg shadow-sm focus:ring-2 focus:ring-white focus:ring-opacity-50 focus:outline-none"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Button 
                  type="submit" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-md transition-colors"
                >
                  Tìm kiếm
                </Button>
              </div>
            </form>
            
            {/* Breadcrumb & Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FiTrendingUp className="w-4 h-4" />
                <span>Trang chủ / Sản phẩm</span>
              </div>
              <div className="hidden sm:flex items-center gap-4">
                <span>{totalElements} sản phẩm</span>
                <span>•</span>
                <span>Cập nhật: Hôm nay</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar Filters */}
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                  <button 
                    onClick={handleClearFilters}
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    Xóa tất cả
                  </button>
                </div>
                <ProductFilter
                  categories={categories}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden fixed bottom-20 right-4 z-40">
              <button
                onClick={() => setShowMobileFilter(true)}
                className="bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
              >
                <FiSliders className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Filter Modal */}
            {showMobileFilter && (
              <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
                <div className="bg-white h-full w-full max-w-sm ml-auto p-4 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Bộ lọc</h3>
                    <button 
                      onClick={() => setShowMobileFilter(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </div>
                  <ProductFilter
                    categories={categories}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                  />
                  <div className="mt-6 flex gap-3">
                    <Button 
                      onClick={() => setShowMobileFilter(false)}
                      variant="outline" 
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                    <Button 
                      onClick={() => setShowMobileFilter(false)}
                      variant="primary" 
                      className="flex-1"
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar - Shopee Style */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Results Info */}
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-600">
                      {totalElements > 0 ? (
                        <>
                          <span className="font-medium text-primary-600">{products.length}</span> 
                          / <span className="font-medium">{totalElements}</span> sản phẩm
                        </>
                      ) : (
                        <>Không tìm thấy sản phẩm nào</>
                      )}
                    </p>
                    {totalElements > 0 && (
                      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                        <FiMapPin className="w-3 h-3" />
                        <span>Toàn quốc</span>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="newest">🔥 Mới nhất</option>
                        <option value="name">📝 Tên A-Z</option>
                        <option value="price-asc">💰 Giá thấp → cao</option>
                        <option value="price-desc">💎 Giá cao → thấp</option>
                      </select>
                      <FiChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'grid' 
                            ? 'bg-white text-primary-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <FiGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === 'list' 
                            ? 'bg-white text-primary-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <FiList className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải sản phẩm...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FiSearch className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                    <p className="text-gray-500 text-sm mb-6">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm khác</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button onClick={handleClearFilters} variant="outline">
                        🔄 Xóa bộ lọc
                      </Button>
                      <Button onClick={() => setSearchQuery('')} variant="primary">
                        🏠 Xem tất cả
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Products Container */}
                  <div className={`${
                    viewMode === 'grid' 
                      ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6' 
                      : 'space-y-4'
                  }`}>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onWishlist={handleWishlist}
                        viewMode={viewMode}
                      />
                    ))}
                  </div>

                  {/* Load More for Mobile (if needed) */}
                  {products.length < totalElements && (
                    <div className="text-center mt-8 sm:hidden">
                      <Button 
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        variant="outline"
                        className="w-full"
                      >
                        Xem thêm ({totalElements - products.length} sản phẩm)
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Pagination - Shopee Style */}
              {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
                  <div className="flex items-center justify-between">
                    {/* Page Info */}
                    <p className="text-sm text-gray-600">
                      Trang <span className="font-medium text-primary-600">{currentPage + 1}</span> / {totalPages}
                    </p>
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                        variant="outline"
                        size="sm"
                        className="hidden sm:flex"
                      >
                        ← Trước
                      </Button>
                      
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                          let page;
                          if (totalPages <= 7) {
                            page = i;
                          } else {
                            if (currentPage < 3) {
                              page = i;
                            } else if (currentPage > totalPages - 4) {
                              page = totalPages - 7 + i;
                            } else {
                              page = currentPage - 3 + i;
                            }
                          }
                          
                          if (page >= totalPages || page < 0) return null;
                          
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                                currentPage === page
                                  ? 'bg-primary-500 text-white shadow-md transform scale-105'
                                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
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
                        size="sm"
                        className="hidden sm:flex"
                      >
                        Sau →
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mobile Pagination */}
                  <div className="sm:hidden flex justify-between mt-4">
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      variant="outline"
                      size="sm"
                      className="flex-1 mr-2"
                    >
                      ← Trước
                    </Button>
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      variant="outline"
                      size="sm"
                      className="flex-1 ml-2"
                    >
                      Sau →
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProductListPage;
