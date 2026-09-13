import { userApi } from './client';

/* ============================================================
   Assessment results: list, details, comparison, progress
   ============================================================ */
export const resultsApi = {
  list: (params = {}) => userApi.get('/assessments', { params }).then((r) => r.data),
  show: (id) => userApi.get(`/assessments/${id}`).then((r) => r.data),
  compare: (firstId, secondId) =>
    userApi
      .get('/assessments/compare', { params: { first_id: firstId, second_id: secondId } })
      .then((r) => r.data),
  progress: () => userApi.get('/assessments/progress').then((r) => r.data),
};

/* ============================================================
   AI analysis + context-bound chat
   ============================================================ */
export const aiApi = {
  getAnalysis: (id) => userApi.get(`/assessments/${id}/ai-analysis`).then((r) => r.data),
  generateAnalysis: (id) =>
    userApi.post(`/assessments/${id}/ai-analysis`).then((r) => r.data),
  chat: (id, message) =>
    userApi.post(`/assessments/${id}/ai-chat`, { message }).then((r) => r.data),
  chatHistory: (id) => userApi.get(`/assessments/${id}/ai-chat`).then((r) => r.data),
};
