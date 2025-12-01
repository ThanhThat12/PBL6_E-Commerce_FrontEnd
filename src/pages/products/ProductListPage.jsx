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
  const [pageSize, setPageSize] = useState(12);

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



        // Handle ResponseDTO structure: { status, error, message, data }
        if (response && response.data) {
          const pageData = response.data;
          let productList = pageData.content || pageData || [];



          // Apply client-side sorting
          productList = sortProducts(productList, sortBy);

          setProducts(productList);

          // Extract pagination info - handle different response structures
          let extractedTotalElements = 0;
          let extractedTotalPages = 0;

          // Backend returns pagination info in pageData.page object
          // Structure: { content: [...], page: { size, number, totalElements, totalPages } }

          // 1. Try to find totalElements first
          if (pageData.page && pageData.page.totalElements !== undefined) {
            // New structure: pageData.page.totalElements
            extractedTotalElements = pageData.page.totalElements;
          } else if (pageData.totalElements !== undefined) {
            // Old structure: pageData.totalElements
            extractedTotalElements = pageData.totalElements;
          } else if (pageData.pageable && pageData.pageable.totalElements !== undefined) {
            extractedTotalElements = pageData.pageable.totalElements;
          } else if (response.totalElements !== undefined) {
            extractedTotalElements = response.totalElements;
          } else if (Array.isArray(productList)) {
            // Fallback
            extractedTotalElements = productList.length;
          }

          // Ensure it's a number
          extractedTotalElements = parseInt(extractedTotalElements, 10) || 0;

          // 2. Try to find totalPages
          if (pageData.page && pageData.page.totalPages !== undefined) {
            // New structure: pageData.page.totalPages
            extractedTotalPages = parseInt(pageData.page.totalPages, 10) || 1;
          } else if (pageData.totalPages !== undefined) {
            // Old structure: pageData.totalPages
            extractedTotalPages = parseInt(pageData.totalPages, 10) || 1;
          } else if (pageData.pageable && pageData.pageable.totalPages !== undefined) {
            extractedTotalPages = parseInt(pageData.pageable.totalPages, 10) || 1;
          } else if (extractedTotalElements > 0 && pageSize > 0) {
            // Calculate from totalElements if totalPages not found
            extractedTotalPages = Math.ceil(extractedTotalElements / pageSize);
          } else {
            extractedTotalPages = 1;
          }



          setTotalPages(extractedTotalPages);
          setTotalElements(extractedTotalElements);
        } else {
          console.warn('Unexpected response structure:', response);
          setProducts([]);
          setTotalPages(0);
          setTotalElements(0);
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
              {totalPages >= 1 && products.length > 0 && (
                <div className="mt-8">
                  {/* Page Info */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600">
                      Trang <span className="font-semibold text-gray-900">{currentPage + 1}</span> / <span className="font-semibold text-gray-900">{totalPages}</span>
                    </p>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {/* First Page Button */}
                    <Button
                      onClick={() => setCurrentPage(0)}
                      disabled={currentPage === 0}
                      variant="outline"
                      className="hidden sm:inline-flex"
                    >
                      Đầu
                    </Button>

                    {/* Previous Page Button */}
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      variant="outline"
                    >
                      <span className="hidden sm:inline">Trang trước</span>
                      <span className="sm:hidden">‹</span>
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex gap-2">
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 7;

                        if (totalPages <= maxVisiblePages) {
                          // Show all pages if total is small
                          for (let i = 0; i < totalPages; i++) {
                            pages.push(
                              <button
                                key={i}
                                onClick={() => setCurrentPage(i)}
                                className={`w-10 h-10 rounded-lg transition-all font-medium ${currentPage === i
                                  ? 'bg-primary-600 text-white shadow-md scale-110'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-primary-300'
                                  }`}
                              >
                                {i + 1}
                              </button>
                            );
                          }
                        } else {
                          // Show first page
                          pages.push(
                            <button
                              key={0}
                              onClick={() => setCurrentPage(0)}
                              className={`w-10 h-10 rounded-lg transition-all font-medium ${currentPage === 0
                                ? 'bg-primary-600 text-white shadow-md scale-110'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-primary-300'
                                }`}
                            >
                              1
                            </button>
                          );

                          // Show ellipsis or page 2
                          if (currentPage > 3) {
                            pages.push(
                              <span key="ellipsis-start" className="w-10 h-10 flex items-center justify-center text-gray-400">
                                ...
                              </span>
                            );
                          } else if (totalPages > 1) {
                            pages.push(
                              <button
                                key={1}
                                onClick={() => setCurrentPage(1)}
                                className={`w-10 h-10 rounded-lg transition-all font-medium ${currentPage === 1
                                  ? 'bg-primary-600 text-white shadow-md scale-110'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-primary-300'
                                  }`}
                              >
                                2
                              </button>
                            );
                          }

                          // Show pages around current page
                          const startPage = Math.max(2, currentPage - 1);
                          const endPage = Math.min(totalPages - 2, currentPage + 1);

                          for (let i = startPage; i <= endPage; i++) {
                            if (i > 0 && i < totalPages - 1) {
                              pages.push(
                                <button
                                  key={i}
                                  onClick={() => setCurrentPage(i)}
                                  className={`w-10 h-10 rounded-lg transition-all font-medium ${currentPage === i
                                    ? 'bg-primary-600 text-white shadow-md scale-110'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-primary-300'
                                    }`}
                                >
                                  {i + 1}
                                </button>
                              );
                            }
                          }

                          // Show ellipsis or second to last page
                          if (currentPage < totalPages - 4) {
                            pages.push(
                              <span key="ellipsis-end" className="w-10 h-10 flex items-center justify-center text-gray-400">
                                ...
                              </span>
                            );
                          } else if (totalPages > 2 && endPage < totalPages - 2) {
                            pages.push(
                              <button
                                key={totalPages - 2}
                                onClick={() => setCurrentPage(totalPages - 2)}
                                className={`w-10 h-10 rounded-lg transition-all font-medium ${currentPage === totalPages - 2
                                  ? 'bg-primary-600 text-white shadow-md scale-110'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-primary-300'
                                  }`}
                              >
                                {totalPages - 1}
                              </button>
                            );
                          }

                          // Show last page
                          pages.push(
                            <button
                              key={totalPages - 1}
                              onClick={() => setCurrentPage(totalPages - 1)}
                              className={`w-10 h-10 rounded-lg transition-all font-medium ${currentPage === totalPages - 1
                                ? 'bg-primary-600 text-white shadow-md scale-110'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-primary-300'
                                }`}
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    {/* Next Page Button */}
                    <Button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                      disabled={currentPage === totalPages - 1}
                      variant="outline"
                    >
                      <span className="hidden sm:inline">Trang sau</span>
                      <span className="sm:hidden">›</span>
                    </Button>

                    {/* Last Page Button */}
                    <Button
                      onClick={() => setCurrentPage(totalPages - 1)}
                      disabled={currentPage === totalPages - 1}
                      variant="outline"
                      className="hidden sm:inline-flex"
                    >
                      Cuối
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
