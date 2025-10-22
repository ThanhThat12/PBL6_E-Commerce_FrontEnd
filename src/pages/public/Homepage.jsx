import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import Navbar from "../../components/common/Navbar";
import HeroSection from "../../components/feature/home/HeroSection";
import CategorySection from "../../components/feature/home/CategorySection";
import FlashDeals from "../../components/feature/home/FlashDeals";
import FeaturedProducts from "../../components/feature/home/FeaturedProducts";
import BrandShowcase from "../../components/feature/home/BrandShowcase";
import ServiceFeatures from "../../components/feature/tab/ServiceFeatures";
import ButtonUp from "../../components/ui/buttonUp/ButtonUp";
import Footer from "../../components/layout/footer/Footer";
import { getCategories, getFeaturedProducts, getBestSellingProducts, getNewArrivals } from "../../services/homeService";

/**
 * HomePage - Trang chủ sàn thương mại đồ thể thao  
 * Load dữ liệu thật từ backend API
 * Sử dụng Tailwind colors theo config
 */
const HomePage = () => {
  const [showButton, setShowButton] = useState(false);
  const { user } = useAuth();

  // State cho data từ API
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
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
        
        // Fetch tất cả data song song
        const [categoriesData, featuredData, flashDealsData, newArrivalsData] = await Promise.all([
          getCategories(),
          getFeaturedProducts(8),
          getBestSellingProducts(8), // Flash deals = best sellers
          getNewArrivals(8)
        ]);

        console.log('📦 Homepage Data Loaded:');
        console.log('Categories:', categoriesData);
        console.log('Featured Products:', featuredData);
        console.log('Flash Deals:', flashDealsData);
        console.log('New Arrivals:', newArrivalsData);

        setCategories(categoriesData);
        setFeaturedProducts(featuredData);
        setFlashDeals(flashDealsData);
        setNewArrivals(newArrivalsData);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Navbar */}
      <Navbar />

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
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