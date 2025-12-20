import React, { useState, useEffect } from "react";
import usePendingOrderCleanup from "../../hooks/usePendingOrderCleanup";
import Navbar from "../../components/common/Navbar";
import HeroSection from "../../components/feature/home/HeroSection";
import CategorySection from "../../components/feature/home/CategorySection";
import FlashDeals from "../../components/feature/home/FlashDeals";
import FeaturedProducts from "../../components/feature/home/FeaturedProducts";
import BrandShowcase from "../../components/feature/home/BrandShowcase";
import ServiceFeatures from "../../components/feature/tab/ServiceFeatures";
import ButtonUp from "../../components/ui/buttonUp/ButtonUp";
import Footer from "../../components/layout/footer/Footer";
import { getCategories, getFeaturedProducts, getBestSellingProducts } from "../../services/homeService";
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
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch data từ backend API
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch tất cả data song song
        const [categoriesData, featuredData, flashDealsData] = await Promise.all([
          getCategories(),
          getFeaturedProducts(8),
          getBestSellingProducts(8), // Flash deals = best sellers
        ]);

        setCategories(categoriesData);
        setFeaturedProducts(featuredData);
        setFlashDeals(flashDealsData);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

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
            
            {/* Flash Deals Skeleton */}
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-4 shadow-soft space-y-3">
                    <div className="h-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>

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
            {/* Hero Banner Section */}
            <HeroSection autoPlayInterval={5000} />

            {/* Flash Deals Section */}
            <FlashDeals 
              products={flashDeals}
              title="⚡ Deals Hôm Nay"
            />

            {/* Category Section */}
            <CategorySection 
              categories={categories}
              title="Danh Mục Thể Thao"
            />

            {/* Featured Products Section */}
            <FeaturedProducts 
              products={featuredProducts}
              title="Sản Phẩm Nổi Bật"
            />

            {/* Service Features */}
            <ServiceFeatures />

            {/* Brand Showcase Section */}
            <BrandShowcase title="Thương Hiệu Đối Tác" />

            {/* Newsletter Section */}
            <section className="py-12">
              <div className="bg-gradient-primary rounded-2xl p-8 md:p-12 text-center shadow-colored-primary">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Đăng Ký Nhận Tin Khuyến Mãi
                </h3>
                <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                  Nhận ngay voucher 100.000₫ và cập nhật các chương trình ưu đãi độc quyền
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none"
                  />
                  <button className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                    Đăng Ký
                  </button>
                </div>
              </div>
            </section>
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