import { userApi } from './client';

export const projectReviewsApi = {
  list: () => userApi.get('/project-reviews').then((r) => r.data),
  create: (payload) => userApi.post('/project-reviews', payload).then((r) => r.data),
  get: (id) => userApi.get(`/project-reviews/${id}`).then((r) => r.data),
  chat: (id, message) =>
    userApi.post(`/project-reviews/${id}/chat`, { message }).then((r) => r.data),
};