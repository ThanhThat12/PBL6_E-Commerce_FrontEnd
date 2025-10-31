import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { ROUTES, GOOGLE_CLIENT_ID } from './utils/constants';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Homepage from './pages/public/Homepage';


// Product Pages
import ProductListPage from './pages/products/ProductListPage';
import ProductDetailPage from './pages/products/ProductDetailPage';

// Cart Page
import CartPage from './pages/cart/CartPage';

// Order Pages
import { CheckoutPage, OrderListPage, OrderDetailPage } from './pages/order';

// User Pages
import ProfilePage from './pages/user/ProfilePage';
import AddressManagementPage from './pages/user/AddressManagementPage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';

import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <OrderProvider>
            <Routes>
              {/* Public Routes */}
              <Route path={ROUTES.HOME} element={<Homepage />} />
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
              
              {/* Product Routes (Public) */}
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              
              
              {/* Protected Routes */}
              <Route 
                path="/cart" 
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Order Routes */}
              <Route 
                path="/checkout" 
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <OrderListPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders/:orderId" 
                element={
                  <ProtectedRoute>
                    <OrderDetailPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile/addresses" 
                element={
                  <ProtectedRoute>
                    <AddressManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/profile/change-password" 
                element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all redirect to home */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
            
            {/* React Hot Toast */}
            <Toaster 
              position="top-right"
              reverseOrder={false}
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            {/* Toast Notifications (react-toastify) */}
            <ToastContainer 
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
            </OrderProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;