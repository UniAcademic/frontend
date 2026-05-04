import { describe, it, expect, vi } from 'vitest';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    })),
    defaults: { headers: { common: {} } },
  },
}));

describe('http client', () => {
  it('should export default httpAuth instance', async () => {
    const mod = await import('@/lib/http');
    expect(mod.default).toBeDefined();
  });

  it('should export applyAuthHeader function', async () => {
    const mod = await import('@/lib/http');
    expect(typeof mod.applyAuthHeader).toBe('function');
  });

  it('should export getAuthHeaders function', async () => {
    const mod = await import('@/lib/http');
    expect(typeof mod.getAuthHeaders).toBe('function');
  });

  it('should generate correct auth headers', async () => {
    const { getAuthHeaders } = await import('@/lib/http');
    const headers = getAuthHeaders('my-token-123');
    expect(headers).toEqual({
      headers: { Authorization: 'Bearer my-token-123' }
    });
  });
});
