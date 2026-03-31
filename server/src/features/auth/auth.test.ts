import { validateToken } from './auth.service';

describe('auth.service', () => {
  it('returns valid: true when token matches AUTH_TOKEN', () => {
    // AUTH_TOKEN is 'changeme' from .env
    const result = validateToken('changeme');
    expect(result.valid).toBe(true);
  });

  it('returns valid: false when token does not match', () => {
    const result = validateToken('wrong-token');
    expect(result.valid).toBe(false);
  });

  it('returns valid: false for empty string token', () => {
    const result = validateToken('');
    expect(result.valid).toBe(false);
  });

  it('is case-sensitive', () => {
    const result = validateToken('CHANGEME');
    expect(result.valid).toBe(false);
  });
});
