import { Navigate } from 'react-router-dom';

const CustomerProtectedRoute = ({ children }) => {
  const customer = JSON.parse(localStorage.getItem('ql_customer'));

  if (!customer || !customer.phone) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default CustomerProtectedRoute;
