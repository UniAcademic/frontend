/**
 * @module SettingsContext
 * @description Thin wrapper around the Valtio settingsStore.
 * Mantém compatibilidade com componentes que usam <SettingsProvider> e useSettings().
 * A lógica real está em src/stores/settingsStore.js.
 */
import React, { createContext, useContext } from 'react';
import { useSettings as useSettingsStore, translations } from '@/stores/settingsStore';

const SettingsContext = createContext(null);

export { translations };

export const SettingsProvider = ({ children }) => {
  const settings = useSettingsStore();

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    // Fallback: use store directly if used outside Provider
    return useSettingsStore();
  }
  return context;
};

export default SettingsContext;
