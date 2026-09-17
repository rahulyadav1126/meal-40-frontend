import { describe, expect, it } from 'vitest';
import { loginSchema } from './index';

describe('loginSchema', () => {
  it('rejects an invalid email and short password', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'short' }).success).toBe(false);
  });
});
