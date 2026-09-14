import { userApi, API_BASE_URL } from './client';

/**
 * Download the PDF for an assessment.
 * The backend returns a binary stream (not JSON), so we use blob responseType.
 * If the API returns a JSON error as a blob, surface the Arabic message instead
 * of saving a corrupt file.
 */
export async function downloadReport(assessmentId) {
  const token = localStorage.getItem('humascale_user_token');
  try {
    const response = await userApi.get(`/report/${assessmentId}/download`, {
      responseType: 'blob',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const contentType = response.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      const text = await response.data.text();
      let message = 'تعذّر تحميل التقرير.';
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || message;
      } catch {
        /* ignore */
      }
      throw { message };
    }

    const disposition = response.headers['content-disposition'] || '';
    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
    const filename = match
      ? decodeURIComponent(match[1])
      : `humascale_report_${assessmentId}.pdf`;

    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    if (error?.message && !error?.raw) {
      throw error;
    }

    const blob = error?.raw?.response?.data;
    if (blob instanceof Blob) {
      try {
        const text = await blob.text();
        const parsed = JSON.parse(text);
        throw { message: parsed.message || 'تعذّر تحميل التقرير.' };
      } catch (inner) {
        if (inner?.message) throw inner;
      }
    }

    throw {
      message: error?.message || 'تعذّر تحميل التقرير.',
    };
  }
}

export const reportApi = {
  status: (assessmentId) =>
    userApi.get(`/report/${assessmentId}/status`).then((r) => r.data),
  regenerate: (assessmentId) =>
    userApi.post(`/report/${assessmentId}/regenerate`).then((r) => r.data),
  pdfUrl: (assessmentId) =>
    `${API_BASE_URL}/report/${assessmentId}/download`,
};
