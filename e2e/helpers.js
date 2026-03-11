/**
 * Inject a fake Google Identity Services object so the app's GIS polling
 * resolves without loading the real script.
 */
export function mockGoogleGIS() {
  window.google = {
    accounts: {
      oauth2: {
        initTokenClient: ({ callback }) => ({
          requestAccessToken: () => {
            callback({
              access_token: 'fake-e2e-token',
              expires_in: 3600,
            });
          },
        }),
        revoke: () => {},
      },
    },
  };
}

/**
 * Seed localStorage so the app skips sign-in and onboarding.
 */
export function seedLocalStorage() {
  const sub = 'mock-user-123';
  const authData = {
    access_token: 'fake-e2e-token',
    expires_at: Date.now() + 3600 * 1000,
    user_sub: sub,
  };
  localStorage.setItem('yawt_auth', JSON.stringify(authData));
  localStorage.setItem(`yawt_sheet_${sub}`, 'mock-sheet-id');
  localStorage.setItem(`yawt_users_${sub}`, JSON.stringify(['Ethan', 'Ava']));
}

/**
 * Clear all YAWT localStorage keys.
 */
export function clearLocalStorage() {
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('yawt_')) keysToRemove.push(key);
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}
