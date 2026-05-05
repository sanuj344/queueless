import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerProtectedRoute = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const customer = JSON.parse(localStorage.getItem('ql_customer') || '{}');

  if (isAuthenticated || user || customer.phone) {
    return children;
  }

  return <Navigate to="/" replace />;
};

export default CustomerProtectedRoute;
