import { useState } from 'react';
import { Bot, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { aiAnalysesApi } from '../../api/admin';
import { formatDate } from '../../utils/format';
import { PageHeader } from '../../components/layout/Navbar';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody, CardHeader, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';

const STATUS_BADGES = {
  completed: { label: 'مكتمل', cls: 'badge-good' },
  approved: { label: 'معتمد', cls: 'badge-good' },
  rejected: { label: 'مرفوض', cls: 'badge-low' },
  failed: { label: 'فاشل', cls: 'badge-low' },
  pending: { label: 'قيد المعالجة', cls: 'badge-medium' },
};

/**
 * /admin/ai-analyses — review generated AI analyses: inspect model + status,
 * regenerate, approve/reject.
 */
export default function AdminAiAnalyses() {
  useDocumentTitle('مراجعة التحليلات الذكية');
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { data, loading, error } = useAsync(
    () => aiAnalysesApi.list(),
    { deps: [reloadKey] },
  );

  if (loading && !data) {
    return (
      <AdminLayout>
        <FullPageSpinner />
      </AdminLayout>
    );
  }

  const items = data?.data || [];

  const regenerate = async (analysis) => {
    setBusyId(analysis.id);
    try {
      await aiAnalysesApi.regenerate(analysis.id);
      toast.success('تم إعادة توليد التحليل.');
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'تعذّرت إعادة التوليد.');
    } finally {
      setBusyId(null);
    }
  };

  const review = async (analysis, decision) => {
    setBusyId(analysis.id);
    try {
      await aiAnalysesApi.review(analysis.id, decision);
      toast.success(decision === 'approved' ? 'تم اعتماد التحليل.' : 'تم رفض التحليل.');
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'تعذّر تنفيذ المراجعة.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader title="مراجعة التحليلات الذكية" subtitle="عرض وإدارة مخرجات الذكاء الاصطناعي قبل ظهورها للمستخدمين" />

      {error ? (
        <Card><CardBody><p className="text-sm text-red-600">{error}</p></CardBody></Card>
      ) : items.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={<Bot size={44} />} title="لا توجد تحليلات" description="ستظهر التحليلات المولدة هنا بعد إتمام المستخدمين لتقييماتهم." />
        </CardBody></Card>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => {
            const badge = STATUS_BADGES[a.status] || STATUS_BADGES.pending;
            return (
              <Card key={a.id}>
                <CardBody>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        تقييم #{a.assessment_id}
                        {a.org_name && <span className="text-slate-500 dark:text-slate-400"> — {a.org_name}</span>}
                        <span className={`${badge.cls} mr-2`}>{badge.label}</span>
                        {a.is_fallback && <span className="badge-medium mr-1">تحليل احتياطي</span>}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        النموذج: {a.model} — أُنشئ في {formatDate(a.created_at)}
                        {a.duration_ms ? ` — زمن الاستجابة: ${a.duration_ms}ms` : ''}
                        {a.reviewed_at ? ` — راجعه الأدمن في ${formatDate(a.reviewed_at)}` : ''}
                      </p>
                      {a.error_message && (
                        <p className="mt-1 text-xs text-amber-700">{a.error_message}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant="secondary" onClick={() => setDetail(a)}>عرض</Button>
                      <Button variant="secondary" loading={busyId === a.id} onClick={() => regenerate(a)} leftIcon={<RefreshCw size={14} />}>
                        إعادة توليد
                      </Button>
                      <Button loading={busyId === a.id} onClick={() => review(a, 'approved')} leftIcon={<CheckCircle2 size={14} />} disabled={a.status === 'approved'}>
                        اعتماد
                      </Button>
                      <Button variant="danger" onClick={() => review(a, 'rejected')} leftIcon={<XCircle size={14} />} disabled={a.status === 'rejected'}>
                        رفض
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {detail && (
        <Modal open size="lg" onClose={() => setDetail(null)} title={`تحليل التقييم #${detail.assessment_id}`}>
          <Card>
            <CardHeader title="محتوى التحليل" subtitle={`النموذج: ${detail.model} — إصدار القالب: ${detail.prompt_version}`} />
            <CardBody className="space-y-3 text-sm leading-7">
              {detail.response_json ? (
                <>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">الملخص العام</p>
                  <p className="text-slate-600 dark:text-slate-300">{detail.response_json.overall_summary}</p>

                  <p className="font-semibold text-slate-800 dark:text-slate-100">التوصيات</p>
                  <ol className="list-inside list-decimal space-y-1 text-slate-600 dark:text-slate-300">
                    {(detail.response_json.recommendations || []).map((r, i) => (
                      <li key={i}>
                        {r.title ? `${r.title}: ${r.description}` : r.description}
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <p className="text-slate-500">لا يوجد محتوى محفوظ لهذا التحليل.</p>
              )}
            </CardBody>
          </Card>
        </Modal>
      )}
    </AdminLayout>
  );
}
