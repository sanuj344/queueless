import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
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
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorMenuPage from './pages/vendor/VendorMenuPage';
import CreateMenuPage from './pages/vendor/CreateMenuPage';
import CartPage from './pages/CartPage';

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
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/order-status" element={<OrderStatusPage />} />
              <Route path="/order-status/:id" element={<OrderStatusPage />} />
              <Route path="/customer/orders" element={<CustomerOrdersPage />} />
              
              {/* Auth Routes */}
              <Route path="/auth" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              
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
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
