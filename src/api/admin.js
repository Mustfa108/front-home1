import { adminApi } from './client';

export const adminApi_ = {
  dashboard: () => adminApi.get('/admin/dashboard').then((r) => r.data),
  users: (params = {}) =>
    adminApi.get('/admin/users', { params }).then((r) => r.data),
  assessments: (params = {}) =>
    adminApi.get('/admin/assessments', { params }).then((r) => r.data),
  assessment: (id) =>
    adminApi.get(`/admin/assessments/${id}`).then((r) => r.data),
  pillarAnalytics: () =>
    adminApi.get('/admin/analytics/pillars').then((r) => r.data),

  /* Statistics with date / org-type / org-size filters */
  statistics: (params = {}) =>
    adminApi.get('/admin/statistics', { params }).then((r) => r.data),
};

/* ============================================================
   Axes (pillars) management — draft versions only
   ============================================================ */
export const axesApi = {
  list: (params = {}) => adminApi.get('/admin/axes', { params }).then((r) => r.data),
  create: (payload) => adminApi.post('/admin/axes', payload).then((r) => r.data),
  update: (id, payload) => adminApi.patch(`/admin/axes/${id}`, payload).then((r) => r.data),
  toggle: (id) => adminApi.patch(`/admin/axes/${id}/toggle`).then((r) => r.data),
};

/* ============================================================
   Questions management — draft versions only
   ============================================================ */
export const questionsApi = {
  list: (params = {}) => adminApi.get('/admin/questions', { params }).then((r) => r.data),
  create: (payload) => adminApi.post('/admin/questions', payload).then((r) => r.data),
  update: (id, payload) => adminApi.patch(`/admin/questions/${id}`, payload).then((r) => r.data),
  toggle: (id) => adminApi.patch(`/admin/questions/${id}/toggle`).then((r) => r.data),
};

/* ============================================================
   Questionnaire versioning
   ============================================================ */
export const versionsApi = {
  list: () => adminApi.get('/admin/assessment-versions').then((r) => r.data),
  show: (id) => adminApi.get(`/admin/assessment-versions/${id}`).then((r) => r.data),
  createDraft: (payload = {}) =>
    adminApi.post('/admin/assessment-versions', payload).then((r) => r.data),
  publish: (id) =>
    adminApi.post(`/admin/assessment-versions/${id}/publish`).then((r) => r.data),
};

/* ============================================================
   AI analyses review
   ============================================================ */
export const aiAnalysesApi = {
  list: (params = {}) =>
    adminApi.get('/admin/ai-analyses', { params }).then((r) => r.data),
  show: (id) => adminApi.get(`/admin/ai-analyses/${id}`).then((r) => r.data),
  regenerate: (id) =>
    adminApi.post(`/admin/ai-analyses/${id}/regenerate`).then((r) => r.data),
  review: (id, decision) =>
    adminApi.patch(`/admin/ai-analyses/${id}/review`, { decision }).then((r) => r.data),
};
