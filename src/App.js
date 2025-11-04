// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";

// 🧍 Customer Pages
import ForgotPasswordPage from "./pages/customer/ForgotPasswordPage";
import RegisterPage from "./pages/customer/RegisterPage";
import LoginPage from "./pages/customer/LoginPage";
import HomePage from "./pages/customer/HomePage";
import WishlistPage from "./pages/customer/WishlistPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import ProductByCategoryPage from "./pages/customer/ProductByCategoryPage";
import AccountPage from "./pages/customer/AccountPage";

// 👥 Context
import { UserProvider } from "./context/UserContext";

// 🧑‍💼 Admin Pages
import LoginAdmin from "./pages/admin/LoginAdmin/LoginAdmin";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import Dashboard from "./pages/admin/Dashboard/Dashboard"; 
import ProductsPage from "./pages/admin/Products/ProductsPage"; 
import OrdersPage from "./pages/admin/Orders/OrdersPage";
import CategoriesPage from "./pages/admin/Categories/CategoriesPage";
import Customers from "./pages/admin/Users/Customers";
import Sellers from "./pages/admin/Users/Sellers";
import Admins from "./pages/admin/Users/Admins";
import SettingsPage from "./pages/admin/Settings/SettingsPage";
import MyprofilePage from "./pages/admin/MyProfile/MyprofilePage";

function App() {
  return (
    <UserProvider>
      <GoogleOAuthProvider clientId="675831796221-gv53a00leksrq5f08lbds5kej9jjlm4q.apps.googleusercontent.com">
        <Router>
          <Routes>
            {/* ================= CUSTOMER ROUTES ================= */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/products" element={<ProductByCategoryPage />} />
            <Route path="/profile" element={<AccountPage />} />

            {/* ================= ADMIN ROUTES ================= */}
            <Route path="/admin" element={<LoginAdmin />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute><CategoriesPage /></ProtectedRoute>} />
            <Route path="/admin/users/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/admin/users/sellers" element={<ProtectedRoute><Sellers /></ProtectedRoute>} />
            <Route path="/admin/users/admins" element={<ProtectedRoute><Admins /></ProtectedRoute>} />
            <Route path="/admin/myprofile" element={<ProtectedRoute><MyprofilePage /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            {/* ================================================= */}
          </Routes>
        </Router>
      </GoogleOAuthProvider>
    </UserProvider>
  );
}

export default App;
