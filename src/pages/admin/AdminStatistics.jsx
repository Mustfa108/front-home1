import { useState } from 'react';
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  Loader2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { adminApi_ } from '../../api/admin';
import { formatScore } from '../../utils/format';
import { PageHeader } from '../../components/layout/Navbar';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner, InlineSpinner } from '../../components/ui/Spinner';

const TYPE_OPTIONS = [
  { value: '', label: 'كل الأنواع' },
  { value: 'civil_society', label: 'منظمة مجتمع مدني' },
  { value: 'volunteer_team', label: 'فريق تطوعي' },
  { value: 'startup', label: 'مشروع ناشئ' },
  { value: 'other', label: 'أخرى' },
];

const SIZE_OPTIONS = [
  { value: '', label: 'كل الأحجام' },
  { value: 'small', label: 'صغيرة' },
  { value: 'medium', label: 'متوسطة' },
  { value: 'large', label: 'كبيرة' },
];

function StatTile({ icon, label, value }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-300">
          {icon}
        </span>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

/** /admin/statistics — platform KPIs with date/type/size filters. */
export default function AdminStatistics() {
  const [filters, setFilters] = useState({ from: '', to: '', type: '', size: '' });
  const [applied, setApplied] = useState({});

  const { data, loading, error, refresh } = useAsync(
    () => adminApi_.statistics(applied),
    { deps: [applied] },
  );

  const apply = (e) => {
    e.preventDefault();
    setApplied(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
  };

  if (loading && !data) {
    return (
      <AdminLayout>
        <FullPageSpinner />
      </AdminLayout>
    );
  }
  if (error) {
    return (
      <AdminLayout>
        <Card>
          <CardBody>
            <p className="text-sm text-red-600">{error}</p>
            <Button className="mt-3" onClick={refresh} leftIcon={<RefreshCw size={14} />}>إعادة المحاولة</Button>
          </CardBody>
        </Card>
      </AdminLayout>
    );
  }

  const d = data || {};

  return (
    <AdminLayout>
      <PageHeader title="إحصائيات المنصة" subtitle="مؤشرات عامة قابلة للتصفية بالتاريخ ونوع وحجم المنظمة" />

      {/* Filters */}
      <Card>
        <CardBody>
          <form onSubmit={apply} className="grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <Input type="date" label="من تاريخ" value={filters.from} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
            <Input type="date" label="إلى تاريخ" value={filters.to} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
            <div>
              <label className="label">نوع المنظمة</label>
              <select className="input" value={filters.type} onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">حجم المنظمة</label>
              <select className="input" value={filters.size} onChange={(e) => setFilters((f) => ({ ...f, size: e.target.value }))}>
                {SIZE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <Button type="submit" loading={loading} leftIcon={<BarChart3 size={16} />}>تطبيق الفلاتر</Button>
          </form>
        </CardBody>
      </Card>

      {/* KPI tiles */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile icon={<Users size={20} />} label="عدد المستخدمين" value={d.total_users ?? 0} />
        <StatTile icon={<Building2 size={20} />} label="عدد المنظمات" value={d.total_organizations ?? 0} />
        <StatTile icon={<ClipboardCheck size={20} />} label="تقييمات مكتملة (خلال الفترة)" value={d.completed_assessments ?? 0} />
        <StatTile icon={<TrendingUp size={20} />} label="متوسط الجاهزية العام" value={`${formatScore(d.average_readiness ?? 0, 1)}%`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* Axis averages */}
        <Card>
          <CardHeader title="متوسط نتيجة كل محور" subtitle={d.strongest_axis ? `الأقوى: ${d.strongest_axis.pillar_name_ar} (${formatScore(d.strongest_axis.average_percentage, 1)}%) — الأضعف: ${d.weakest_axis?.pillar_name_ar} (${formatScore(d.weakest_axis?.average_percentage ?? 0, 1)}%)` : ''} />
          <CardBody className="space-y-2.5">
            {(d.axis_averages || []).map((axis) => (
              <div key={axis.pillar_id} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-200">{axis.pillar_name_ar}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${Math.min(100, axis.average_percentage)}%` }}
                  />
                </div>
                <span className="w-14 text-left text-sm font-bold text-slate-700 dark:text-slate-200">
                  {formatScore(axis.average_percentage, 1)}%
                </span>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Distributions */}
        <Card>
          <CardHeader title="توزيع مستويات الجاهزية" />
          <CardBody className="space-y-2.5">
            {Object.entries(d.readiness_distribution || {}).map(([key, row]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-16 text-sm font-semibold text-slate-700 dark:text-slate-200">{row.label_ar}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${row.percentage}%`,
                      backgroundColor: key === 'low' ? '#DC2626' : key === 'medium' ? '#F59E0B' : '#16A34A',
                    }}
                  />
                </div>
                <span className="w-24 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {row.count} ({row.percentage}%)
                </span>
              </div>
            ))}

            <hr className="my-3 border-slate-100 dark:border-slate-800" />

            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">توزيع المنظمات بحسب النوع</h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {Object.entries(d.org_type_distribution || {}).map(([type, count]) => (
                <li key={type} className="flex justify-between">
                  <span>{TYPE_OPTIONS.find((o) => o.value === type)?.label || type}</span>
                  <span className="font-bold">{count}</span>
                </li>
              ))}
            </ul>

            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">توزيع المنظمات بحسب الحجم</h4>
            <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {Object.entries(d.org_size_distribution || {}).map(([size, count]) => (
                <li key={size} className="flex justify-between">
                  <span>{SIZE_OPTIONS.find((o) => o.value === size)?.label || size}</span>
                  <span className="font-bold">{count}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Time series */}
      <Card className="mt-5">
        <CardHeader title="التغير في عدد التقييمات بمرور الوقت" />
        <CardBody>
          {(d.assessments_over_time || []).length === 0 ? (
            <p className="text-sm text-slate-500">لا توجد تقييمات خلال الفترة المحددة.</p>
          ) : (
            <div className="flex h-40 items-end gap-2 overflow-x-auto">
              {d.assessments_over_time.map((row) => {
                const max = Math.max(...d.assessments_over_time.map((r) => r.count));
                return (
                  <div key={row.period} className="flex min-w-[46px] flex-1 flex-col items-center gap-1">
                    <span className="text-xs font-bold text-slate-600">{row.count}</span>
                    <div
                      className="w-full rounded-t-lg bg-brand-500"
                      style={{ height: `${max > 0 ? (row.count / max) * 110 : 4}px` }}
                    />
                    <span className="text-[10px] text-slate-500">{row.period}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardBody>
      </Card>

      {loading && (
        <div className="mt-3 flex justify-center">
          <InlineSpinner label="جاري تحديث الإحصائيات…" />
        </div>
      )}
    </AdminLayout>
  );
}
