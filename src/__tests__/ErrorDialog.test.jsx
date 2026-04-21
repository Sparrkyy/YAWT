import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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
    render(
      <ErrorDialog error={{ message: 'fail', operation: 'saving set' }} onDismiss={vi.fn()} />
    );
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

  it('shows "Sign back in" button on 401 when onReauth provided', () => {
    render(
      <ErrorDialog
        error={{ message: 'fail', status: 401 }}
        onDismiss={vi.fn()}
        onReauth={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Sign back in' })).toBeInTheDocument();
  });

  it('shows "Dismiss" alongside "Sign back in" on 401', () => {
    render(
      <ErrorDialog
        error={{ message: 'fail', status: 401 }}
        onDismiss={vi.fn()}
        onReauth={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign back in' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'OK' })).not.toBeInTheDocument();
  });

  it('calls onReauth when "Sign back in" is clicked', () => {
    const onReauth = vi.fn();
    render(
      <ErrorDialog
        error={{ message: 'fail', status: 401 }}
        onDismiss={vi.fn()}
        onReauth={onReauth}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Sign back in' }));
    expect(onReauth).toHaveBeenCalledTimes(1);
  });

  it('does not show "Sign back in" for non-401 errors even with onReauth', () => {
    render(
      <ErrorDialog
        error={{ message: 'fail', status: 500 }}
        onDismiss={vi.fn()}
        onReauth={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: 'Sign back in' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });

  it('shows updated hint text on 401 with onReauth', () => {
    render(
      <ErrorDialog
        error={{ message: 'fail', status: 401 }}
        onDismiss={vi.fn()}
        onReauth={vi.fn()}
      />
    );
    expect(screen.getByText('Your session has expired.')).toBeInTheDocument();
    expect(screen.queryByText(/Try signing in again/)).not.toBeInTheDocument();
  });
});
