import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '../components/ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders default title and labels', () => {
    render(<ConfirmDialog onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Delete set?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('applies btn-danger class to confirm button by default', () => {
    render(<ConfirmDialog onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass('btn-danger');
  });

  it('renders custom title', () => {
    render(<ConfirmDialog title="Create a new sheet?" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText('Create a new sheet?')).toBeInTheDocument();
  });

  it('renders custom confirmLabel', () => {
    render(<ConfirmDialog confirmLabel="Create" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Create' })).toBeInTheDocument();
  });

  it('applies custom confirmStyle class', () => {
    render(<ConfirmDialog confirmLabel="Create" confirmStyle="btn-primary" onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Create' })).toHaveClass('btn-primary');
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog onConfirm={onConfirm} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog onConfirm={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when ✕ close button is clicked', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog onConfirm={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: '✕' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when the overlay backdrop is clicked', () => {
    const onCancel = vi.fn();
    const { container } = render(<ConfirmDialog onConfirm={vi.fn()} onCancel={onCancel} />);
    fireEvent.click(container.querySelector('.sheet-overlay'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
