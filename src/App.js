import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import ForgotPasswordPage from "./pages/customer/ForgotPasswordPage";
import RegisterPage from "./pages/customer/RegisterPage";
import LoginPage from "./pages/customer/LoginPage";
import HomePage from "./pages/customer/HomePage";
import WishlistPage from "./pages/customer/WishlistPage";
import CartPage from "./pages/customer/CartPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import ProductByCategoryPage from "./pages/customer/ProductByCategoryPage";
import AccountPage from "./pages/customer/AccountPage";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentFailed from "./pages/payment/PaymentFailed";
import PaymentError from "./pages/payment/PaymentError";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <UserProvider>
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
            <Route path="/products" element={<ProductByCategoryPage />} />
            <Route path="/profile" element={<AccountPage />} />
            
            {/* Payment Status Pages */}
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            <Route path="/payment/error" element={<PaymentError />} />
          </Routes>
        </Router>
      </GoogleOAuthProvider>
    </UserProvider>
  );
}

export default App;
