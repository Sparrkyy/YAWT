import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsView from '../views/SettingsView';
import * as sheetsApi from '../data/api';

vi.mock('../data/api', () => ({
  createNewSheet: vi.fn(),
  validateSheet: vi.fn(),
  migrateToGuids: vi.fn(),
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

  it('renders the Migrate data button', () => {
    renderSettings();
    expect(screen.getByRole('button', { name: 'Migrate data to new schema' })).toBeInTheDocument();
  });

  it('calls migrateToGuids and shows success message on successful migration', async () => {
    sheetsApi.migrateToGuids.mockResolvedValue(undefined);
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Migrate data to new schema' }));
    await waitFor(() => {
      expect(sheetsApi.migrateToGuids).toHaveBeenCalled();
      expect(screen.getByText('Migration complete.')).toBeInTheDocument();
    });
  });

  it('shows error message when migrateToGuids fails', async () => {
    sheetsApi.migrateToGuids.mockRejectedValue(new Error('network error'));
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Migrate data to new schema' }));
    await waitFor(() => {
      expect(screen.getByText('Migration failed. Please try again.')).toBeInTheDocument();
    });
  });

  it('disables migrate button while migration is in progress', async () => {
    sheetsApi.migrateToGuids.mockReturnValue(new Promise(() => {})); // never resolves
    renderSettings();
    fireEvent.click(screen.getByRole('button', { name: 'Migrate data to new schema' }));
    expect(screen.getByRole('button', { name: 'Migrating…' })).toBeDisabled();
  });

  it('renders dark mode toggle and calls onDarkModeChange when toggled', () => {
    const onDarkModeChange = vi.fn();
    renderSettings({ darkMode: false, onDarkModeChange });
    expect(screen.getByText('Dark mode')).toBeInTheDocument();
    const toggles = screen.getAllByRole('checkbox');
    const darkToggle = toggles[0];
    expect(darkToggle.checked).toBe(false);
    fireEvent.click(darkToggle);
    expect(onDarkModeChange).toHaveBeenCalledWith(true);
  });

  it('dark mode toggle reflects checked state when darkMode prop is true', () => {
    renderSettings({ darkMode: true, onDarkModeChange: vi.fn() });
    const toggles = screen.getAllByRole('checkbox');
    expect(toggles[0].checked).toBe(true);
  });

  // --- Link sheet ---
  it('calls validateSheet and onSheetChange when a valid ID is linked', async () => {
    sheetsApi.validateSheet.mockResolvedValue(true);
    const onSheetChange = vi.fn();
    renderSettings({ onSheetChange });
    fireEvent.change(screen.getByPlaceholderText(/Paste a different Sheet ID/), { target: { value: 'newid123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Link' }));
    await waitFor(() => expect(onSheetChange).toHaveBeenCalledWith('newid123'));
  });

  it('shows an error when validateSheet returns false', async () => {
    sheetsApi.validateSheet.mockResolvedValue(false);
    renderSettings();
    fireEvent.change(screen.getByPlaceholderText(/Paste a different Sheet ID/), { target: { value: 'badid' } });
    fireEvent.click(screen.getByRole('button', { name: 'Link' }));
    await waitFor(() =>
      expect(screen.getByText(/Could not access that sheet/)).toBeInTheDocument()
    );
  });

  it('shows an error when validateSheet throws', async () => {
    sheetsApi.validateSheet.mockRejectedValue(new Error('network'));
    renderSettings();
    fireEvent.change(screen.getByPlaceholderText(/Paste a different Sheet ID/), { target: { value: 'anyid' } });
    fireEvent.click(screen.getByRole('button', { name: 'Link' }));
    await waitFor(() =>
      expect(screen.getByText(/Failed to validate sheet/)).toBeInTheDocument()
    );
  });

  it('Link button is disabled when the sheet input is empty', () => {
    renderSettings();
    expect(screen.getByRole('button', { name: 'Link' })).toBeDisabled();
  });

  // --- User management ---
  it('adds a new user and calls onUsersChange', () => {
    const onUsersChange = vi.fn();
    renderSettings({ onUsersChange });
    fireEvent.change(screen.getByPlaceholderText('New user name'), { target: { value: 'Sam' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onUsersChange).toHaveBeenCalledWith(['Ethan', 'Ava', 'Sam']);
  });

  it('rejects a duplicate user name', () => {
    const onUsersChange = vi.fn();
    renderSettings({ onUsersChange });
    fireEvent.change(screen.getByPlaceholderText('New user name'), { target: { value: 'Ethan' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    expect(onUsersChange).not.toHaveBeenCalled();
  });

  it('Add button disabled for duplicate user name', () => {
    renderSettings();
    fireEvent.change(screen.getByPlaceholderText('New user name'), { target: { value: 'Ethan' } });
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();
  });

  it('hides add-user input when 4 users already exist', () => {
    renderSettings({ users: ['A', 'B', 'C', 'D'] });
    expect(screen.queryByPlaceholderText('New user name')).not.toBeInTheDocument();
  });

  it('adds user on Enter key', () => {
    const onUsersChange = vi.fn();
    renderSettings({ onUsersChange });
    const input = screen.getByPlaceholderText('New user name');
    fireEvent.change(input, { target: { value: 'Sam' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onUsersChange).toHaveBeenCalledWith(['Ethan', 'Ava', 'Sam']);
  });

  it('shows remove buttons when more than one user exists', () => {
    renderSettings();
    expect(screen.getAllByRole('button', { name: /Remove/ })).toHaveLength(2);
  });

  it('hides remove buttons when only one user exists', () => {
    renderSettings({ users: ['Solo'] });
    expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
  });

  it('removes a user and calls onUsersChange', () => {
    const onUsersChange = vi.fn();
    renderSettings({ onUsersChange });
    fireEvent.click(screen.getByRole('button', { name: 'Remove Ava' }));
    expect(onUsersChange).toHaveBeenCalledWith(['Ethan']);
  });

  // --- Accordion picker ---
  it('renders accordion picker toggle and calls onAccordionPickerChange', () => {
    const onAccordionPickerChange = vi.fn();
    renderSettings({ useAccordionPicker: false, onAccordionPickerChange });
    const toggles = screen.getAllByRole('checkbox');
    const pickerToggle = toggles[1];
    expect(pickerToggle.checked).toBe(false);
    fireEvent.click(pickerToggle);
    expect(onAccordionPickerChange).toHaveBeenCalledWith(true);
  });

  // --- Sign out ---
  it('calls onSignOut when Sign out is clicked', () => {
    const onSignOut = vi.fn();
    renderSettings({ onSignOut });
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(onSignOut).toHaveBeenCalled();
  });
});
