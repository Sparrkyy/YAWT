// Wraps Google Identity Services token client
// Exposes: initAuth(), signIn(), getToken(), isSignedIn(), signOut()

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

let accessToken = null;
let tokenClient = null;

export function initAuth(onSignIn) {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPE,
    callback: (resp) => {
      if (resp.error) return;
      accessToken = resp.access_token;
      onSignIn();
    },
  });
}

export function signIn()    { tokenClient.requestAccessToken(); }
export function signOut()   { google.accounts.oauth2.revoke(accessToken); accessToken = null; }
export function getToken()  { return accessToken; }
export function isSignedIn(){ return !!accessToken; }
