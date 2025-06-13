// client/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import logoImg from './assets/images/sfc-logo-white.png'; // Import your logo
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// Route components
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';
import { PrivateRoute } from './components/PrivateRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
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
import OrdersPage from './pages/OrdersPage'; // Import OrdersPage
import TrackingPage from './pages/TrackingPage'; // Import TrackingPage
import ShippingPage from './pages/ShippingPage'; // Import ShippingPage
import HelpPage from './pages/HelpPage'; // Import HelpPage

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import TopBar from './components/TopBar';

// CSS
import './App.css';
import styled from 'styled-components';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  margin-top: 60px; // Add top margin to account for fixed TopBar
  flex: 1;
`;

const AppLayout = styled.div`
  position: relative;
  width: 100%;
`;

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
  }, []);

  return (
    <Router>
      <AuthProvider>
        <AppWrapper>
          <TopBar />
          <MainContent>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/status" element={<StatusPage />} /> {/* New diagnostic page */}
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Protected Routes - Customer */}
              <Route element={<PrivateRoute />}>
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
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
                <Route path="/admin/settings" element={<SettingsPage />} />
                <Route path="/admin/products" element={<MaintenancePage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
              </Route>
              
              {/* Additional Routes */}
              <Route path="/help" element={<HelpPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/tracking" element={<TrackingPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
            </Routes>
          </MainContent>
        </AppWrapper>
      </AuthProvider>
    </Router>
  );
}

export default App;