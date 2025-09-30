import React, { useState, useEffect } from "react";
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
import Navbar from "../components/layout/header/navbar";
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
    <main className="min-h-screen bg-gray-100 flex flex-col gap-8 pt-8">
      <div className="container mx-auto px-4 flex flex-col gap-8">
        <Navbar />
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
      {showButton && <ButtonUp onClick={handleScrollToTop} />}
      <Footer />
    </main>
  );
};

export default HomePage;