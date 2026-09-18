import { useState } from 'react';
import { GitBranch, PlusCircle, Rocket } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { versionsApi } from '../../api/admin';
import { formatDate } from '../../utils/format';
import { PageHeader } from '../../components/layout/Navbar';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody, CardHeader, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';

const STATUS_LABELS = {
  draft: { label: 'مسودة', cls: 'badge-medium' },
  published: { label: 'منشور وفعال', cls: 'badge-good' },
  archived: { label: 'مؤرشف', cls: 'badge-neutral' },
};

/**
 * /admin/assessment-versions — manage questionnaire versions: create a draft
 * (copies the latest published), review weights, publish with confirmation.
 */
export default function AdminAssessmentVersions() {
  useDocumentTitle('إصدارات التقييم');
  const toast = useToast();
  const [creating, setCreating] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [confirmPublish, setConfirmPublish] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { data, loading, error } = useAsync(() => versionsApi.list(), { deps: [reloadKey] });

  if (loading && !data) {
    return (
      <AdminLayout>
        <FullPageSpinner />
      </AdminLayout>
    );
  }

  const d = data || {};
  const versions = d.versions || [];

  const createDraft = async () => {
    setCreating(true);
    try {
      await versionsApi.createDraft({});
      toast.success('تم إنشاء مسودة إصدار جديد (نسخة من آخر إصدار منشور).');
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'تعذّر إنشاء المسودة.');
    } finally {
      setCreating(false);
    }
  };

  const publish = async () => {
    setPublishingId(confirmPublish.id);
    try {
      await versionsApi.publish(confirmPublish.id);
      toast.success('تم نشر الإصدار بنجاح وأصبح معتمداً للتقييمات الجديدة.');
      setConfirmPublish(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'تعذّر نشر الإصدار.');
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="إصدارات التقييم"
        subtitle="كل تقييم مرتبط بإصدار محدد من الأسئلة والأوزان — تعديلاتك لا تغيّر النتائج السابقة"
        actions={
          !d.draft_version && (
            <Button onClick={createDraft} loading={creating} leftIcon={<PlusCircle size={16} />}>
              إنشاء مسودة جديدة
            </Button>
          )
        }
      />

      {error ? (
        <Card><CardBody><p className="text-sm text-red-600">{error}</p></CardBody></Card>
      ) : versions.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={<GitBranch size={44} />} title="لا توجد إصدارات" description="أنشئ أول إصدار للاستبيان." />
        </CardBody></Card>
      ) : (
        <div className="grid gap-3">
          {versions.map((v) => {
            const status = STATUS_LABELS[v.status] || STATUS_LABELS.archived;
            return (
              <Card key={v.id}>
                <CardBody>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        الإصدار {v.version_number}
                        <span className={`${status.cls} mr-2`}>{status.label}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {v.axes_count} محور — {v.questions_count} سؤال
                        {v.published_at ? ` — نُشر في ${formatDate(v.published_at)}` : ''}
                      </p>
                      {v.notes_ar && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{v.notes_ar}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {v.status === 'draft' && (
                        <Button onClick={() => setConfirmPublish(v)} leftIcon={<Rocket size={16} />}>
                          نشر الإصدار
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {confirmPublish && (
        <Modal open onClose={() => setConfirmPublish(null)} title="تأكيد نشر الإصدار">
          <div className="space-y-4">
            <Card>
              <CardHeader title={`الإصدار ${confirmPublish.version_number}`} />
              <CardBody>
                <p className="text-sm leading-7 text-slate-700">
                  بالنشر سيصبح هذا الإصدار معتمداً لجميع التقييمات الجديدة، وسيُؤرشف الإصدار المنشور الحالي.
                  لا يمكن تعديل الإصدار بعد نشره. تأكد من مراجعة المحاور والأسئلة والأوزان أولاً.
                </p>
              </CardBody>
            </Card>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmPublish(null)}>إلغاء</Button>
              <Button onClick={publish} loading={publishingId === confirmPublish.id}>تأكيد النشر</Button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}
