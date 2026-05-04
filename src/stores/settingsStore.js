/**
 * @module settingsStore
 * @description Store Valtio para preferências do sistema (tema, fonte, idioma).
 * Substitui SettingsContext preservando a lógica de persistência.
 */
import { proxy, useSnapshot, subscribe } from 'valtio';
import { STORAGE_KEYS } from '@/config/storage.config';

// ─── Translations ───────────────────────────────────────────────────────────

export const translations = {
  pt: {
    dashboard: 'Dashboard',
    myGrades: 'Meu Boletim',
    schedule: 'Horário',
    myProfile: 'Meu Perfil',
    settings: 'Configurações',
    logout: 'Sair do Sistema',
    activeSession: 'Sessão Ativa',
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
    on: 'Ativado',
    off: 'Desativado',
  },
  en: {
    dashboard: 'Dashboard',
    myGrades: 'My Grades',
    schedule: 'Schedule',
    myProfile: 'My Profile',
    settings: 'Settings',
    logout: 'Sign Out',
    activeSession: 'Active Session',
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
    on: 'Enabled',
    off: 'Disabled',
  },
};

// ─── Font size maps ─────────────────────────────────────────────────────────

const FONT_SIZE_STYLES = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

// ─── Defaults ───────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS = {
  theme: 'dark',
  fontSize: 'medium',
  language: 'pt',
};

// ─── State ──────────────────────────────────────────────────────────────────

const loadSaved = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

export const settingsState = proxy(loadSaved());

// ─── Side Effects (subscriptions) ───────────────────────────────────────────

// Apply theme to <html> whenever settings.theme changes
const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

// Apply font size to <html>
const applyFontSize = (fontSize) => {
  document.documentElement.style.fontSize = FONT_SIZE_STYLES[fontSize] || '16px';
};

// Initial apply
applyTheme(settingsState.theme);
applyFontSize(settingsState.fontSize);

// Subscribe to changes and persist
subscribe(settingsState, () => {
  applyTheme(settingsState.theme);
  applyFontSize(settingsState.fontSize);
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
    theme: settingsState.theme,
    fontSize: settingsState.fontSize,
    language: settingsState.language,
  }));
});

// ─── Actions ────────────────────────────────────────────────────────────────

export const updateSettings = (partial) => {
  Object.assign(settingsState, partial);
};

// ─── React Hook ─────────────────────────────────────────────────────────────

/**
 * Hook para acessar configurações de forma reativa.
 * Drop-in replacement para useSettings() do antigo SettingsContext.
 */
export const useSettings = () => {
  const snap = useSnapshot(settingsState);

  const t = (key) =>
    translations[snap.language]?.[key] ?? translations['pt'][key] ?? key;

  return {
    settings: snap,
    updateSettings,
    t,
  };
};
