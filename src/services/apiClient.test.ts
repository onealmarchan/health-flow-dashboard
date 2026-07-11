import { describe, expect, it } from 'vitest';
import { extractAuthToken } from './apiClient';

describe('extractAuthToken', () => {
  it('extracts a token from an access_token field', () => {
    expect(extractAuthToken({ access_token: 'abc123' })).toBe('abc123');
  });

  it('extracts a token from a token field', () => {
    expect(extractAuthToken({ token: 'xyz789' })).toBe('xyz789');
  });

  it('extracts a token from a nested payload', () => {
    expect(extractAuthToken({ data: { accessToken: 'nested-token' } })).toBe('nested-token');
  });

  it('returns null when no token exists', () => {
    expect(extractAuthToken({ message: 'ok' })).toBeNull();
  });
});
