import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import OrderStatusPage from './pages/OrderStatusPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import VendorsPage from './pages/admin/VendorsPage';
import OrdersPage from './pages/admin/OrdersPage';
import CustomersPage from './pages/admin/CustomersPage';
import PaymentsPage from './pages/admin/PaymentsPage';
import CommissionPage from './pages/admin/CommissionPage';
import ReportsPage from './pages/admin/ReportsPage';
import ComplaintsPage from './pages/admin/ComplaintsPage';
import SettingsPage from './pages/admin/SettingsPage';
import LogoutPage from './pages/admin/LogoutPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import HelpDeskPage from './pages/HelpDeskPage';
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorMenuPage from './pages/vendor/VendorMenuPage';
import CreateMenuPage from './pages/vendor/CreateMenuPage';
import CartPage from './pages/CartPage';
import ReferVendorPage from './pages/ReferVendorPage';
import WalletPage from './pages/customer/WalletPage';
import CustomerHub from './pages/CustomerHub';
import AboutPage from './pages/AboutPage';
import BookingStatusPage from './pages/BookingStatusPage';
import VendorServicesPage from './pages/vendor/VendorServicesPage';
import VendorProfilePage from './pages/vendor/VendorProfilePage';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import TermsPage from './pages/legal/TermsPage';
import PrivacyPage from './pages/legal/PrivacyPage';
import RefundPage from './pages/legal/RefundPage';
import DisclaimerPage from './pages/legal/DisclaimerPage';
import FaqPage from './pages/support/FaqPage';
import ReportIssuePage from './pages/support/ReportIssuePage';
import ContactPage from './pages/support/ContactPage';
import ScrollToTop from './components/ScrollToTop';

function ProtectedRoute({ children, roleRequired }) {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/" />;
  }

  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <div className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/menu" element={<MenuPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/order-status" element={<OrderStatusPage />} />
                  <Route path="/order-status/:id" element={<OrderStatusPage />} />
                  <Route path="/booking-status" element={<BookingStatusPage />} />
                  <Route path="/booking-status/:id" element={<BookingStatusPage />} />
                  <Route path="/your-orders" element={<CustomerOrdersPage />} />
                  <Route path="/help-desk" element={<HelpDeskPage />} />

                  <Route
                    path="/refer-vendor"
                    element={
                      <CustomerProtectedRoute>
                        <ReferVendorPage />
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route
                    path="/refer"
                    element={
                      <CustomerProtectedRoute>
                        <ReferVendorPage />
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route
                    path="/wallet"
                    element={
                      <CustomerProtectedRoute>
                        <WalletPage />
                      </CustomerProtectedRoute>
                    }
                  />
                  <Route path="/customer-hub" element={<CustomerHub />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/refund" element={<RefundPage />} />
                  <Route path="/disclaimer" element={<DisclaimerPage />} />
                  <Route path="/faqs" element={<FaqPage />} />
                  <Route path="/report-issue" element={<ReportIssuePage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  
                  {/* Auth Routes */}
                  <Route path="/auth" element={<LoginPage />} />
                  <Route path="/auth/register" element={<RegisterPage />} />
                  <Route path="/vendor/register" element={<RegisterPage />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <AdminDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/vendors" 
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <VendorsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/orders" 
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <OrdersPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/customers" 
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <CustomersPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/payments" 
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <PaymentsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/commission" 
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <CommissionPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/reports" 
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <ReportsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/complaints" 
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <ComplaintsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin/settings" 
                    element={
                      <ProtectedRoute roleRequired="admin">
                        <SettingsPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/admin/logout" element={<LogoutPage />} />
                  <Route 
                    path="/vendor/dashboard" 
                    element={
                      <ProtectedRoute roleRequired="vendor">
                        <VendorDashboard />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/vendor/menu" 
                    element={
                      <ProtectedRoute roleRequired="vendor">
                        <VendorMenuPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/vendor/menu/create" 
                    element={
                      <ProtectedRoute roleRequired="vendor">
                        <CreateMenuPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/vendor/services" 
                    element={
                      <ProtectedRoute roleRequired="vendor">
                        <VendorServicesPage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/vendor/profile" 
                    element={
                      <ProtectedRoute roleRequired="vendor">
                        <VendorProfilePage />
                      </ProtectedRoute>
                    } 
                  />

                  {/* Salon Redirects for Food Vendors */}
                  <Route path="/vendor/stylists" element={<Navigate to="/vendor/dashboard" replace />} />
                  <Route path="/salon-bookings" element={<Navigate to="/vendor/dashboard" replace />} />
                  <Route path="/manage-services" element={<Navigate to="/vendor/dashboard" replace />} />

                </Routes>
              </div>
              <Footer />
            </div>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
