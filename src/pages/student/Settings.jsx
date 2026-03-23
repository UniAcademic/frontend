import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

// ─── Labels bilíngues inline (não dependem do contexto ainda carregado) ──────
const UI = {
  pt: {
    breadcrumb: 'ÁREA DO ALUNO',
    title: 'Configurações',
    subtitle: 'Preferências do sistema',
    appearance: 'Aparência',
    darkMode: 'Modo Escuro',
    darkModeDesc: 'Alterna entre tema claro e escuro',
    on: 'Ativado',
    off: 'Desativado',
    fontSize: 'Tamanho da Fonte',
    fontSizeDesc: 'Ajuste o tamanho do texto para melhor leitura',
    small: 'Pequeno',
    medium: 'Médio',
    large: 'Grande',
    language: 'Idioma',
    languageDesc: 'Selecione o idioma de exibição da interface',
    saveBtn: 'Salvar Preferências',
    savedMsg: '✓ Preferências salvas com sucesso!',
    preview: 'Pré-visualização',
    previewText: 'Este é um exemplo de como o texto aparece com o tamanho selecionado.',
    themeLight: 'Claro',
    themeDark: 'Escuro',
  },
  en: {
    breadcrumb: 'STUDENT AREA',
    title: 'Settings',
    subtitle: 'System preferences',
    appearance: 'Appearance',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Toggle between light and dark theme',
    on: 'Enabled',
    off: 'Disabled',
    fontSize: 'Font Size',
    fontSizeDesc: 'Adjust text size for better readability',
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    language: 'Language',
    languageDesc: 'Select the interface display language',
    saveBtn: 'Save Preferences',
    savedMsg: '✓ Preferences saved successfully!',
    preview: 'Preview',
    previewText: 'This is an example of how text looks with the selected size.',
    themeLight: 'Light',
    themeDark: 'Dark',
  },
};

const FONT_PREVIEW = { small: '14px', medium: '16px', large: '20px' };

const StudentSettings = () => {
  const { settings, updateSettings } = useSettings();

  // Local draft — only applied on Save
  const [draft, setDraft] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const lang = draft.language;
  const L = UI[lang] || UI.pt;

  const handleSave = () => {
    updateSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const SectionCard = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-[#020617] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[#F59E0B] text-[18px]">{icon}</span>
        </div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-700 dark:text-slate-300">
          {title}
        </h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-[#0B0F19] min-h-screen font-sans pb-24">
      <main className="max-w-[780px] mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Header */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F59E0B] mb-2">
            {L.breadcrumb}
          </p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
            {L.title}
          </h1>
          <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-widest">
            {L.subtitle}
          </p>
        </div>

        {/* ── Appearance ─────────────────────────────────────────────────── */}
        <SectionCard icon="palette" title={L.appearance}>
          {/* Dark / Light toggle */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {L.darkMode}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{L.darkModeDesc}</p>
            </div>

            {/* Toggle pill */}
            <button
              id="settings-dark-mode-toggle"
              onClick={() =>
                setDraft((d) => ({ ...d, theme: d.theme === 'dark' ? 'light' : 'dark' }))
              }
              className={`relative w-[120px] h-10 rounded-full p-1 flex items-center gap-1 transition-all duration-300 border ${
                draft.theme === 'dark'
                  ? 'bg-[#0B0F19] border-slate-700'
                  : 'bg-amber-50 border-amber-200'
              }`}
              aria-pressed={draft.theme === 'dark'}
            >
              {/* Sun */}
              <span
                className={`flex-1 flex items-center justify-center rounded-full h-8 text-[10px] font-black uppercase tracking-wide transition-all duration-300 ${
                  draft.theme === 'light'
                    ? 'bg-[#F59E0B] text-white shadow-md'
                    : 'text-slate-500'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">light_mode</span>
              </span>
              {/* Moon */}
              <span
                className={`flex-1 flex items-center justify-center rounded-full h-8 text-[10px] font-black uppercase tracking-wide transition-all duration-300 ${
                  draft.theme === 'dark'
                    ? 'bg-slate-700 text-[#F59E0B] shadow-md'
                    : 'text-slate-400'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">dark_mode</span>
              </span>
            </button>
          </div>

          <p className="mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {draft.theme === 'dark' ? `● ${L.themeDark}` : `● ${L.themeLight}`}
          </p>
        </SectionCard>

        {/* ── Font Size ───────────────────────────────────────────────────── */}
        <SectionCard icon="text_fields" title={L.fontSize}>
          <p className="text-[11px] text-slate-500 mb-5">{L.fontSizeDesc}</p>

          <div className="flex gap-3 flex-wrap">
            {[
              { key: 'small', label: L.small, icon: 'text_decrease' },
              { key: 'medium', label: L.medium, icon: 'text_fields' },
              { key: 'large', label: L.large, icon: 'text_increase' },
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                id={`settings-font-${key}`}
                onClick={() => setDraft((d) => ({ ...d, fontSize: key }))}
                className={`flex-1 min-w-[90px] flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-200 ${
                  draft.fontSize === key
                    ? 'border-[#F59E0B] bg-[#F59E0B]/5 text-[#F59E0B] shadow-[0_0_0_3px_rgba(245,158,11,0.15)]'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
                aria-pressed={draft.fontSize === key}
              >
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
              </button>
            ))}
          </div>

          {/* Live preview */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
              {L.preview}
            </p>
            <p
              className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed transition-all duration-300"
              style={{ fontSize: FONT_PREVIEW[draft.fontSize] }}
            >
              {L.previewText}
            </p>
          </div>
        </SectionCard>

        {/* ── Language ────────────────────────────────────────────────────── */}
        <SectionCard icon="language" title={L.language}>
          <p className="text-[11px] text-slate-500 mb-5">{L.languageDesc}</p>

          <div className="flex gap-3 flex-wrap">
            {[
              { key: 'pt', label: 'Português', flag: '🇧🇷' },
              { key: 'en', label: 'English', flag: '🇺🇸' },
            ].map(({ key, label, flag }) => (
              <button
                key={key}
                id={`settings-lang-${key}`}
                onClick={() => setDraft((d) => ({ ...d, language: key }))}
                className={`flex-1 min-w-[140px] flex items-center gap-3 py-4 px-5 rounded-xl border-2 transition-all duration-200 ${
                  draft.language === key
                    ? 'border-[#F59E0B] bg-[#F59E0B]/5 shadow-[0_0_0_3px_rgba(245,158,11,0.15)]'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
                aria-pressed={draft.language === key}
              >
                <span className="text-2xl leading-none">{flag}</span>
                <div className="text-left">
                  <p
                    className={`text-[11px] font-black uppercase tracking-wider ${
                      draft.language === key
                        ? 'text-[#F59E0B]'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                    {key === 'pt' ? 'Português (BR)' : 'English (US)'}
                  </p>
                </div>
                {draft.language === key && (
                  <span className="material-symbols-outlined text-[#F59E0B] text-[18px] ml-auto">
                    check_circle
                  </span>
                )}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* ── Save button ─────────────────────────────────────────────────── */}
        <div className="flex flex-col items-end gap-3">
          {saved && (
            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 animate-pulse">
              {L.savedMsg}
            </p>
          )}
          <button
            id="settings-save-btn"
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#F59E0B] hover:bg-[#D97706] active:scale-95 text-white text-[11px] font-black uppercase tracking-widest px-8 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            {L.saveBtn}
          </button>
        </div>

      </main>
    </div>
  );
};

export default StudentSettings;
