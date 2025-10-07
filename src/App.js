import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import ForgotPasswordPage from "./pages/Customer/ForgotPasswordPage";
import RegisterPage from "./pages/Customer/RegisterPage";
import LoginPage from "./pages/Customer/LoginPage";
import HomePage from "./pages/Customer/HomePage";
import WishlistPage from "./pages/Customer/WishlistPage";
import CartPage from "./pages/Customer/CartPage";
import CheckoutPage from "./pages/Customer/CheckoutPage";
import ProductByCategoryPage from "./pages/Customer/ProductByCategoryPage";
import AccountPage from "./pages/Customer/AccountPage";
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
          </Routes>
        </Router>
      </GoogleOAuthProvider>
    </UserProvider>
  );
}

export default App;