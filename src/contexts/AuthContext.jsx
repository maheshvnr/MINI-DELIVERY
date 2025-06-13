import React, { createContext, useContext, useState, useEffect } from 'react';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: 'customer' | 'delivery' | 'admin';
// }

// interface AuthContextType {
//   user: User | null;
//   login: (email: string, password: string, role: string) => Promise<boolean>;
//   register: (name: string, email: string, password: string, role: string) => Promise<boolean>;
//   logout: () => void;
//   isAuthenticated: boolean;
// }

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('deliveryflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email, password, role) => {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('deliveryflow_users') || '[]');
    const foundUser = users.find((u) => u.email === email && u.password === password && u.role === role);
    
    if (foundUser) {
      const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: foundUser.role };
      setUser(userData);
      localStorage.setItem('deliveryflow_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (name, email, password, role)=> {
    // Simulate API call
    const users = JSON.parse(localStorage.getItem('deliveryflow_users') || '[]');
    const existingUser = users.find((u) => u.email === email);
    
    if (!existingUser) {
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        role
      };
      users.push(newUser);
      localStorage.setItem('deliveryflow_users', JSON.stringify(users));
      
      const userData = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
      setUser(userData);
      localStorage.setItem('deliveryflow_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('deliveryflow_user');
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};