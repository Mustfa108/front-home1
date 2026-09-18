import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { resultsApi } from '../../api/results';
import { formatScore } from '../../utils/format';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReadinessBadge } from '../../components/ui/Badge';
import { FullPageSpinner } from '../../components/ui/Spinner';

function ChangeBadge({ change, difference, differencePercent }) {
  if (change === 'new') return <span className="badge-neutral">محور جديد</span>;
  if (difference == null) return <span className="badge-neutral">—</span>;
  const arrow =
    change === 'improved' ? <TrendingUp size={13} /> : change === 'declined' ? <TrendingDown size={13} /> : <Minus size={13} />;
  const cls =
    change === 'improved' ? 'badge-good' : change === 'declined' ? 'badge-low' : 'badge-neutral';
  const sign = difference > 0 ? '+' : '';
  return (
    <span className={`${cls} inline-flex items-center gap-1`}>
      {arrow}
      {sign}{formatScore(difference)}
      {differencePercent != null && (
        <span className="text-[10px]">({sign}{formatScore(differencePercent)}%)</span>
      )}
    </span>
  );
}

/**
 * /dashboard/assessments/compare — side-by-side comparison of exactly two
 * assessments: overall delta, per-axis rows with numeric + percentage
 * differences, and improved/declined/unchanged highlights.
 */
export default function CompareResults() {
  useDocumentTitle('مقارنة النتائج');
  const [params] = useSearchParams();
  const firstId = params.get('first');
  const secondId = params.get('second');

  const { data, loading, error } = useAsync(
    () => resultsApi.compare(firstId, secondId),
    { deps: [firstId, secondId] },
  );

  if (loading) return <FullPageSpinner />;
  if (error || !data) {
    return (
      <PageContainer>
        <EmptyState
          title="تعذّر تحميل المقارنة"
          description={error || 'تأكد من اختيار تقييمين مختلفين من سجل تقييماتك.'}
          action={
            <Button onClick={() => window.history.back()} leftIcon={<ArrowLeft size={16} />}>
              رجوع
            </Button>
          }
        />
      </PageContainer>
    );
  }

  const { first, second, overall, axes, improved_axes, declined_axes, unchanged_axes, most_improved, most_declined } = data;
  const overallCls =
    overall.direction === 'improved' ? 'text-emerald-600 dark:text-emerald-400' : overall.direction === 'declined' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-300';

  return (
    <PageContainer>
      <PageHeader
        title="مقارنة النتائج"
        subtitle={`التقييم #${first.id} مقابل التقييم #${second.id}`}
        actions={
          <a href="/dashboard/assessments" className="btn-secondary">
            <ArrowLeft size={16} />
            رجوع للسجل
          </a>
        }
      />

      {/* Overall */}
      <Card>
        <CardBody>
          <div className="grid items-center gap-6 text-center md:grid-cols-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">التقييم السابق #{first.id}</p>
              <p className="mt-1 text-5xl font-extrabold text-slate-700 dark:text-slate-100">{formatScore(overall.first_score, 1)}</p>
              <div className="mt-2"><ReadinessBadge level={first.readiness_level} /></div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">مقدار التحسن / التراجع</p>
              <p className={`mt-1 text-5xl font-extrabold ${overallCls}`}>
                {overall.difference > 0 ? '+' : ''}{formatScore(overall.difference, 1)}
              </p>
              {overall.difference_percent != null && (
                <p className={`text-sm font-semibold ${overallCls}`}>
                  ({overall.difference_percent > 0 ? '+' : ''}{formatScore(overall.difference_percent)}%)
                </p>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">التقييم الحالي #{second.id}</p>
              <p className="mt-1 text-5xl font-extrabold text-brand-700 dark:text-brand-300">{formatScore(overall.second_score, 1)}</p>
              <div className="mt-2"><ReadinessBadge level={second.readiness_level} /></div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Most improved / declined summary */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Card>
          <CardBody>
            <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-700">
              <TrendingUp size={16} />
              أكثر محور تحسناً
            </h4>
            {most_improved ? (
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="font-bold">{most_improved.pillar_name_ar}</span> — تحسن بمقدار{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">+{formatScore(most_improved.difference)}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">لا يوجد تحسن في أي محور.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h4 className="flex items-center gap-2 text-sm font-bold text-red-700">
              <TrendingDown size={16} />
              أكثر محور تراجعاً
            </h4>
            {most_declined ? (
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
                <span className="font-bold">{most_declined.pillar_name_ar}</span> — تراجع بمقدار{' '}
                <span className="font-bold text-red-600 dark:text-red-400">{formatScore(most_declined.difference)}</span>
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">لا يوجد تراجع في أي محور.</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Axis comparison table */}
      <Card className="mt-5">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">المحور</th>
                  <th className="px-4 py-3 text-center font-semibold">#{first.id}</th>
                  <th className="px-4 py-3 text-center font-semibold">#{second.id}</th>
                  <th className="px-4 py-3 text-center font-semibold">الفرق (رقمي / نسبي)</th>
                </tr>
              </thead>
              <tbody>
                {axes.map((axis) => (
                  <tr
                    key={axis.pillar_id}
                    className={`border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/60 ${
                      axis.change === 'improved'
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
                        : axis.change === 'declined'
                          ? 'bg-red-50/40 dark:bg-red-950/20'
                          : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-100">{axis.pillar_name_ar}</td>
                    <td className="px-4 py-3 text-center text-slate-600 dark:text-slate-300">{formatScore(axis.first_percentage ?? 0)}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-100">{formatScore(axis.second_percentage ?? 0)}</td>
                    <td className="px-4 py-3 text-center">
                      <ChangeBadge change={axis.change} difference={axis.difference} differencePercent={axis.difference_percent} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Grouped lists */}
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <h4 className="text-sm font-bold text-emerald-700">محاور تحسنت ({improved_axes.length})</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {improved_axes.map((a) => (
                <li key={a.pillar_id}>{a.pillar_name_ar} (+{formatScore(a.difference)})</li>
              ))}
              {improved_axes.length === 0 && <li className="text-slate-400 dark:text-slate-500">—</li>}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h4 className="text-sm font-bold text-red-700 dark:text-red-400">محاور تراجعت ({declined_axes.length})</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {declined_axes.map((a) => (
                <li key={a.pillar_id}>{a.pillar_name_ar} ({formatScore(a.difference)})</li>
              ))}
              {declined_axes.length === 0 && <li className="text-slate-400 dark:text-slate-500">—</li>}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">محاور لم تتغير ({unchanged_axes.length})</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {unchanged_axes.map((a) => (
                <li key={a.pillar_id}>{a.pillar_name_ar}</li>
              ))}
              {unchanged_axes.length === 0 && <li className="text-slate-400 dark:text-slate-500">—</li>}
            </ul>
          </CardBody>
        </Card>
      </div>
    </PageContainer>
  );
}
