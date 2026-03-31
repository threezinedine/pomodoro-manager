import { AUTH_TOKEN } from '../../config/index';

export interface ValidateTokenResult {
  valid: boolean;
  userId?: string;
}

export function validateToken(token: string): ValidateTokenResult {
  if (token === AUTH_TOKEN) {
    return { valid: true };
  }
  return { valid: false };
}
