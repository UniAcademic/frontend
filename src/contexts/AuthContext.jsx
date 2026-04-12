import React, { createContext, useContext, useState } from 'react';
import db from '../../db.json';

const AuthContext = createContext(null);

// Simulação de delay de rede
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('uniacademic_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    await delay();
    try {
      const loggedUser = db.users.find(u => u.email === email && u.password === password);

      if (!loggedUser) {
        throw new Error('Credenciais inválidas');
      }

      setUser(loggedUser);
      localStorage.setItem('uniacademic_user', JSON.stringify(loggedUser));
      return loggedUser;
    } catch (error) {
      throw new Error(error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('uniacademic_user');
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
