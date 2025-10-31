import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';

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
 * ProductListPage
 * Display products with filters, search, pagination
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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12);

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
          console.log('📦 Product list:', productList);
          console.log('📦 Total pages:', pageData.totalPages);
          console.log('📦 Total elements:', pageData.totalElements);

          // Apply client-side sorting
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
      <main className="flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-bold text-gray-900">Sản phẩm</h1>
            <p className="text-gray-600 mt-1">
              Khám phá bộ sưu tập phụ kiện thể thao của chúng tôi
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
                    {totalElements > 0 ? (
                      <>Hiển thị {products.length} trong số {totalElements} sản phẩm</>
                    ) : (
                      <>Không tìm thấy sản phẩm nào</>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="name">Tên A-Z</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
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
                <Loading size="lg" text="Đang tải sản phẩm..." />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg">
                <p className="text-gray-600 text-lg mb-2">Không tìm thấy sản phẩm</p>
                <p className="text-gray-500 text-sm mb-4">Thử điều chỉnh bộ lọc hoặc tìm kiếm khác</p>
                <Button onClick={handleClearFilters} variant="outline" className="mt-4">
                  Xóa bộ lọc
                </Button>
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
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
                  Trang trước
                </Button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = currentPage < 3 ? i : currentPage - 2 + i;
                    if (page >= totalPages) return null;
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
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
                  Trang sau
                </Button>
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
