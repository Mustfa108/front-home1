import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ClipboardList, GitCompareArrows, Loader2, FileDown } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { resultsApi } from '../../api/results';
import { downloadReport } from '../../api/report';
import { readinessFromKey } from '../../utils/constants';
import { formatDate, formatScore } from '../../utils/format';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReadinessBadge } from '../../components/ui/Badge';
import { FullPageSpinner } from '../../components/ui/Spinner';

/**
 * /dashboard/assessments — full assessment history with version info, AI
 * status, and selection of exactly two assessments for comparison.
 */
export default function AssessmentHistory() {
  useDocumentTitle('سجل التقييمات');
  const toast = useToast();
  const [selected, setSelected] = useState([]);
  const [downloadingId, setDownloadingId] = useState(null);

  const { data, loading, error } = useAsync(
    () => resultsApi.list(),
    { deps: [] },
  );

  if (loading) return <FullPageSpinner />;
  if (error) {
    return (
      <PageContainer>
        <EmptyState
          title="تعذّر تحميل السجل"
          description={error}
          action={<Link to="/dashboard" className="btn-primary">العودة للوحة المعلومات</Link>}
        />
      </PageContainer>
    );
  }

  const items = data?.data || [];

  const toggleSelect = (id) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) {
        toast.error('يمكنك اختيار تقييمين فقط للمقارنة.');
        return prev;
      }
      return [...prev, id];
    });
  };

  const canCompare = selected.length === 2;

  return (
    <PageContainer>
      <PageHeader
        title="سجل التقييمات"
        subtitle={`لديك ${items.length} تقييم مكتمل — اختر تقييمين للمقارنة`}
        actions={
          canCompare ? (
            <Link
              to={`/dashboard/assessments/compare?first=${selected[0]}&second=${selected[1]}`}
              className="btn-primary"
            >
              <GitCompareArrows size={16} />
              مقارنة التقييمين
            </Link>
          ) : (
            <Link to="/assessment" className="btn-primary">
              تقييم جديد
              <ArrowLeft size={16} />
            </Link>
          )
        }
      />

      {items.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<ClipboardList size={48} />}
              title="لا توجد تقييمات بعد"
              description="ابدأ تقييمك الأول لرؤية سجل التقييمات هنا."
              action={
                <Link to="/assessment" className="btn-primary">
                  ابدأ التقييم
                  <ArrowLeft size={16} />
                </Link>
              }
            />
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map((a) => {
            const isSelected = selected.includes(a.id);
            return (
              <Card
                key={a.id}
                className={`transition ${isSelected ? 'ring-2 ring-brand-500' : 'hover:shadow-card'}`}
              >
                <CardBody>
                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        className="mt-1 h-5 w-5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                        checked={isSelected}
                        onChange={() => toggleSelect(a.id)}
                        aria-label="تحديد للمقارنة"
                      />
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-extrabold text-white"
                        style={{ backgroundColor: readinessFromKey(a.readiness_level).color }}
                      >
                        {Math.round(a.overall_score)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          تقييم رقم #{a.id}
                          {a.version_number && (
                            <span className="badge-neutral mr-2">إصدار الاستبيان {a.version_number}</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-500">{formatDate(a.completed_at)}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <ReadinessBadge level={a.readiness_level} />
                          <span className="text-xs font-semibold text-slate-600">
                            {formatScore(a.overall_score, 1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={async () => {
                          setDownloadingId(a.id);
                          try {
                            await downloadReport(a.id);
                          } catch (err) {
                            toast.error(err?.message || 'تعذّر التحميل.');
                          } finally {
                            setDownloadingId(null);
                          }
                        }}
                        leftIcon={downloadingId === a.id ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                      >
                        PDF
                      </Button>
                      <Link to={`/assessment/${a.id}/results`} className="btn-primary">
                        عرض النتيجة
                        <ArrowLeft size={16} />
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
