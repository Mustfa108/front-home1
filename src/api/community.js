import { userApi, API_BASE_URL } from './client';

export const communityChatApi = {
  list: () => userApi.get('/community-chat/messages').then((r) => r.data),
  send: (body) => userApi.post('/community-chat/messages', { body }).then((r) => r.data),
};

export const projectMapApi = {
  list: () => userApi.get('/project-map').then((r) => r.data),
};

export const publicSettingsApi = {
  socialLinks: async () => {
    const res = await fetch(`${API_BASE_URL}/public/social-links`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error('تعذّر تحميل روابط التواصل');
    }
    return res.json();
  },
};
