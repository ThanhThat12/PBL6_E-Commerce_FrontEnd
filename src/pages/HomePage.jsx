import React, { useState, useEffect } from "react";
import colorPattern from "../styles/colorPattern";
import CategoryBrowser from "../components/feature/tab/CategoryBrowser";
import FlashSaleSection from "../components/feature/tab/FlashSaleSection";
import NewArrivalSection from "../components/feature/tab/NewArrivalSection";
import ProductExplorer from "../components/feature/tab/ProductExplorer";
import ServiceFeatures from "../components/feature/tab/ServiceFeatures";
import PromoBanner from "../components/feature/banner/PromoBanner";
import CategoryList from "../components/feature/category/CategoryList";
import ButtonUp from "../components/ui/buttonUp/ButtonUp";
import Footer from "../components/layout/footer/Footer";
import BestSellerSection from "../components/feature/tab/BestSellerSection";
import Navbar from "../components/common/Navbar";
const HomePage = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main style={{ minHeight: '100vh', background: colorPattern.background, color: colorPattern.text }}>
      <Navbar />
      <div className="flex flex-col gap-8 pt-8" style={{ width: '100%', maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="md:w-1/4 w-full flex items-start">
            <CategoryList />
          </div>
          <div className="md:w-3/4 w-full flex items-center">
            <PromoBanner />
          </div>
        </div>
        <FlashSaleSection />
        <CategoryBrowser />
        <BestSellerSection />
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