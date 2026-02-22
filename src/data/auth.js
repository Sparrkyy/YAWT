// Wraps Google Identity Services token client
// Exposes: initAuth(), signIn(), getToken(), isSignedIn(), signOut(), getUserSub()
// Also: tryRestoreSession(), hasStoredSession(), trySilentSignIn()

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const AUTH_KEY = 'yawt_auth';

let accessToken = null;
let tokenExpiry = null;
let tokenClient = null;
let userSub = null;

export function initAuth(onSignIn) {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback: async (resp) => {
      if (resp.error) return;
      accessToken = resp.access_token;
      tokenExpiry = Date.now() + resp.expires_in * 1000;
      try {
        const res = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(resp.access_token)}`
        );
        const info = await res.json();
        userSub = info.sub ?? null;
      } catch {
        userSub = null;
      }
      try {
        localStorage.setItem(AUTH_KEY, JSON.stringify({
          access_token: accessToken,
          expires_at: tokenExpiry,
          user_sub: userSub,
        }));
      } catch {}
      onSignIn();
    },
  });
}

export function signIn()     { tokenClient.requestAccessToken(); }
export function signOut()    {
  google.accounts.oauth2.revoke(accessToken);
  accessToken = null;
  tokenExpiry = null;
  userSub = null;
  try { localStorage.removeItem(AUTH_KEY); } catch {}
}
export function getToken()   { return accessToken; }
export function isSignedIn() { return !!accessToken; }
export function getUserSub() { return userSub; }

// Returns true and restores session if stored token is still valid (>60s remaining).
export function tryRestoreSession() {
  try {
    const stored = JSON.parse(localStorage.getItem(AUTH_KEY));
    if (!stored || stored.expires_at < Date.now() + 60_000) return false;
    accessToken = stored.access_token;
    tokenExpiry = stored.expires_at;
    userSub = stored.user_sub ?? null;
    return true;
  } catch { return false; }
}

// Returns true if any stored session exists (even expired) — used to decide silent re-auth.
export function hasStoredSession() {
  return !!localStorage.getItem(AUTH_KEY);
}

// Attempts to get a new token from GIS without user interaction.
// On success the existing callback fires and calls onSignIn().
// On failure the callback fires with resp.error and does nothing — sign-in screen stays.
export function trySilentSignIn() {
  tokenClient.requestAccessToken({ prompt: 'none' });
}
