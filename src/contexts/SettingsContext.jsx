import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Translations ──────────────────────────────────────────────────────────────
export const translations = {
  pt: {
    // Navigation
    dashboard: 'Dashboard',
    myGrades: 'Meu Boletim',
    schedule: 'Horário',
    myProfile: 'Meu Perfil',
    settings: 'Configurações',
    logout: 'Sair do Sistema',
    activeSession: 'Sessão Ativa',
    // Settings page
    settingsTitle: 'Configurações',
    settingsSubtitle: 'Preferências do sistema',
    appearance: 'Aparência',
    darkMode: 'Modo Escuro',
    darkModeDesc: 'Alterna entre o tema claro e escuro',
    fontSize: 'Tamanho da Fonte',
    fontSizeDesc: 'Ajuste o tamanho do texto para melhor leitura',
    fontSmall: 'Pequeno',
    fontMedium: 'Médio',
    fontLarge: 'Grande',
    language: 'Idioma',
    languageDesc: 'Selecione o idioma de exibição da interface',
    saveSuccess: 'Preferências salvas com sucesso!',
    // Common
    on: 'Ativado',
    off: 'Desativado',
  },
  en: {
    // Navigation
    dashboard: 'Dashboard',
    myGrades: 'My Grades',
    schedule: 'Schedule',
    myProfile: 'My Profile',
    settings: 'Settings',
    logout: 'Sign Out',
    activeSession: 'Active Session',
    // Settings page
    settingsTitle: 'Settings',
    settingsSubtitle: 'System preferences',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Toggle between light and dark theme',
    fontSize: 'Font Size',
    fontSizeDesc: 'Adjust text size for better readability',
    fontSmall: 'Small',
    fontMedium: 'Medium',
    fontLarge: 'Large',
    language: 'Language',
    languageDesc: 'Select the interface display language',
    saveSuccess: 'Preferences saved successfully!',
    // Common
    on: 'Enabled',
    off: 'Disabled',
  },
};

// ─── Font size class map ───────────────────────────────────────────────────────
const FONT_SIZE_CLASSES = {
  small: 'text-sm-base',
  medium: '',
  large: 'text-lg-base',
};

const FONT_SIZE_STYLES = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  theme: 'dark',        // 'dark' | 'light'
  fontSize: 'medium',   // 'small' | 'medium' | 'large'
  language: 'pt',       // 'pt' | 'en'
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('uniacademic_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Apply font size to <html>
  useEffect(() => {
    document.documentElement.style.fontSize = FONT_SIZE_STYLES[settings.fontSize] || '16px';
  }, [settings.fontSize]);

  // Persist to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('uniacademic_settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = useCallback((partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const t = useCallback(
    (key) => translations[settings.language]?.[key] ?? translations['pt'][key] ?? key,
    [settings.language]
  );

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, t }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsProvider');
  return ctx;
};

export default SettingsContext;
