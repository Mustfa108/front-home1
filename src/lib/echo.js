import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const DEFAULT_REVERB_HOST = 'reverbhuma.sci-syria.org';
const DEFAULT_REVERB_SCHEME = 'http';
const DEFAULT_REVERB_PORT = 80;

/**
 * Create a Laravel Echo client for Reverb using Sanctum bearer auth.
 * @param {'user'|'admin'} actor
 */
export function createEcho(actor = 'user') {
  const key = import.meta.env.VITE_REVERB_APP_KEY;
  if (!key) {
    return null;
  }

  const tokenKey = actor === 'admin' ? 'humascale_admin_token' : 'humascale_user_token';
  const token = localStorage.getItem(tokenKey);
  if (!token) {
    return null;
  }

  const apiBase = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
  const authEndpoint = `${apiBase}/broadcasting/auth`;

  const scheme = (import.meta.env.VITE_REVERB_SCHEME || DEFAULT_REVERB_SCHEME).toLowerCase();
  const forceTLS = scheme === 'https';
  const wsHost = import.meta.env.VITE_REVERB_HOST || DEFAULT_REVERB_HOST;
  const wsPort = Number(
    import.meta.env.VITE_REVERB_PORT
      || (forceTLS ? 443 : DEFAULT_REVERB_PORT),
  );

  return new Echo({
    broadcaster: 'reverb',
    key,
    wsHost,
    wsPort,
    wssPort: Number(import.meta.env.VITE_REVERB_PORT || (forceTLS ? 443 : DEFAULT_REVERB_PORT)),
    forceTLS,
    enabledTransports: ['ws', 'wss'],
    authEndpoint,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });
}
