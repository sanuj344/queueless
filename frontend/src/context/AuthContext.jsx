import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Vendor / Admin JWT session
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ql_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Guest Customer session (OTP-verified)
  const [customer, setCustomer] = useState(() => {
    const stored = localStorage.getItem('ql_customer');
    return stored ? JSON.parse(stored) : null;
  });

  // Last scanned vendorId — so Menu link always works after order
  const [activeVendorId, setActiveVendorId] = useState(() => {
    return localStorage.getItem('ql_active_vendor_id') || null;
  });

  // Sync user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('ql_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ql_user');
      localStorage.removeItem('ql_token');
    }
  }, [user]);

  // Sync customer to localStorage
  useEffect(() => {
    if (customer) {
      localStorage.setItem('ql_customer', JSON.stringify(customer));
    } else {
      localStorage.removeItem('ql_customer');
    }
  }, [customer]);

  // Sync activeVendorId to localStorage
  useEffect(() => {
    if (activeVendorId) {
      localStorage.setItem('ql_active_vendor_id', activeVendorId);
    } else {
      localStorage.removeItem('ql_active_vendor_id');
    }
  }, [activeVendorId]);

  // ─── Vendor / Admin Auth ───────────────────────────────────────────────────

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      const { token, user: userData } = response.data.data;
      localStorage.setItem('ql_token', token);
      setUser(userData);
      return userData;
    }
    throw new Error('Login failed');
  };

  const loginAsAdmin = async (password) => {
    try {
      const response = await api.post('/admin/login', { password });
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('ql_token', token);
        setUser(userData);
        return userData;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Admin login failed';
      throw new Error(msg);
    }
  };

  const register = async (data, role) => {
    const response = await api.post('/auth/register', { ...data, role });
    if (response.data.success) return response.data.data;
    throw new Error('Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('ql_token');
    localStorage.removeItem('ql_user');
    localStorage.removeItem('ql_customer');
    localStorage.removeItem('ql_active_vendor_id');
    setUser(null);
    setCustomer(null);
    setActiveVendorId(null);
  };

  // ─── Guest Customer Session ────────────────────────────────────────────────

  /** Called after successful OTP verification at checkout */
  const setCustomerSession = (data) => {
    // Ensure no vendor/admin session bleeds into customer UX
    localStorage.removeItem('ql_user');
    localStorage.removeItem('ql_token');
    setUser(null);
    setCustomer(data);
  };

  const clearCustomerSession = () => {
    localStorage.removeItem('ql_customer');
    setCustomer(null);
  };

  // ─── Derived values ────────────────────────────────────────────────────────
  // Priority: customer > vendor/admin
  const role = customer ? 'customer' : (user?.role || null);
  const isAuthenticated = !!user || !!customer;

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      customer,
      activeVendorId,
      setActiveVendorId,
      login,
      loginAsAdmin,
      register,
      logout,
      setCustomerSession,
      clearCustomerSession,
      isAuthenticated,
      role,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
