// modules/auth/utils/pkce.ts
// PKCE (RFC 7636) helpers for mobile OAuth flows

export function generateRandomString(length = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
}

export async function createPkceChallenge() {
  const codeVerifier = generateRandomString(64);
  const nonce = generateRandomString(32);
  const state = generateRandomString(32);

  let codeChallenge = codeVerifier;
  try {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(codeVerifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      const binary = String.fromCharCode(...new Uint8Array(digest));
      codeChallenge = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }
  } catch {
    codeChallenge = codeVerifier;
  }

  return { codeVerifier, codeChallenge, nonce, state };
}
