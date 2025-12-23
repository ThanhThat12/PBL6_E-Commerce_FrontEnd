import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import usePendingOrderCleanup from "../../hooks/usePendingOrderCleanup";
import Navbar from "../../components/common/Navbar";
import HeroSection from "../../components/feature/home/HeroSection";
import VoucherSection from "../../components/feature/home/VoucherSection";
import CategorySection from "../../components/feature/home/CategorySection";
import FeaturedProducts, { ProductCard as FeaturedProductCard } from "../../components/feature/home/FeaturedProducts";
import ButtonUp from "../../components/ui/buttonUp/ButtonUp";
import Footer from "../../components/layout/footer/Footer";
import { getCategories, getAllProductsPage, getPlatformVouchers, getBestSellingProducts, getTopRatedProducts } from "../../services/homeService";
// Note: useAuth and getNewArrivals available but not currently used

/**
 * HomePage - Trang chủ sàn thương mại đồ thể thao  
 * Load dữ liệu thật từ backend API
 * Sử dụng Tailwind colors theo config
 */
const HomePage = () => {
  const [showButton, setShowButton] = useState(false);

  // Cleanup pending MoMo orders when user returns to homepage
  usePendingOrderCleanup();

  // State cho data từ API
  const [categories, setCategories] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state for "Tất Cả Sản Phẩm"
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle smooth scroll to section when hash is present in URL
  useEffect(() => {
    // Wait for content to load before scrolling
    if (!loading && window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove '#' from hash
      const element = document.getElementById(hash);
      if (element) {
        // Small delay to ensure DOM is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [loading]); // Run when loading changes to false

  // Fetch static homepage data: categories + vouchers + best-selling + top-rated products
  useEffect(() => {
    const fetchStaticHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [categoriesData, vouchersData, bestSellingData, topRatedData] = await Promise.all([
          getCategories(),
          getPlatformVouchers(8),
          getBestSellingProducts(8),
          getTopRatedProducts(8), // Get top-rated products (min 4 stars)
        ]);

        setCategories(categoriesData);
        setVouchers(vouchersData);
        setBestSellingProducts(bestSellingData);
        setTopRatedProducts(topRatedData);
      } catch (err) {
        console.error('Failed to load homepage static data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchStaticHomeData();
  }, []);

  // Fetch paginated products for "Tất Cả Sản Phẩm"
  useEffect(() => {
    const fetchPagedProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getAllProductsPage(currentPage, 20);
        setAllProducts(result.items);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error('Failed to load paginated products:', err);
        setError('Không thể tải danh sách sản phẩm. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchPagedProducts();
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Navbar */}
      <Navbar isHomePage={true} />

      {/* Loading State - Skeleton */}
      {loading && (
        <main className="w-full">
          <div className="container mx-auto px-4 lg:px-8 py-6 space-y-8">
            {/* Hero Skeleton */}
            <div className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
            
            {/* Categories Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>
      )}

      {/* Error State */}
      {error && !loading && (
        <main className="w-full">
          <div className="container mx-auto px-4 lg:px-8 py-24">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không thể tải trang chủ</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold shadow-colored-primary"
              >
                Thử lại
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Main Content */}
      {!loading && (
        <main className="w-full">
          <div className="container mx-auto px-4 lg:px-8 py-6">
            <HeroSection autoPlayInterval={5000} />
            
            {/* Voucher Sàn - Nổi bật ngay sau banner */}
            <div id="vouchers">
              <VoucherSection 
                vouchers={vouchers}
                title="Voucher Sàn - Ưu Đãi Hot"
              />
            </div>
            
            <div id="categories">
              <CategorySection 
                categories={categories}
                title="Danh Mục Sản Phẩm"
              />
            </div>

            {/* Sản Phẩm Bán Chạy */}
            <div id="best-selling">
              <FeaturedProducts 
                products={bestSellingProducts}
                title="Sản Phẩm Bán Chạy"
              />
            </div>

            {/* Sản Phẩm Nổi Bật (Top-Rated >= 4 stars) */}
            <div id="top-rated">
              <FeaturedProducts 
                products={topRatedProducts}
                title="Sản Phẩm Được Đánh Giá Cao"
              />
            </div>

            {allProducts.length > 0 && (
              <section className="py-8 md:py-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl md:text-2xl font-bold text-text-primary">
                    Tất Cả Sản Phẩm
                  </h2>
                  <Link
                    to="/products"
                    className="hidden md:inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors no-underline"
                  >
                    Xem toàn bộ
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
                  {allProducts.map((product) => (
                    <FeaturedProductCard key={product.id} product={product} showDiscount />
                  ))}
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                      disabled={currentPage === 0}
                      className="px-3 py-1 text-sm rounded border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>

                    <span className="text-sm text-gray-600">
                      Trang {currentPage + 1} / {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
                      disabled={currentPage >= totalPages - 1}
                      className="px-3 py-1 text-sm rounded border border-gray-300 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                )}

                {/* Mobile: link xem toàn bộ trang /products */}
                <div className="mt-6 md:hidden text-center">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors no-underline"
                  >
                    Xem toàn bộ sản phẩm
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </section>
            )}
          </div>
        </main>
      )}

      {/* Scroll to Top Button */}
      <ButtonUp onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} show={showButton} />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
