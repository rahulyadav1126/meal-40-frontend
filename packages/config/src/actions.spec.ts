import { describe, expect, it } from 'vitest';
import { ACTIONS } from './index';

describe('merchant order actions', () => {
  it('uses the deliver endpoint action for delivery completion', () => {
    expect(ACTIONS.deliver).toBe('deliver');
  });
});
