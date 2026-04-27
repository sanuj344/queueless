import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ql-user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('ql-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ql-user');
    }
  }, [user]);

  const login = (email, password, role) => {
    // Mock login logic
    const mockUser = {
      id: role === 'vendor' ? 'v001' : (role === 'admin' ? 'a001' : 'c001'),
      name: role === 'vendor' ? 'The Spice Room Admin' : (role === 'admin' ? 'Super Admin' : 'John Doe'),
      email,
      role // 'customer', 'vendor', or 'admin'
    };
    setUser(mockUser);
    return mockUser;
  };

  const loginAsAdmin = () => {
    return login('admin@queueless.com', 'admin', 'admin');
  };

  const register = (data, role) => {
    // Mock registration
    const mockUser = {
      id: role === 'vendor' ? 'v002' : 'c002',
      name: data.name,
      email: data.email,
      role
    };
    setUser(mockUser);
    return mockUser;
  };

  const logout = () => {
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
