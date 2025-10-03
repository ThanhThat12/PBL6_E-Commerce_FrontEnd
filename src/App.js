import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import WishlistPage from "./pages/WishlistPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProductByCategoryPage from "./pages/ProductByCategoryPage";
import AccountPage from "./pages/AccountPage";

function App() {
  return (
    // Bọc toàn bộ app trong GoogleOAuthProvider
    <GoogleOAuthProvider clientId="675831796221-gv53a00leksrq5f08lbds5kej9jjlm4q.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/products" element={<ProductByCategoryPage />} /> {/* Add this line */}
          <Route path="/profile" element={<AccountPage />} /> {/* Add this line */}
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
