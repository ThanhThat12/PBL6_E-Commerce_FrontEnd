import React, { useState, useEffect } from "react";
import usePendingOrderCleanup from "../../hooks/usePendingOrderCleanup";
import Navbar from "../../components/common/Navbar";
import HeroSection from "../../components/feature/home/HeroSection";
import CategorySection from "../../components/feature/home/CategorySection";
import FlashDeals from "../../components/feature/home/FlashDeals";
import FeaturedProducts from "../../components/feature/home/FeaturedProducts";
import VoucherSection from "../../components/feature/home/VoucherSection";
import TopRatedProducts from "../../components/feature/home/TopRatedProducts";
import BrandShowcase from "../../components/feature/home/BrandShowcase";
import ServiceFeatures from "../../components/feature/tab/ServiceFeatures";
import ButtonUp from "../../components/ui/buttonUp/ButtonUp";
import Footer from "../../components/layout/footer/Footer";
import { 
  getCategories, 
  getFeaturedProducts, 
  getBestSellingProducts,
  getPlatformVouchers,
  getTopRatedProducts
} from "../../services/homeService";
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
  const [platformVouchers, setPlatformVouchers] = useState([]);
  const [topRatedProducts, setTopRatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const [
          categoriesData, 
          featuredData, 
          flashDealsData,
          vouchersData,
          topRatedData
        ] = await Promise.all([
          getCategories(),
          getFeaturedProducts(8),
          getBestSellingProducts(8), // Flash deals = best sellers
          getPlatformVouchers(12), // Tăng lên 12 vouchers cho tuần
          getTopRatedProducts(10)
        ]);

        setCategories(categoriesData);
        setFeaturedProducts(featuredData);
        setFlashDeals(flashDealsData);
        setPlatformVouchers(vouchersData);
        setTopRatedProducts(topRatedData);
      } catch (error) {
        console.error("Failed to load homepage data:", error);
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

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      ) : (
        <main>
          <div className="max-w-7xl mx-auto px-4 space-y-8 md:space-y-12">
            {/* 1. Hero Banner Section */}
            <HeroSection autoPlayInterval={5000} />

            {/* 2. Category Grid */}
            <CategorySection 
              categories={categories}
              title="Danh Mục Thể Thao"
            />

            {/* 3. Voucher giảm giá sàn phát trong tuần */}
            <VoucherSection 
              vouchers={platformVouchers}
              title="🎁 Voucher Giảm Giá Sàn - Tuần Này"
              subtitle="Săn ngay voucher độc quyền! Giảm giá khủng chỉ có trong tuần"
            />

            {/* 4. Sản phẩm bán chạy (Flash Deals) */}
            <FlashDeals 
              products={flashDeals}
              title="🔥 Sản Phẩm Bán Chạy"
            />

            {/* 5. Sản phẩm đánh giá cao */}
            <TopRatedProducts 
              products={topRatedProducts}
              title="⭐ Sản Phẩm Đánh Giá Cao"
            />

            {/* 7. Sản phẩm nổi bật */}
            <FeaturedProducts 
              products={featuredProducts}
              title="✨ Sản Phẩm Nổi Bật"
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