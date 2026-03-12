import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorDialog from '../components/ErrorDialog';

describe('ErrorDialog', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorDialog error={null} onDismiss={vi.fn()} />);
    expect(container.innerHTML).toBe('');
  });

  it('shows the error message', () => {
    render(<ErrorDialog error={{ message: 'Something broke' }} onDismiss={vi.fn()} />);
    expect(screen.getByText('Something broke')).toBeInTheDocument();
  });

  it('shows the operation in the title', () => {
    render(<ErrorDialog error={{ message: 'fail', operation: 'saving set' }} onDismiss={vi.fn()} />);
    expect(screen.getByText('Error saving set')).toBeInTheDocument();
  });

  it('shows generic title when no operation', () => {
    render(<ErrorDialog error={{ message: 'fail' }} onDismiss={vi.fn()} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('shows HTTP status when provided', () => {
    render(<ErrorDialog error={{ message: 'fail', status: 500 }} onDismiss={vi.fn()} />);
    expect(screen.getByText('HTTP status: 500')).toBeInTheDocument();
  });

  it('shows 401 re-auth hint', () => {
    render(<ErrorDialog error={{ message: 'fail', status: 401 }} onDismiss={vi.fn()} />);
    expect(screen.getByText(/session may have expired/)).toBeInTheDocument();
  });

  it('hides 401 hint for other statuses', () => {
    render(<ErrorDialog error={{ message: 'fail', status: 500 }} onDismiss={vi.fn()} />);
    expect(screen.queryByText(/session may have expired/)).not.toBeInTheDocument();
  });

  it('calls onDismiss when OK is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorDialog error={{ message: 'fail' }} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'OK' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorDialog error={{ message: 'fail' }} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when backdrop is clicked', () => {
    const onDismiss = vi.fn();
    const { container } = render(<ErrorDialog error={{ message: 'fail' }} onDismiss={onDismiss} />);
    fireEvent.click(container.querySelector('.sheet-overlay'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
