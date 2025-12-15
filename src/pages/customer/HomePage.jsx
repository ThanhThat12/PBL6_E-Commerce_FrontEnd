import React, { useState, useEffect, useContext } from "react";
import { UserContext } from "../../context/UserContext";
// import useProducts from "../hooks/useProducts";
import colorPattern from "../../styles/colorPattern";
import CategoryBrowser from "../../components/feature/tab/CategoryBrowser";
import FlashSaleSection from "../../components/feature/tab/FlashSaleSection";
import NewArrivalSection from "../../components/feature/tab/NewArrivalSection";
import ProductExplorer from "../../components/feature/tab/ProductExplorer";
import ServiceFeatures from "../../components/feature/tab/ServiceFeatures";
import PromoBanner from "../../components/feature/banner/PromoBanner";
import CategoryList from "../../components/feature/category/CategoryList";
import ButtonUp from "../../components/ui/buttonUp/ButtonUp";
import Footer from "../../components/layout/footer/Footer";
import BestSellerSection from "../../components/feature/tab/BestSellerSection";
import VoucherSection from "../../components/feature/home/VoucherSection";
import Navbar from "../../components/common/Navbar";
import { getPlatformVouchers } from "../../services/homeService";

const HomePage = () => {
  const [showButton, setShowButton] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [voucherPage, setVoucherPage] = useState(0);
  const [voucherTotalPages, setVoucherTotalPages] = useState(1);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        console.log('🔄 Fetching vouchers for page:', voucherPage);
        const response = await getPlatformVouchers(8, voucherPage);
        console.log('📦 Response from getPlatformVouchers:', response);
        
        // Extract content array from response
        const voucherData = response.content || [];
        console.log('✅ Setting vouchers state to:', voucherData);
        console.log('✅ Vouchers count:', voucherData.length);
        
        setVouchers(voucherData); // Pass array, not object
        setVoucherTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error('❌ Error fetching vouchers:', error);
        setVouchers([]); // Set empty array on error
      }
    };
    fetchVouchers();
  }, [voucherPage]);

  const handleVoucherPageChange = (newPage) => {
    if (newPage >= 0 && newPage < voucherTotalPages) {
      setVoucherPage(newPage);
      // Scroll to voucher section
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  };

  // User context effect - kept for potential future use
  useEffect(() => {
    // User context available
  }, [user]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main style={{ minHeight: '100vh', background: colorPattern.background, color: colorPattern.text }}>
      <Navbar />
      <div className="flex flex-col gap-8 pt-8" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        {/* Hiển thị tên user nếu đã đăng nhập */}
        {user && user.username && (
          <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            Xin chào, {user.username}!
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="w-full flex items-center">
            <PromoBanner />
          </div>
        </div>
        <FlashSaleSection />
        {/* <CategoryBrowser /> */}
        <BestSellerSection />
        <VoucherSection 
          vouchers={vouchers}
          totalPages={voucherTotalPages}
          currentPage={voucherPage}
          onPageChange={handleVoucherPageChange}
        />
        <ProductExplorer />
        <NewArrivalSection />
        <ServiceFeatures />
      </div>
      <ButtonUp onClick={handleScrollToTop} show={showButton} />
      <Footer />
    </main>
  );
};

export default HomePage;