import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsView from '../views/SettingsView';
import * as sheetsApi from '../data/sheetsApi';

vi.mock('../data/sheetsApi', () => ({
  createNewSheet: vi.fn(),
  validateSheet: vi.fn(),
}));

function renderSettings(overrides = {}) {
  return render(
    <SettingsView
      currentSheetId="abc123"
      users={['Ethan', 'Ava']}
      onSheetChange={vi.fn()}
      onUsersChange={vi.fn()}
      onSignOut={vi.fn()}
      {...overrides}
    />
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SettingsView', () => {
  it('does not show the confirm dialog on initial render', () => {
    renderSettings();
    expect(screen.queryByText('Create a new sheet?')).toBeNull();
  });

  it('opens the ConfirmDialog when "Create a new sheet" is clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Create a new sheet' }));
    expect(screen.getByText('Create a new sheet?')).toBeInTheDocument();
  });

  it('closes the dialog without calling createNewSheet when Cancel is clicked', () => {
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Create a new sheet' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByText('Create a new sheet?')).toBeNull();
    expect(sheetsApi.createNewSheet).not.toHaveBeenCalled();
  });

  it('calls createNewSheet and propagates the new ID via onSheetChange on success', async () => {
    const onSheetChange = vi.fn();
    sheetsApi.createNewSheet.mockResolvedValue('new-sheet-id');
    renderSettings({ onSheetChange });
    fireEvent.click(screen.getByRole('button', { name: 'Create a new sheet' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => {
      expect(onSheetChange).toHaveBeenCalledWith('new-sheet-id');
    });
  });

  it('shows an error message and closes the dialog when createNewSheet fails', async () => {
    sheetsApi.createNewSheet.mockRejectedValue(new Error('network error'));
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Create a new sheet' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => {
      expect(screen.getByText('Failed to create sheet. Check your Google Drive permissions.')).toBeInTheDocument();
    });
    expect(screen.queryByText('Create a new sheet?')).toBeNull();
  });

  it('disables the "Create a new sheet" button while the sheet operation is loading', async () => {
    sheetsApi.createNewSheet.mockReturnValue(new Promise(() => {})); // never resolves
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Create a new sheet' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(screen.getByRole('button', { name: 'Create a new sheet' })).toBeDisabled();
  });

  it('displays the first 8 characters of the current sheet ID followed by an ellipsis', () => {
    renderSettings({ currentSheetId: 'abcdefghijklmnop' });
    expect(screen.getByText(/abcdefgh/)).toBeInTheDocument();
  });
});
