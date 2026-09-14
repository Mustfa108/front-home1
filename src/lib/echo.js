import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

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

  return new Echo({
    broadcaster: 'reverb',
    key,
    wsHost: import.meta.env.VITE_REVERB_HOST || window.location.hostname,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT || 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
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
