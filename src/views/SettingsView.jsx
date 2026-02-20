import { useState } from 'react';
import { createNewSheet, validateSheet } from '../data/sheetsApi';

export default function SettingsView({ currentSheetId, users, onSheetChange, onUsersChange, onSignOut }) {
  const [sheetInput, setSheetInput] = useState('');
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [newUser, setNewUser] = useState('');

  async function handleLinkSheet() {
    const id = sheetInput.trim();
    if (!id) return;
    setSheetLoading(true);
    setSheetError('');
    try {
      const valid = await validateSheet(id);
      if (!valid) {
        setSheetError('Could not access that sheet. Check the ID and your permissions.');
        return;
      }
      onSheetChange(id);
      setSheetInput('');
    } catch {
      setSheetError('Failed to validate sheet. Please try again.');
    } finally {
      setSheetLoading(false);
    }
  }

  async function handleCreateSheet() {
    setSheetLoading(true);
    setSheetError('');
    try {
      const id = await createNewSheet();
      onSheetChange(id);
    } catch {
      setSheetError('Failed to create sheet. Check your Google Drive permissions.');
    } finally {
      setSheetLoading(false);
    }
  }

  function handleAddUser() {
    const name = newUser.trim();
    if (!name || users.includes(name) || users.length >= 4) return;
    onUsersChange([...users, name]);
    setNewUser('');
  }

  function handleRemoveUser(name) {
    if (users.length <= 1) return;
    onUsersChange(users.filter(u => u !== name));
  }

  return (
    <div className="settings-view">
      <section className="settings-section">
        <h2 className="settings-heading">Linked sheet</h2>
        {currentSheetId && (
          <p className="settings-sheet-id">
            Current: <code>{currentSheetId.slice(0, 8)}…</code>
          </p>
        )}
        {sheetError && <p className="settings-error">{sheetError}</p>}
        <div className="settings-row">
          <input
            type="text"
            className="setup-input"
            placeholder="Paste a different Sheet ID"
            value={sheetInput}
            onChange={e => setSheetInput(e.target.value)}
            disabled={sheetLoading}
          />
          <button
            className="btn-primary"
            onClick={handleLinkSheet}
            disabled={sheetLoading || !sheetInput.trim()}
          >
            {sheetLoading ? 'Checking…' : 'Link'}
          </button>
        </div>
        <button
          className="settings-text-btn"
          onClick={handleCreateSheet}
          disabled={sheetLoading}
        >
          {sheetLoading ? 'Creating…' : 'Create a new sheet'}
        </button>
      </section>

      <section className="settings-section">
        <h2 className="settings-heading">Users</h2>
        <ul className="settings-user-list">
          {users.map(u => (
            <li key={u} className="settings-user-item">
              <span>{u}</span>
              {users.length > 1 && (
                <button
                  className="settings-remove-btn"
                  onClick={() => handleRemoveUser(u)}
                  aria-label={`Remove ${u}`}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
        {users.length < 4 && (
          <div className="settings-row">
            <input
              type="text"
              className="setup-input"
              placeholder="New user name"
              value={newUser}
              onChange={e => setNewUser(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddUser()}
            />
            <button
              className="btn-primary"
              onClick={handleAddUser}
              disabled={!newUser.trim() || users.includes(newUser.trim())}
            >
              Add
            </button>
          </div>
        )}
      </section>

      <section className="settings-section">
        <h2 className="settings-heading">Account</h2>
        <button className="sign-out-btn" onClick={onSignOut}>
          Sign out
        </button>
      </section>
    </div>
  );
}
