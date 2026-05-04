import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('settingsStore', () => {
  let settingsState, updateSettings, useSettings;

  beforeEach(async () => {
    localStorage.clear();
    vi.resetModules();
    
    // Mock document methods used by settingsStore
    vi.spyOn(document.documentElement.classList, 'add').mockImplementation(() => {});
    vi.spyOn(document.documentElement.classList, 'remove').mockImplementation(() => {});
    Object.defineProperty(document.documentElement.style, 'fontSize', {
      set: vi.fn(),
      get: () => '16px',
      configurable: true,
    });

    const mod = await import('@/stores/settingsStore');
    settingsState = mod.settingsState;
    updateSettings = mod.updateSettings;
    useSettings = mod.useSettings;
  });

  it('should have default settings', () => {
    expect(settingsState.theme).toBe('dark');
    expect(settingsState.fontSize).toBe('medium');
    expect(settingsState.language).toBe('pt');
  });

  it('should update settings via updateSettings', () => {
    updateSettings({ theme: 'light' });
    expect(settingsState.theme).toBe('light');
  });

  it('should update language', () => {
    updateSettings({ language: 'en' });
    expect(settingsState.language).toBe('en');
  });

  it('should update fontSize', () => {
    updateSettings({ fontSize: 'large' });
    expect(settingsState.fontSize).toBe('large');
  });

  it('should export useSettings hook', () => {
    expect(typeof useSettings).toBe('function');
  });
});
