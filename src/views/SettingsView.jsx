import { useState } from 'react';
import { createNewSheet, validateSheet, migrateToGuids } from '../data/api';
import ConfirmDialog from '../components/ConfirmDialog';

async function validateAndLink(id, onSheetChange, setSheetInput, setSheetError, setSheetLoading) {
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

async function tryCreateSheet(onSheetChange, setSheetError, setSheetLoading) {
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

function isValidNewUser(name, users) {
  const trimmed = name.trim();
  return trimmed && !users.includes(trimmed) && users.length < 4;
}

function SheetSection({
  currentSheetId,
  sheetInput,
  sheetError,
  sheetLoading,
  onInputChange,
  onLinkSheet,
  onCreateClick,
  onCreateSheet,
  showConfirm,
  onConfirmChange,
  onCancel,
}) {
  return (
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
          onChange={(e) => onInputChange(e.target.value)}
          disabled={sheetLoading}
        />
        <button
          className="btn-primary"
          onClick={onLinkSheet}
          disabled={sheetLoading || !sheetInput.trim()}
        >
          {sheetLoading ? 'Checking…' : 'Link'}
        </button>
      </div>
      <button className="settings-text-btn" onClick={onCreateClick} disabled={sheetLoading}>
        Create a new sheet
      </button>
      {showConfirm && (
        <ConfirmDialog
          title="Create a new sheet?"
          confirmLabel="Create"
          confirmStyle="btn-primary"
          onConfirm={onCreateSheet}
          onCancel={onCancel}
        />
      )}
    </section>
  );
}

function PreferencesSection({
  darkMode,
  useAccordionPicker,
  onDarkModeChange,
  onAccordionPickerChange,
}) {
  return (
    <section className="settings-section">
      <h2 className="settings-heading">Preferences</h2>
      <label className="settings-toggle-row">
        <span>Dark mode</span>
        <span className="toggle-switch">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => onDarkModeChange(e.target.checked)}
          />
          <span className="toggle-track" />
          <span className="toggle-knob" />
        </span>
      </label>
      <label className="settings-toggle-row">
        <span>Use grouped exercise picker</span>
        <span className="toggle-switch">
          <input
            type="checkbox"
            checked={useAccordionPicker}
            onChange={(e) => onAccordionPickerChange(e.target.checked)}
          />
          <span className="toggle-track" />
          <span className="toggle-knob" />
        </span>
      </label>
    </section>
  );
}

function DataSection({ migrateStatus, migrateLoading, onMigrate }) {
  return (
    <section className="settings-section">
      <h2 className="settings-heading">Data</h2>
      {migrateStatus && <p className="settings-migrate-status">{migrateStatus}</p>}
      <button className="settings-text-btn" onClick={onMigrate} disabled={migrateLoading}>
        {migrateLoading ? 'Migrating…' : 'Migrate data to new schema'}
      </button>
    </section>
  );
}

function AccountSection({ onSignOut }) {
  return (
    <section className="settings-section">
      <h2 className="settings-heading">Account</h2>
      <button className="sign-out-btn" onClick={onSignOut}>
        Sign out
      </button>
    </section>
  );
}

function UsersSection({
  users,
  onUsersChange,
  newUser,
  setNewUser,
  handleAddUser,
  handleRemoveUser,
}) {
  return (
    <section className="settings-section">
      <h2 className="settings-heading">Users</h2>
      <ul className="settings-user-list">
        {users.map((u) => (
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
            onChange={(e) => setNewUser(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
          />
          <button
            className="btn-primary"
            onClick={handleAddUser}
            disabled={!isValidNewUser(newUser, users)}
          >
            Add
          </button>
        </div>
      )}
    </section>
  );
}

export default function SettingsView({
  currentSheetId,
  users,
  onSheetChange,
  onUsersChange,
  onSignOut,
  useAccordionPicker = false,
  onAccordionPickerChange,
  darkMode = false,
  onDarkModeChange,
}) {
  const [sheetInput, setSheetInput] = useState('');
  const [sheetLoading, setSheetLoading] = useState(false);
  const [sheetError, setSheetError] = useState('');
  const [newUser, setNewUser] = useState('');
  const [confirmCreate, setConfirmCreate] = useState(false);
  const [migrateLoading, setMigrateLoading] = useState(false);
  const [migrateStatus, setMigrateStatus] = useState('');

  async function handleLinkSheet() {
    const id = sheetInput.trim();
    if (!id) return;
    await validateAndLink(id, onSheetChange, setSheetInput, setSheetError, setSheetLoading);
  }

  async function handleCreateSheet() {
    await tryCreateSheet(onSheetChange, setSheetError, setSheetLoading);
  }

  function handleAddUser() {
    const name = newUser.trim();
    if (!isValidNewUser(name, users)) return;
    onUsersChange([...users, name]);
    setNewUser('');
  }

  function handleRemoveUser(name) {
    if (users.length <= 1) return;
    onUsersChange(users.filter((u) => u !== name));
  }

  async function handleMigrate() {
    setMigrateLoading(true);
    setMigrateStatus('');
    try {
      await migrateToGuids();
      setMigrateStatus('Migration complete.');
    } catch {
      setMigrateStatus('Migration failed. Please try again.');
    } finally {
      setMigrateLoading(false);
    }
  }

  return (
    <div className="settings-view">
      <SheetSection
        currentSheetId={currentSheetId}
        sheetInput={sheetInput}
        sheetError={sheetError}
        sheetLoading={sheetLoading}
        onInputChange={setSheetInput}
        onLinkSheet={handleLinkSheet}
        onCreateClick={() => setConfirmCreate(true)}
        onCreateSheet={() => {
          setConfirmCreate(false);
          handleCreateSheet();
        }}
        showConfirm={confirmCreate}
        onConfirmChange={setConfirmCreate}
        onCancel={() => setConfirmCreate(false)}
      />

      <UsersSection
        users={users}
        onUsersChange={onUsersChange}
        newUser={newUser}
        setNewUser={setNewUser}
        handleAddUser={handleAddUser}
        handleRemoveUser={handleRemoveUser}
      />

      <PreferencesSection
        darkMode={darkMode}
        useAccordionPicker={useAccordionPicker}
        onDarkModeChange={onDarkModeChange}
        onAccordionPickerChange={onAccordionPickerChange}
      />

      <DataSection
        migrateStatus={migrateStatus}
        migrateLoading={migrateLoading}
        onMigrate={handleMigrate}
      />

      <AccountSection onSignOut={onSignOut} />
    </div>
  );
}
