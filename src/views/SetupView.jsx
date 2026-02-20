import { useState } from 'react';
import { createNewSheet, validateSheet } from '../data/sheetsApi';

export default function SetupView({ setupPhase, onSheetReady, onUsersReady }) {
  // Sheet phase state
  const [existingId, setExistingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Users phase state
  const [userNames, setUserNames] = useState(['', '']);

  async function handleCreateNew() {
    setLoading(true);
    setError('');
    try {
      const id = await createNewSheet();
      onSheetReady(id);
    } catch {
      setError('Failed to create sheet. Check your Google Drive permissions and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLinkExisting() {
    const id = existingId.trim();
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const valid = await validateSheet(id);
      if (!valid) {
        setError('Could not access that sheet. Make sure the ID is correct and you have permission.');
        return;
      }
      onSheetReady(id);
    } catch {
      setError('Failed to validate sheet. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleUsersSubmit(e) {
    e.preventDefault();
    const names = userNames.map(n => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    onUsersReady(names);
  }

  function updateUserName(index, value) {
    setUserNames(prev => prev.map((n, i) => (i === index ? value : n)));
  }

  function addAnotherUser() {
    setUserNames(prev => [...prev, '']);
  }

  if (setupPhase === 'users') {
    return (
      <div className="app sign-in-screen">
        <div className="sign-in-card">
          <h1 className="app-title">YAWT</h1>
          <p className="sign-in-subtitle">Who will be tracking workouts here?</p>
          <form onSubmit={handleUsersSubmit} style={{ width: '100%' }}>
            {userNames.map((name, i) => (
              <input
                key={i}
                type="text"
                className="setup-input"
                placeholder={`User ${i + 1} name`}
                value={name}
                onChange={e => updateUserName(i, e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: '0.75rem', boxSizing: 'border-box' }}
              />
            ))}
            {userNames.length < 4 && (
              <button
                type="button"
                className="sign-out-btn"
                onClick={addAnotherUser}
                style={{ marginBottom: '1rem' }}
              >
                + Add another
              </button>
            )}
            <button
              type="submit"
              className="btn-primary sign-in-btn"
              disabled={userNames.every(n => !n.trim())}
            >
              Get started
            </button>
          </form>
        </div>
      </div>
    );
  }

  // setupPhase === 'sheet'
  return (
    <div className="app sign-in-screen">
      <div className="sign-in-card">
        <h1 className="app-title">YAWT</h1>
        <p className="sign-in-subtitle">Set up your workout sheet</p>

        {error && <p style={{ color: 'var(--color-error, #e53e3e)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

        <button
          className="btn-primary sign-in-btn"
          onClick={handleCreateNew}
          disabled={loading}
          style={{ marginBottom: '1.5rem' }}
        >
          {loading ? 'Creating…' : 'Create a new YAWT sheet in your Google Drive'}
        </button>

        <p style={{ color: 'var(--color-muted, #888)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
          — or use an existing sheet —
        </p>

        <input
          type="text"
          className="setup-input"
          placeholder="Paste your Sheet ID here"
          value={existingId}
          onChange={e => setExistingId(e.target.value)}
          disabled={loading}
          style={{ display: 'block', width: '100%', marginBottom: '0.75rem', boxSizing: 'border-box' }}
        />
        <button
          className="btn-primary sign-in-btn"
          onClick={handleLinkExisting}
          disabled={loading || !existingId.trim()}
        >
          {loading ? 'Checking…' : 'Link existing sheet'}
        </button>
      </div>
    </div>
  );
}
