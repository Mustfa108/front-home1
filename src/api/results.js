import { userApi } from './client';

const AI_TIMEOUT_MS = 90000;

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
  generateAnalysis: (id, { force = false } = {}) =>
    userApi
      .post(`/assessments/${id}/ai-analysis`, force ? { force: true } : {}, { timeout: AI_TIMEOUT_MS })
      .then((r) => r.data),
  chat: (id, message) =>
    userApi.post(`/assessments/${id}/ai-chat`, { message }, { timeout: AI_TIMEOUT_MS }).then((r) => r.data),
  chatHistory: (id) => userApi.get(`/assessments/${id}/ai-chat`).then((r) => r.data),
};
