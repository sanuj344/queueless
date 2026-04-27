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
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorMenuPage from './pages/vendor/VendorMenuPage';
import CreateMenuPage from './pages/vendor/CreateMenuPage';

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
              <Route path="/order-status" element={<OrderStatusPage />} />
              
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
