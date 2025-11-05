
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import SellerDashboardPage from "./pages/Seller/SellerDashboardPage.jsx";
import { CustomersPage } from "./pages/Seller/CustomersPage.jsx";
import CategoriesPage from "./pages/Seller/CategoriesPage.jsx";
import ProfilePage from "./pages/Seller/ProfilePage.jsx";
import CouponPage from "./pages/Seller/CouponPage.jsx";
import OrdersPage from "./pages/Seller/OrdersPage.jsx";
import AddProductPage from "./pages/Seller/AddProductPage.jsx";
import MyShopPage from "./pages/Seller/MyShopPage.jsx";
import StatisticalPage from "./pages/Seller/StatisticalPage.jsx";
import ProductListPage from "./pages/Seller/ProductListPage.jsx";

// Customer pages
import HomePage from "./pages/Customer/HomePage.jsx";
import WishlistPage from "./pages/Customer/WishlistPage.jsx";
import CartPage from "./pages/Customer/CartPage.jsx";
import CheckoutPage from "./pages/Customer/CheckoutPage.jsx";
import ProductByCategoryPage from "./pages/Customer/ProductByCategoryPage.jsx";
import AccountPage from "./pages/Customer/AccountPage.jsx";


function App() {
  return (
    // Bọc toàn bộ app trong GoogleOAuthProvider và AuthProvider
    <GoogleOAuthProvider clientId="675831796221-gv53a00leksrq5f08lbds5kej9jjlm4q.apps.googleusercontent.com">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Customer routes */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/products" element={<ProductByCategoryPage />} />
            <Route path="/profile" element={<AccountPage />} />
          
            {/* Protected Seller routes - Yêu cầu role = 1 (SELLER) */}
            <Route 
              path="/seller/dashboard" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <SellerDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/customers" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <CustomersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/categories" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <CategoriesPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/coupons" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <CouponPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/orders" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <OrdersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/add-products" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <AddProductPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/product-list" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <ProductListPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/my-shop" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <MyShopPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/statisticals" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <StatisticalPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/profile" 
              element={
                <ProtectedRoute requiredRole={1}>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
