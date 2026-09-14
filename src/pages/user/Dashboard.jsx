import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  History as HistoryIcon,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Award,
  FileDown,
  LineChart,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { dashboardApi } from '../../api/dashboard';
import { downloadReport } from '../../api/report';
import { readinessFromKey } from '../../utils/constants';
import { formatDate, formatScore } from '../../utils/format';
import { pillarLabel } from '../../utils/locale';
import { useLanguage } from '../../contexts/LanguageContext';
import { useToast } from '../../contexts/ToastContext';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { PillarRadarChart } from '../../components/charts/PillarRadarChart';
import { Card, CardBody, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReadinessBadge } from '../../components/ui/Badge';
import { FullPageSpinner, InlineSpinner } from '../../components/ui/Spinner';
import Tooltip, { InfoTip } from '../../components/ui/Tooltip';
import HowToUseGuide from '../../components/help/HowToUseGuide';
import { OrgProfileGate } from '../../components/OrgProfileGate';
import Reveal from '../../components/Reveal';
import { useState } from 'react';

export default function Dashboard() {
  const { locale, t } = useLanguage();
  useDocumentTitle(t('dashboard.title'));
  const { user } = useAuth();
  const toast = useToast();
  const [guideOpen, setGuideOpen] = useState(false);
  const { data, loading, error, refresh } = useAsync(() => dashboardApi.get(), {
    deps: [],
  });

  if (loading && !data) return <FullPageSpinner />;
  if (error) {
    return (
      <PageContainer>
        <EmptyState
          icon={<AlertTriangle size={40} />}
          title="تعذّر تحميل لوحة المعلومات"
          description={error}
          action={
            <Button onClick={refresh} leftIcon={<RefreshCw size={16} />}>
              إعادة المحاولة
            </Button>
          }
        />
      </PageContainer>
    );
  }

  if (!data?.has_assessment) {
    return <NoAssessmentState user={user} />;
  }

  const latest = data.latest_assessment;
  const readiness = readinessFromKey(latest.readiness_level);
  const totalAssessments = data.total_assessments || 0;
  const improvement = data.improvement;
  const trend = data.score_trend || [];
  const firstName = user?.name?.split(' ')[0] || '';

  const handlePdfDownload = async (e) => {
    e.preventDefault();
    if (!latest.pdf_ready) {
      toast.error(t('dashboard.pdfPending'));
      return;
    }
    try {
      await downloadReport(latest.id);
      toast.success(locale === 'en' ? 'PDF downloaded.' : 'تم تنزيل التقرير.');
    } catch (err) {
      toast.error(err?.message || (locale === 'en' ? 'Could not download PDF.' : 'تعذّر تنزيل التقرير.'));
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={`${t('dashboard.greeting')}، ${firstName}`}
        subtitle={locale === 'en' ? 'Your readiness at a glance' : 'جاهزيتك في نظرة واحدة'}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Tooltip content={locale === 'en' ? 'How to use the platform' : 'كيف تستخدم المنصة'} side="bottom">
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-600 shadow-sm transition hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-brand-400"
                aria-label={locale === 'en' ? 'How to use' : 'كيف أستخدم المنصة؟'}
              >
                <HelpCircle size={18} />
              </button>
            </Tooltip>
            <Button variant="secondary" onClick={refresh} leftIcon={<RefreshCw size={16} />}>
              تحديث
            </Button>
            <Link to="/assessment" className="btn-primary">
              <ClipboardList size={16} />
              تقييم جديد
            </Link>
          </div>
        }
      />

      <OrgProfileGate className="mb-5" />

      {/* Hero score band */}
      <Reveal>
        <section
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-brand-50/40 to-slate-50 p-6 shadow-soft dark:border-slate-700 dark:from-slate-900 dark:via-brand-950/30 dark:to-slate-950 sm:p-8"
        >
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
            style={{ backgroundColor: readiness.color }}
          />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t('dashboard.latestScore')}
              </p>
              <div className="mt-2 flex flex-wrap items-end gap-4">
                <span className="text-6xl font-extrabold leading-none sm:text-7xl" style={{ color: readiness.color }}>
                  {formatScore(latest.overall_score, 1)}
                </span>
                <div className="mb-1 space-y-2">
                  <ReadinessBadge level={latest.readiness_level} />
                  {improvement && (
                    <div
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        improvement.direction === 'improved'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : improvement.direction === 'declined'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {improvement.direction === 'improved' ? <ArrowUpRight size={14} /> : null}
                      {improvement.direction === 'declined' ? <ArrowDownRight size={14} /> : null}
                      {improvement.direction === 'improved'
                        ? `+${formatScore(improvement.difference, 1)}`
                        : improvement.direction === 'declined'
                          ? `-${formatScore(Math.abs(improvement.difference), 1)}`
                          : 'مستقر'}
                    </div>
                  )}
                </div>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                {locale === 'en' ? readiness.descriptionEn : readiness.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Award size={14} />
                  {totalAssessments} {totalAssessments === 1 ? 'تقييم' : 'تقييمات'}
                </span>
                <span>•</span>
                <span>{formatDate(latest.created_at, { withTime: false })}</span>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={`/assessment/${latest.id}/results`} className="btn-primary">
                  {t('dashboard.viewResults')}
                  <ArrowLeft size={16} />
                </Link>
                <Link to="/project-review" className="btn-secondary">
                  <Sparkles size={16} />
                  تقييم مشروع
                </Link>
                <Link to="/dashboard/assessments" className="btn-secondary">
                  <HistoryIcon size={16} />
                  السجل
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {data.strongest_pillar && (
                <div className="rounded-2xl bg-emerald-50/80 p-4 dark:bg-emerald-950/40">
                  <p className="text-xs text-slate-500 dark:text-slate-400">أقوى محور</p>
                  <p className="mt-1 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    {data.strongest_pillar.pillar_ar}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                    {formatScore(data.strongest_pillar.percentage)}
                  </p>
                </div>
              )}
              {data.weakest_pillar && (
                <div className="rounded-2xl bg-amber-50/80 p-4 dark:bg-amber-950/40">
                  <p className="text-xs text-slate-500 dark:text-slate-400">أضعف محور</p>
                  <p className="mt-1 text-sm font-bold text-amber-800 dark:text-amber-200">
                    {data.weakest_pillar.pillar_ar}
                  </p>
                  <p className="mt-2 text-2xl font-extrabold text-amber-700 dark:text-amber-300">
                    {formatScore(data.weakest_pillar.percentage)}
                  </p>
                </div>
              )}
              <button
                type="button"
                onClick={handlePdfDownload}
                disabled={!latest.pdf_ready}
                className="col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-start transition hover:border-brand-300 hover:bg-brand-50/50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-brand-700"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <FileDown size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('results.pdf')}</p>
                  <p className="text-xs text-slate-500">
                    {latest.pdf_ready ? t('dashboard.pdfReady') : t('dashboard.pdfPending')}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </section>
      </Reveal>

      {/* Radar + AI summary */}
      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3" delay={80}>
          <Card className="h-full">
            <CardBody>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-slate-50">
                  {t('dashboard.radar')}
                  <InfoTip
                    content={
                      locale === 'en'
                        ? 'Each point is one axis as a percentage of its maximum score.'
                        : 'كل نقطة تمثل محوراً كنسبة مئوية من أقصى درجة له.'
                    }
                  />
                </h3>
                <span className="text-xs text-slate-500">{data.radar_chart_data?.length || 0} محاور</span>
              </div>
              <PillarRadarChart
                data={data.radar_chart_data || []}
                fillColor={readiness.color}
                strokeColor={readiness.color}
                height={300}
                locale={locale}
              />
            </CardBody>
          </Card>
        </Reveal>

        <Reveal className="lg:col-span-2" delay={140}>
          <Card className="h-full overflow-hidden">
            <CardBody className="flex h-full flex-col">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                  <Sparkles size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-900 dark:text-slate-50">{t('dashboard.aiSummary')}</p>
                  <p className="text-[11px] text-slate-500">إرشادي — لا يغيّر نتيجتك</p>
                </div>
                {latest.ai_ready ? (
                  <span className="badge-good">{locale === 'en' ? 'Ready' : 'جاهز'}</span>
                ) : (
                  <span className="badge-neutral">
                    <InlineSpinner label={t('common.loading')} />
                  </span>
                )}
              </div>
              {data.ai_summary_ar ? (
                <p className="flex-1 text-sm leading-7 text-slate-700 dark:text-slate-200">
                  {data.ai_summary_ar}
                </p>
              ) : (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl bg-slate-50 px-4 py-8 text-center dark:bg-slate-800/50">
                  <InlineSpinner size="md" className="text-brand-600" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.aiPending')}</p>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link to={`/assessment/${latest.id}/results`} className="btn-secondary justify-center text-xs">
                  التفاصيل
                </Link>
                <Link to="/expansion" className="btn-secondary justify-center text-xs">
                  <MapPin size={14} />
                  الخريطة
                </Link>
              </div>
            </CardBody>
          </Card>
        </Reveal>
      </div>

      {/* Trend */}
      {trend.length >= 2 && (
        <Reveal delay={100}>
          <Card className="mt-5">
            <CardBody>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
                <LineChart size={18} className="text-brand-600" />
                تطور النتيجة
              </h3>
              <div className="flex h-40 items-end gap-3 overflow-x-auto pb-1">
                {trend.map((point) => {
                  const max = Math.max(...trend.map((p) => Number(p.overall_score) || 0), 100);
                  const barHeight = Math.max(10, Math.round(((Number(point.overall_score) || 0) / max) * 110));
                  return (
                    <Link
                      key={point.assessment_id}
                      to={`/assessment/${point.assessment_id}/results`}
                      className="group flex min-w-[48px] flex-1 flex-col items-center justify-end gap-1"
                      title={`النتيجة: ${formatScore(point.overall_score, 1)}`}
                    >
                      <span className="text-xs font-bold text-slate-600 group-hover:text-brand-700 dark:text-slate-300">
                        {formatScore(point.overall_score, 1)}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-brand-400 transition-all duration-500 group-hover:bg-brand-600 dark:bg-brand-500"
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-[10px] text-slate-400">
                        {formatDate(point.date, { withTime: false })?.slice(5, 10)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </Reveal>
      )}

      {/* Strengths / weaknesses */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <Card className="h-full">
            <CardBody>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
                <CheckCircle2 size={18} className="text-emerald-600" />
                {t('dashboard.strengths')}
              </h3>
              {(data.strengths || []).length === 0 ? (
                <p className="text-sm text-slate-500">لا توجد بيانات بعد.</p>
              ) : (
                <ul className="space-y-2">
                  {data.strengths.map((s) => (
                    <li
                      key={s.pillar_ar || s.pillar_en}
                      className="flex items-center justify-between rounded-xl bg-emerald-50/60 px-4 py-3 dark:bg-emerald-950/30"
                    >
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {pillarLabel(s, locale)}
                      </span>
                      <span className="text-sm font-bold text-emerald-700">{formatScore(s.percentage)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Reveal>

        <Reveal delay={80}>
          <Card className="h-full">
            <CardBody>
              <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
                <AlertTriangle size={18} className="text-amber-600" />
                {t('dashboard.weaknesses')}
              </h3>
              {(data.weaknesses || []).length === 0 ? (
                <p className="text-sm text-slate-500">لا توجد نقاط ضعف حالياً.</p>
              ) : (
                <ul className="space-y-2">
                  {data.weaknesses.map((s) => (
                    <li
                      key={s.pillar_ar || s.pillar_en}
                      className="flex items-center justify-between rounded-xl bg-amber-50/60 px-4 py-3 dark:bg-amber-950/30"
                    >
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {pillarLabel(s, locale)}
                      </span>
                      <span className="text-sm font-bold text-amber-700">{formatScore(s.percentage)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </Reveal>
      </div>

      <HowToUseGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </PageContainer>
  );
}

function NoAssessmentState({ user }) {
  const { t } = useLanguage();
  return (
    <PageContainer>
      <PageHeader
        title={`${t('dashboard.greeting')}، ${user?.name?.split(' ')[0] || ''}`}
        subtitle={t('dashboard.emptyDesc')}
      />
      <OrgProfileGate className="mb-5" />
      <Reveal>
        <section className="overflow-hidden rounded-3xl border border-dashed border-brand-300/60 bg-gradient-to-br from-brand-50/80 via-white to-slate-50 px-6 py-14 text-center dark:border-brand-800 dark:from-brand-950/40 dark:via-slate-900 dark:to-slate-950 sm:px-10">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
            <ClipboardList size={28} />
          </span>
          <h2 className="mt-5 text-2xl font-extrabold text-slate-900 dark:text-slate-50">
            {t('dashboard.emptyTitle')}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
            {t('dashboard.emptyDesc')}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Link to="/assessment" className="btn-primary">
              {t('dashboard.startFirst')}
              <ArrowLeft size={16} />
            </Link>
            <Link to="/project-review" className="btn-secondary">
              <Sparkles size={16} />
              راجع مشروعاً بالذكاء الاصطناعي
            </Link>
          </div>
        </section>
      </Reveal>
      <HowToUseGuide autoOnce />
    </PageContainer>
  );
}
