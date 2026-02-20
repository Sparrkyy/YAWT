// Wraps Google Identity Services token client
// Exposes: initAuth(), signIn(), getToken(), isSignedIn(), signOut(), getUserSub()

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

let accessToken = null;
let tokenClient = null;
let userSub = null;

export function initAuth(onSignIn) {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback: async (resp) => {
      if (resp.error) return;
      accessToken = resp.access_token;
      try {
        const res = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?access_token=${encodeURIComponent(resp.access_token)}`
        );
        const info = await res.json();
        userSub = info.sub ?? null;
      } catch {
        userSub = null;
      }
      onSignIn();
    },
  });
}

export function signIn()     { tokenClient.requestAccessToken(); }
export function signOut()    { google.accounts.oauth2.revoke(accessToken); accessToken = null; userSub = null; }
export function getToken()   { return accessToken; }
export function isSignedIn() { return !!accessToken; }
export function getUserSub() { return userSub; }
