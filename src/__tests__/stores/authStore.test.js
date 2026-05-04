import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock axios before importing the store
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
      get: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    defaults: { headers: { common: {} } },
  },
}));

describe('authStore', () => {
  let authState, login, logout, initAuth, useAuth;

  beforeEach(async () => {
    // Clear localStorage and re-import to get fresh store state
    localStorage.clear();
    vi.resetModules();
    const mod = await import('@/stores/authStore');
    authState = mod.authState;
    login = mod.login;
    logout = mod.logout;
    initAuth = mod.initAuth;
    useAuth = mod.useAuth;
  });

  it('should start with null user when no saved data', () => {
    expect(authState.user).toBeNull();
  });

  it('should have loading set to false initially', () => {
    expect(authState.loading).toBe(false);
  });

  it('should clear all tokens on logout', () => {
    authState.user = { id: 1, name: 'Test' };
    logout();
    expect(authState.user).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalled();
  });

  it('should remove expired token on initAuth', () => {
    // Set expired token
    const expiredPayload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }));
    const fakeToken = `header.${expiredPayload}.signature`;
    localStorage.getItem.mockReturnValueOnce(fakeToken);

    authState.user = { id: 1 };
    initAuth();
    expect(authState.user).toBeNull();
  });

  it('should export useAuth hook', () => {
    expect(typeof useAuth).toBe('function');
  });
});
