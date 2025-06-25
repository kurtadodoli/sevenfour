// client/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { SidebarProvider } from './context/SidebarContext';
import { StockProvider } from './context/StockContext';
import { ToastProvider } from './components/Toast';
import { ToastContainer } from 'react-toastify';
import logoImg from './assets/images/sfc-logo-white.png'; // Import your logo
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'react-toastify/dist/ReactToastify.css'; // Import React Toastify CSS

// Route components
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';
import { PrivateRoute } from './components/PrivateRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage'; // Changed from ProductDetailPage
import CheckoutPage from './pages/CheckoutPage';
import DashboardPage from './pages/DashboardPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import UsersPage from './pages/UsersPage';
import MaintenancePage from './pages/MaintenancePage';
import StatusPage from './pages/StatusPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage'; // Import ProfilePage
import AboutPage from './pages/AboutPage'; // Import AboutPage
import InventoryPage from './pages/InventoryPage'; // Import InventoryPage
import OrderPage from './pages/OrderPage'; // Import OrderPage
import TrackingPage from './pages/TrackingPage'; // Import TrackingPage
import ShippingPage from './pages/ShippingPage'; // Import ShippingPage
import HelpPage from './pages/HelpPage'; // Import HelpPage
import DeliveryPage from './pages/DeliveryPage'; // Import DeliveryPage
import SearchPage from './pages/SearchPage'; // Import SearchPage
import CustomPage from './pages/CustomPage'; // Import CustomPage

import TransactionPage from './pages/TransactionPage'; // Import TransactionPage
import DebugTransactionPage from './pages/DebugTransactionPage'; // Import DebugTransactionPage
import RegistrationPage from './pages/RegistrationPage'; // Import RegistrationPage

// Components
import Footer from './components/Footer';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';

// CSS
import './App.css';
import styled from 'styled-components';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
`;

const MainContent = styled.main`
  position: fixed;
  top: 60px; // Account for TopBar height
  left: 0; // Full width - sidebar will overlay
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
  background: #ffffff; // White background to match page content
`;

const Layout = () => {  
  return (
    <>
      <Sidebar />
      <TopBar />
      <MainContent>
        <Routes>          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/custom" element={<CustomPage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/status" element={<StatusPage />} /> {/* New diagnostic page */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
            {/* Protected Routes - Customer */}          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/orders" element={<OrderPage />} />
          </Route>
          
          {/* Protected Routes - Staff & Admin */}
          <Route element={<StaffRoute />}>
            <Route path="/staff" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
          </Route>
          
          {/* Protected Routes - Admin Only */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />            <Route path="/admin/products" element={<MaintenancePage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/registration" element={<RegistrationPage />} />
            <Route path="/transactions" element={<TransactionPage />} />
            <Route path="/debug-transactions" element={<DebugTransactionPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Route>
          
          {/* Additional Routes */}
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tracking" element={<TrackingPage />} />
          <Route path="/shipping" element={<ShippingPage />} />        </Routes>
      </MainContent>
      <Footer />
    </>
  );
};

function App() {
  // Function to set favicon and title dynamically
  useEffect(() => {
    // Set page title
    document.title = "Seven Four Clothing";
    // Create favicon link
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = logoImg;
    favicon.type = 'image/png';
    // Remove any existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      document.head.removeChild(existingFavicon);
    }
    // Add the new favicon
    document.head.appendChild(favicon);
  }, []);  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SidebarProvider>
              <StockProvider>
                <ToastProvider>
                  <AppWrapper>
                    <Layout />
                  </AppWrapper>
                </ToastProvider>
              </StockProvider>
            </SidebarProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Router>
  );
}

export default App;