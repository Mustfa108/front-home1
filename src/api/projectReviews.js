import { userApi } from './client';

const AI_TIMEOUT_MS = 90000;

export const projectReviewsApi = {
  list: () => userApi.get('/project-reviews').then((r) => r.data),
  create: (payload) =>
    userApi.post('/project-reviews', payload, { timeout: AI_TIMEOUT_MS }).then((r) => r.data),
  get: (id) => userApi.get(`/project-reviews/${id}`).then((r) => r.data),
  chat: (id, message) =>
    userApi.post(`/project-reviews/${id}/chat`, { message }, { timeout: AI_TIMEOUT_MS }).then((r) => r.data),
};