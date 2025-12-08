import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';

import Navbar from '../../components/common/Navbar';
import Footer from '../../components/layout/footer/Footer';
import ProductCard from '../../components/product/ProductCard';
import ProductFilter from '../../components/product/ProductFilter';
import NoResultsFound from '../../components/product/NoResultsFound';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { getProducts, searchProducts } from '../../services/productService';
import { getCategories } from '../../services/homeService';
import { getFacetedFilters, trackSearch, trackSearchClick, searchShops } from '../../services/searchService';
import ShopCard from '../../components/shop/ShopCard';
import useCart from '../../hooks/useCart';

/**
 * ProductListPage
 * Display products with filters, search, pagination
 */
const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const _navigate = useNavigate(); // eslint-disable-line no-unused-vars
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
  const [searchQuery, setSearchQuery] = useState(searchParams.get('keyword') || '');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [sortBy, setSortBy] = useState('newest'); // name, price-asc, price-desc, newest

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, _setPageSize] = useState(12); // eslint-disable-line no-unused-vars

  // Faceted filters
  const [facets, setFacets] = useState(null);
  const [facetsLoading, setFacetsLoading] = useState(false);

  // Shop search results
  const [matchingShops, setMatchingShops] = useState([]);
  const [shopsLoading, setShopsLoading] = useState(false);

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

  // Load faceted filters
  useEffect(() => {
    const loadFacets = async () => {
      setFacetsLoading(true);
      try {
        const facetData = await getFacetedFilters({
          keyword: searchQuery,
          categoryId: filters.categoryId,
          minPrice: filters.priceMin,
          maxPrice: filters.priceMax,
          minRating: filters.minRating
        });
        setFacets(facetData);
      } catch (error) {
        console.error('Failed to load facets:', error);
      } finally {
        setFacetsLoading(false);
      }
    };
    loadFacets();
  }, [searchQuery, filters.categoryId, filters.priceMin, filters.priceMax, filters.minRating]);

  // Load matching shops when search query changes
  useEffect(() => {
    const loadMatchingShops = async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        setMatchingShops([]);
        return;
      }
      
      setShopsLoading(true);
      try {
        const shops = await searchShops(searchQuery, 5);
        setMatchingShops(shops);
      } catch (error) {
        console.error('Failed to load matching shops:', error);
        setMatchingShops([]);
      } finally {
        setShopsLoading(false);
      }
    };
    
    loadMatchingShops();
  }, [searchQuery]);

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
    setSearchParams(searchQuery ? { keyword: searchQuery } : {});
    
    // Track search
    if (searchQuery.trim()) {
      trackSearch(searchQuery.trim(), 0);
    }
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
    if (searchQuery) params.keyword = searchQuery;
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
      // Track click if from search
      if (searchQuery) {
        trackSearchClick(searchQuery, product.id);
      }
      
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

  const handleWishlist = (_product) => {
    toast.info('Tính năng yêu thích đang phát triển!');
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Header */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                🎾 Sản Phẩm Thể Thao
              </h1>
              <p className="text-primary-100 text-lg max-w-2xl mx-auto mb-8">
                Khám phá bộ sưu tập phụ kiện thể thao chất lượng cao của chúng tôi
              </p>
              
              {/* Enhanced Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm sản phẩm..."
                      className="w-full pl-14 pr-4 py-4 text-lg border-0 rounded-xl shadow-lg focus:ring-4 focus:ring-primary-300 transition-all"
                    />
                  </div>
                  <Button type="submit" variant="secondary" className="px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
                    Tìm kiếm
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <div className="w-72 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <ProductFilter
                  categories={categories}
                  filters={filters}
                  facets={facets}
                  facetsLoading={facetsLoading}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-xl">
                      <span className="text-primary-600 font-bold text-lg">{totalElements}</span>
                      <span className="text-gray-600 text-sm">sản phẩm</span>
                    </div>
                    {(filters.categoryId || filters.priceMin || filters.priceMax || searchQuery) && (
                      <button
                        onClick={handleClearFilters}
                        className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1 hover:underline"
                      >
                        ✕ Xóa bộ lọc
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 font-medium">Sắp xếp:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      >
                        <option value="newest">Mới nhất</option>
                        <option value="name">Tên A-Z</option>
                        <option value="price-asc">Giá: Thấp → Cao</option>
                        <option value="price-desc">Giá: Cao → Thấp</option>
                      </select>
                    </div>

                    {/* View Mode */}
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-white text-primary-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <FiGrid className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2.5 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-primary-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <FiList className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Matching Shops Section */}
              {searchQuery && matchingShops.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-1 h-6 bg-primary-500 rounded-full"></span>
                      Shop liên quan ({matchingShops.length})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {shopsLoading ? (
                      <div className="col-span-2 flex items-center justify-center py-8">
                        <Loading size="sm" text="Đang tải shop..." />
                      </div>
                    ) : (
                      matchingShops.map((shop) => (
                        <ShopCard key={shop.id} shop={shop} />
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Products Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <Loading size="lg" text="Đang tải sản phẩm..." />
                    <p className="mt-4 text-gray-500">Vui lòng chờ trong giây lát...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <NoResultsFound 
                  searchQuery={searchQuery}
                  onClearFilters={handleClearFilters}
                />
              ) : (
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
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
                <div className="mt-10">
                  {/* Page Info */}
                  <div className="text-center mb-6">
                    <span className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-gray-100">
                      <span className="text-gray-500">Trang</span>
                      <span className="font-bold text-primary-600 text-lg">{currentPage + 1}</span>
                      <span className="text-gray-500">/</span>
                      <span className="font-bold text-gray-700 text-lg">{totalPages}</span>
                    </span>
                  </div>

                  {/* Pagination Controls */}
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    {/* First Page Button */}
                    <Button
                      onClick={() => setCurrentPage(0)}
                      disabled={currentPage === 0}
                      variant="outline"
                      className="hidden sm:inline-flex px-4 py-2.5 rounded-xl font-medium"
                    >
                      « Đầu
                    </Button>

                    {/* Previous Page Button */}
                    <Button
                      onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                      variant="outline"
                      className="px-4 py-2.5 rounded-xl font-medium"
                    >
                      <span className="hidden sm:inline">← Trước</span>
                      <span className="sm:hidden">‹</span>
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex gap-1">
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
                                className={`w-11 h-11 rounded-xl transition-all duration-300 font-semibold ${currentPage === i
                                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-110'
                                  : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-300'
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
                              className={`w-11 h-11 rounded-xl transition-all duration-300 font-semibold ${currentPage === 0
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-110'
                                : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-300'
                                }`}
                            >
                              1
                            </button>
                          );

                          // Show ellipsis or page 2
                          if (currentPage > 3) {
                            pages.push(
                              <span key="ellipsis-start" className="w-11 h-11 flex items-center justify-center text-gray-400 font-bold">
                                •••
                              </span>
                            );
                          } else if (totalPages > 1) {
                            pages.push(
                              <button
                                key={1}
                                onClick={() => setCurrentPage(1)}
                                className={`w-11 h-11 rounded-xl transition-all duration-300 font-semibold ${currentPage === 1
                                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-110'
                                  : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-300'
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
                                  className={`w-11 h-11 rounded-xl transition-all duration-300 font-semibold ${currentPage === i
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-110'
                                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-300'
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
                              <span key="ellipsis-end" className="w-11 h-11 flex items-center justify-center text-gray-400 font-bold">
                                •••
                              </span>
                            );
                          } else if (totalPages > 2 && endPage < totalPages - 2) {
                            pages.push(
                              <button
                                key={totalPages - 2}
                                onClick={() => setCurrentPage(totalPages - 2)}
                                className={`w-11 h-11 rounded-xl transition-all duration-300 font-semibold ${currentPage === totalPages - 2
                                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-110'
                                  : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-300'
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
                              className={`w-11 h-11 rounded-xl transition-all duration-300 font-semibold ${currentPage === totalPages - 1
                                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-110'
                                : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 border border-gray-200 hover:border-primary-300'
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
                      className="px-4 py-2.5 rounded-xl font-medium"
                    >
                      <span className="hidden sm:inline">Sau →</span>
                      <span className="sm:hidden">›</span>
                    </Button>

                    {/* Last Page Button */}
                    <Button
                      onClick={() => setCurrentPage(totalPages - 1)}
                      disabled={currentPage === totalPages - 1}
                      variant="outline"
                      className="hidden sm:inline-flex px-4 py-2.5 rounded-xl font-medium"
                    >
                      Cuối »
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
