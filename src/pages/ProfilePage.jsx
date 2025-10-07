
import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import Roadmap from "../components/common/Roadmap";
import Footer from "../components/layout/footer/Footer";
import Navigation from "../components/common/Navigation";
import DashboardContent from "../components/feature/profile/DashboardContent/DashboardContent";
import OrderHistoryContent from "../components/feature/profile/OrderHistoryContent/OrderHistoryContent";
import WishlistContent from "../components/feature/profile/WishlistContent/WishlistContent";
import ShoppingCartContent from "../components/feature/profile/ShoppingCartContent/ShoppingCartContent";
import SettingsContent from "../components/feature/profile/SettingsContent/SettingsContent";
import LogoutContent from "../components/feature/profile/LogoutContent/LogoutContent";
import OrderDetails from "../components/feature/profile/OrderDetails/OrderDetails";
import "./AccountPage.css";

export default function ProfilePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Handler for viewing order details
  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setShowOrderDetails(true);
  };

  // Handler for going back to order list
  const handleBackToList = () => {
    setShowOrderDetails(false);
    setSelectedOrderId(null);
  };

  let content = null;
  if (activeIndex === 1) {
    // Order History tab
    content = showOrderDetails ? (
      <OrderDetails orderId={selectedOrderId} onBack={handleBackToList} />
    ) : (
      <OrderHistoryContent onViewDetails={handleViewDetails} />
    );
  } else {
    const contentComponents = [
      DashboardContent,
      null, // OrderHistory handled above
      WishlistContent,
      ShoppingCartContent,
      SettingsContent,
      LogoutContent,
    ];
    const ActiveContent = contentComponents[activeIndex];
    content = ActiveContent
      ? <ActiveContent onViewDetails={handleViewDetails} />
      : null;
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col gap-8">
      <Navbar />
      <div className="container mx-auto px-4 flex flex-col gap-8">
        <Roadmap items={[
          { label: "Home", href: "/" },
          { label: "Account", active: true }
        ]} />
        <div className="profile-layout">
          <Navigation activeIndex={activeIndex} onItemClick={(idx) => {
            setActiveIndex(idx);
            setShowOrderDetails(false); // Reset details view when switching tabs
          }} />
          <div className="profile-content">
            {content}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
