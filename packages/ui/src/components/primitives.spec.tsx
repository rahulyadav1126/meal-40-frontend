import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { describe, expect, it } from 'vitest';
import { OrderStatus } from '@plate40/types';
import { OrderStatusBadge } from './primitives';

describe('OrderStatusBadge', () => {
  it('uses the shared human-readable status mapping', () => {
    render(<OrderStatusBadge status={OrderStatus.OUT_FOR_DELIVERY} />);
    expect(screen.getByText('Out For Delivery')).toBeInTheDocument();
  });
});
