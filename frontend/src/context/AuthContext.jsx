import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ql_user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ql_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ql_user');
      localStorage.removeItem('ql_token');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user: userData } = response.data.data;
        localStorage.setItem('ql_token', token);
        setUser(userData);
        return userData;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  const loginAsAdmin = () => {
    const adminUser = {
      id: "admin-1",
      name: "Admin",
      email: "admin@queueless.com",
      role: "admin"
    };
    localStorage.setItem("ql_token", "admin_mock_token");
    setUser(adminUser);
    return adminUser;
  };

  const register = async (data, role) => {
    try {
      const response = await api.post('/auth/register', { ...data, role });
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('ql_token');
    localStorage.removeItem('ql_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginAsAdmin, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
