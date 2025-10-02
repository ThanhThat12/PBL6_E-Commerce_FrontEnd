// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import SellerDashboardPage from "./pages/Seller/SellerDashboardPage.jsx";
import { CustomersPage } from "./pages/Seller/CustomersPage.jsx";
import CategoriesPage from "./pages/Seller/CategoriesPage.jsx";
import ProfilePage from "./pages/Seller/ProfilePage.jsx";
import CouponPage from "./pages/Seller/CouponPage.jsx";

function App() {
  return (
    // Bọc toàn bộ app trong GoogleOAuthProvider
    <GoogleOAuthProvider clientId="675831796221-gv53a00leksrq5f08lbds5kej9jjlm4q.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
          <Route path="/seller/customers" element={<CustomersPage />} />
          <Route path="/seller/categories" element={<CategoriesPage />} />
          <Route path="/seller/coupons" element={<CouponPage />} />
          <Route path="/seller/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
