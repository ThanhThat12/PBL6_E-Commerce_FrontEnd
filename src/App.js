import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { NotificationProvider } from './context/NotificationContext';
import { ROUTES, GOOGLE_CLIENT_ID } from './utils/constants';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import Homepage from './pages/public/Homepage';
import PaymentPage from './pages/order/PaymentPage';
import PaymentResultPage from './pages/order/PaymentResultPage';

// Product Pages
import ProductListPage from './pages/products/ProductListPage';
import ProductDetailPage from './pages/products/ProductDetailPage';

// Shop Pages
import ShopDetailPage from './pages/shops/ShopDetailPage';

// Cart Page
import CartPage from './pages/cart/CartPage';

// Order Pages
import { CheckoutPage, OrderListPage, OrderDetailPage } from './pages/order';
import ItemReturnPage from './pages/order/ItemReturnPage';

// User Pages
import ProfilePage from './pages/user/ProfilePage';
import AddressManagementPage from './pages/user/AddressManagementPage';
import ChangePasswordPage from './pages/user/ChangePasswordPage';
import SellerRegistrationPage from './pages/user/SellerRegistrationPage';
import RegistrationStatusPage from './pages/user/RegistrationStatusPage';

import ProtectedRoute from './components/auth/ProtectedRoute';


// Chat Component
import { ChatContainer } from './components/chat';


// Chat Wrapper - Only show on authenticated pages
const ConditionalChatContainer = () => {
  const location = useLocation();
  
  // Hide chat on auth pages
  const hideChat = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    '/forgot-password',
    '/admin/login'
  ].some(route => location.pathname.startsWith(route));
  
  return !hideChat ? <ChatContainer /> : null;
};

// 🏪 Seller Pages & Components
import SellerProtectedRoute from './components/seller/ProtectedRoute';
import { SellerLayout } from './components/seller/Layout';
import * as SellerPages from './pages/seller';
import ReviewsPage from './pages/seller/Review';

// 🧑‍💼 Admin Pages
import ProtectedRouteAdmin from "./components/admin/ProtectedRouteAdmin";
import Dashboard from "./pages/admin/Dashboard/Dashboard"; 
import ProductsPage from "./pages/admin/Products/ProductsPage"; 
import OrdersPage from "./pages/admin/Orders/OrdersPage";
import CategoriesPage from "./pages/admin/Categories/CategoriesPage";
import Customers from "./pages/admin/Users/Customers";
import Sellers from "./pages/admin/Users/Sellers";
import Admins from "./pages/admin/Users/Admins";
import SettingsPage from "./pages/admin/Settings/SettingsPage";
import MyprofilePage from "./pages/admin/MyProfile/MyprofilePage";
import VouchersPage from "./pages/admin/Vouchers/VouchersPage";
import ChatPage from './pages/admin/Chat/ChatPage';
import WalletPage from './pages/admin/Wallet/WalletPage';
import SellerRegistrationsPage from "./pages/admin/SellerRegistrations/SellerRegistrationsPage";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
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
              
              {/* Shop Routes (Public) */}
              <Route path="/shops/:shopId" element={<ShopDetailPage />} />
              
              
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
                path="/payment" 
                element={
                  <ProtectedRoute>
                    <PaymentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/payment-result" 
                element={
                  <ProtectedRoute>
                    <PaymentResultPage />
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
                path="/return-order-item" 
                element={
                  <ProtectedRoute>
                    <ItemReturnPage />
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
              
            
            
            
            {/* ================= ADMIN ROUTES ================= */}
            <Route path="/admin" element={<ProtectedRouteAdmin><Dashboard /></ProtectedRouteAdmin>} />
            <Route path="/admin/dashboard" element={<ProtectedRouteAdmin><Dashboard /></ProtectedRouteAdmin >} />
            <Route path="/admin/products" element={<ProtectedRouteAdmin><ProductsPage /></ProtectedRouteAdmin>} />
            <Route path="/admin/orders" element={<ProtectedRouteAdmin><OrdersPage /></ProtectedRouteAdmin>} />
            <Route path="/admin/categories" element={<ProtectedRouteAdmin><CategoriesPage /></ProtectedRouteAdmin>} />
            <Route path="/admin/vouchers" element={<ProtectedRouteAdmin><VouchersPage /></ProtectedRouteAdmin>} />
            <Route path="/admin/users/customers" element={<ProtectedRouteAdmin><Customers /></ProtectedRouteAdmin>} />
            <Route path="/admin/users/sellers" element={<ProtectedRouteAdmin><Sellers /></ProtectedRouteAdmin>} />
            <Route path="/admin/users/admins" element={<ProtectedRouteAdmin><Admins /></ProtectedRouteAdmin>} />
            <Route path="/admin/seller-registrations" element={<ProtectedRouteAdmin><SellerRegistrationsPage /></ProtectedRouteAdmin>} />
            <Route path="/admin/myprofile" element={<ProtectedRouteAdmin><MyprofilePage /></ProtectedRouteAdmin>} />
            <Route path="/admin/chat" element={<ProtectedRouteAdmin><ChatPage/></ProtectedRouteAdmin>} />            
            <Route path="/admin/wallet" element={<ProtectedRouteAdmin><WalletPage /></ProtectedRouteAdmin>} />
            <Route path="/admin/settings" element={<ProtectedRouteAdmin><SettingsPage /></ProtectedRouteAdmin>} />
            {/* ================================================= */}

                        {/* ================= SELLER REGISTRATION ROUTES ================= */}
            <Route 
              path="/seller/register" 
              element={
                <ProtectedRoute>
                  <SellerRegistrationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller/registration-status" 
              element={
                <ProtectedRoute>
                  <RegistrationStatusPage />
                </ProtectedRoute>
              } 
            />
            {/* ============================================================= */}

            {/* ================= SELLER ROUTES ================= */}
            <Route 
              path="/seller" 
              element={
                <SellerProtectedRoute requiredRole="SELLER">
                  <SellerLayout />
                </SellerProtectedRoute>
              }
            >
              {/* Nested routes inside SellerLayout */}
              <Route index element={<SellerPages.Dashboard />} />
              <Route path="dashboard" element={<SellerPages.Dashboard />} />
              <Route path="products/list" element={<SellerPages.ProductList />} />
              <Route path="products/add" element={<SellerPages.AddProduct />} />
              <Route path="products/edit/:id" element={<SellerPages.EditProduct />} />
              <Route path="orders" element={<SellerPages.Orders />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="my-shop" element={<SellerPages.MyShop />} />
              <Route path="statistical" element={<SellerPages.Statistical />} />
              <Route path="customers" element={<SellerPages.Customers />} />
              <Route path="vouchers" element={<SellerPages.VoucherManagement />} />
              <Route path="refunds" element={<SellerPages.Refunds />} />
              <Route path="notifications" element={<SellerPages.Notifications />} />
            </Route>
            {/* ================================================= */}

              {/* Catch-all redirect to home - MUST BE LAST */}
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
            
            {/* Floating Chat Window (existing system) */}
            <ConditionalChatContainer />

            {/* Buyer Chatbot Floating Widget removed per request */}
              </OrderProvider>
            </CartProvider>
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;