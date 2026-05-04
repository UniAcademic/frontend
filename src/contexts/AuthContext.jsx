/**
 * @module AuthContext
 * @description Thin wrapper around the Valtio authStore.
 * Mantém compatibilidade com componentes que usam <AuthProvider> e useAuth().
 * A lógica real está em src/stores/authStore.js.
 */
import React, { createContext, useContext, useEffect } from 'react';
import { useAuth as useAuthStore, initAuth } from '@/stores/authStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize token validation on mount
  useEffect(() => {
    initAuth();
  }, []);

  const auth = useAuthStore();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback: use store directly if used outside Provider
    return useAuthStore();
  }
  return context;
};

export default AuthContext;
