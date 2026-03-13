import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import LoadingOverlay from '../components/LoadingOverlay';

describe('LoadingOverlay', () => {
  it('renders nothing when visible is false', () => {
    const { container } = render(<LoadingOverlay visible={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders bar and scrim when visible is true', () => {
    const { container } = render(<LoadingOverlay visible={true} />);
    const overlay = container.querySelector('.loading-overlay');
    expect(overlay).toBeTruthy();
    const bar = container.querySelector('.loading-bar');
    expect(bar).toBeTruthy();
  });
});
