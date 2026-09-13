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
  TrendingUp,
  AlertTriangle,
  Award,
  FileDown,
  LineChart,
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
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { PillarRadarChart } from '../../components/charts/PillarRadarChart';
import { Card, CardBody, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReadinessBadge } from '../../components/ui/Badge';
import { FullPageSpinner, InlineSpinner } from '../../components/ui/Spinner';
import Tooltip, { InfoTip } from '../../components/ui/Tooltip';
import HowToUseGuide from '../../components/help/HowToUseGuide';
import Reveal from '../../components/Reveal';
import { useState } from 'react';

export default function Dashboard() {
  const { locale, t } = useLanguage();
  useDocumentTitle(t('dashboard.title'));
  const { user } = useAuth();
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

  return (
    <PageContainer>
      <PageHeader
        title={`${t('dashboard.greeting')}، ${user?.name?.split(' ')[0] || ''} `}
        subtitle={locale === 'en' ? 'A snapshot of your latest assessment' : 'هذه نظرة سريعة على آخر تقييم لك'}
        actions={
          <div className="flex items-center gap-2">
            <Tooltip content={locale === 'en' ? 'A quick guide to using the platform' : 'دليل سريع يشرح كيفية استخدام المنصة خطوة بخطوة'} side="bottom">
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-brand-600 shadow-sm transition hover:bg-brand-50 dark:border-slate-700 dark:bg-slate-800 dark:text-brand-400 dark:hover:bg-slate-700"
                aria-label={locale === 'en' ? 'How to use' : 'كيف أستخدم المنصة؟'}
              >
                <HelpCircle size={18} />
              </button>
            </Tooltip>
            <Button
              variant="secondary"
              onClick={refresh}
              leftIcon={<RefreshCw size={16} />}
            >
              تحديث
            </Button>
            <Link to="/assessment" className="btn-primary">
              <ClipboardList size={16} />
              تقييم جديد
            </Link>
            <Link to="/project-review" className="btn-secondary hidden sm:inline-flex">
              <Sparkles size={16} />
              تقييم مشروع ذكي
            </Link>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Score card */}
        <Reveal className="lg:col-span-1">
        <Card>
          <CardBody>
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {t('dashboard.latestScore')}
              <InfoTip
                content={locale === 'en'
                  ? 'Overall score out of 100, computed from your answers weighted by axis and question weights.'
                  : 'النتيجة العامة من 100، محسوبة من إجاباتك حسب أوزان المحاور والأسئلة.'}
              />
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span
                className="text-5xl font-extrabold"
                style={{ color: readiness.color }}
              >
                {formatScore(latest.overall_score, 1)}
              </span>
            </div>
            <div className="mt-3">
              <ReadinessBadge level={latest.readiness_level} />
            </div>

            {/* Improvement vs previous assessment */}
            {improvement && (
              <Tooltip
                side="bottom"
                content={locale === 'en'
                  ? 'Compared with your previous completed assessment'
                  : 'المقارنة مع آخر تقييم مكتمل سابق لك'}
              >
                <div
                  className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold dark:bg-opacity-10 ${
                    improvement.direction === 'improved'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : improvement.direction === 'declined'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                {improvement.direction === 'improved' ? (
                  <ArrowUpRight size={16} />
                ) : improvement.direction === 'declined' ? (
                  <ArrowDownRight size={16} />
                ) : null}
                {improvement.direction === 'improved'
                  ? `تحسن بمقدار ${formatScore(improvement.difference, 1)} نقطة عن التقييم السابق`
                  : improvement.direction === 'declined'
                    ? `تراجع بمقدار ${formatScore(Math.abs(improvement.difference), 1)} نقطة عن التقييم السابق`
                    : 'مستقر مقارنة بالتقييم السابق'}
                </div>
              </Tooltip>
            )}

            {/* Strongest / weakest axis */}
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              {data.strongest_pillar && (
                <div className="rounded-xl bg-emerald-50/60 p-2.5 dark:bg-emerald-950/30">
                  <p className="text-slate-500 dark:text-slate-400">أقوى محور</p>
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">
                    {data.strongest_pillar.pillar_ar} ({formatScore(data.strongest_pillar.percentage)})
                  </p>
                </div>
              )}
              {data.weakest_pillar && (
                <div className="rounded-xl bg-amber-50/60 p-2.5 dark:bg-amber-950/30">
                  <p className="text-slate-500 dark:text-slate-400">أضعف محور</p>
                  <p className="font-bold text-amber-700 dark:text-amber-300">
                    {data.weakest_pillar.pillar_ar} ({formatScore(data.weakest_pillar.percentage)})
                  </p>
                </div>
              )}
            </div>

            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {locale === 'en' ? readiness.descriptionEn : readiness.description}
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
              <Award size={14} />
              أجريت {totalAssessments} {totalAssessments === 1 ? 'تقييم' : 'تقييمات'}
              {' • '}
              {formatDate(latest.created_at, { withTime: false })}
            </div>
            <div className="mt-5 flex flex-col gap-2">
              <Link
                to={`/assessment/${latest.id}/results`}
                className="btn-primary w-full"
              >
                {t('dashboard.viewResults')}
                <ArrowLeft size={16} />
              </Link>
              <Link to="/dashboard/assessments" className="btn-secondary w-full">
                <HistoryIcon size={16} />
                سجل التقييمات
              </Link>
            </div>
          </CardBody>
        </Card>
        </Reveal>

        {/* Radar chart */}
        <Reveal className="lg:col-span-2" delay={120}>
        <Card>
          <CardBody>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-slate-50">
                {t('dashboard.radar')}
                <InfoTip
                  content={locale === 'en'
                    ? 'Each point is one axis as a percentage of its maximum score.'
                    : 'كل نقطة تمثل محوراً كنسبة مئوية من أقصى درجة له.'}
                />
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {data.radar_chart_data?.length || 0} محاور
              </span>
            </div>
            <PillarRadarChart
              data={data.radar_chart_data || []}
              fillColor={readiness.color}
              strokeColor={readiness.color}
              height={320}
              locale={locale}
            />
          </CardBody>
        </Card>
        </Reveal>
      </div>

      {/* AI summary + actions */}
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
        <Card>
          <CardBody>
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
                <Sparkles size={16} />
              </span>
              <span className="text-slate-900 dark:text-slate-50">{t('dashboard.aiSummary')}</span>
              <InfoTip
                content={locale === 'en'
                  ? 'AI summary is generated from your final scores only — it never changes them. It is advisory guidance.'
                  : 'يُنشأ الملخص الذكي من نتائجك النهائية فقط ولا يغيّرها، وهو إرشادي للاسترشاد.'}
              />
              {latest.ai_ready ? (
                <span className="badge-good">{locale === 'en' ? 'Ready' : 'جاهز'}</span>
              ) : (
                <span className="badge-neutral">
                  <InlineSpinner label={t('common.loading')} />
                </span>
              )}
            </div>
            {data.ai_summary_ar ? (
              <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">
                {data.ai_summary_ar}
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {t('dashboard.aiPending')}
              </p>
            )}
          </CardBody>
        </Card>
        </Reveal>

        <Reveal delay={120}>
        <Card>
          <CardBody>
            <h3 className="font-bold text-slate-900 dark:text-slate-50">{t('dashboard.quickActions')}</h3>
            <div className="mt-4 space-y-2">
              <ActionItem
                to={`/assessment/${latest.id}/results`}
                icon={FileDown}
                title={t('results.pdf')}
                desc={latest.pdf_ready ? t('dashboard.pdfReady') : t('dashboard.pdfPending')}
                disabled={!latest.pdf_ready}
                onClick={async (e) => {
                  if (!latest.pdf_ready) {
                    e.preventDefault();
                    return;
                  }
                  e.preventDefault();
                  try {
                    await downloadReport(latest.id);
                  } catch {
                    /* handled by toast inside component if needed */
                  }
                }}
              />
              <ActionItem
                to="/assessment"
                icon={ClipboardList}
                title={t('nav.assessment')}
                desc={locale === 'en' ? '18 questions · ~5 minutes' : '18 سؤالاً · ~5 دقائق'}
              />
              <ActionItem
                to="/expansion"
                icon={Sparkles}
                title={t('dashboard.mapPins')}
                desc={`${data.expansion_areas_count || 0}`}
              />
              <ActionItem
                to="/history"
                icon={HistoryIcon}
                title={t('nav.history')}
                desc={`${totalAssessments}`}
              />
            </div>
          </CardBody>
        </Card>
        </Reveal>
      </div>

      {/* Score trend over time */}
      {trend.length >= 2 && (
        <Card className="mt-5">
          <CardBody>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
              <LineChart size={18} className="text-brand-600" />
              تطور النتيجة بمرور الوقت
            </h3>
            <div className="flex h-44 items-end gap-3 overflow-x-auto">
              {trend.map((point) => {
                const max = Math.max(...trend.map((p) => Number(p.overall_score) || 0), 100);
                const barHeight = Math.max(10, Math.round(((Number(point.overall_score) || 0) / max) * 120));
                return (
                  <Link
                    key={point.assessment_id}
                    to={`/assessment/${point.assessment_id}/results`}
                    className="group flex min-w-[52px] flex-1 flex-col items-center justify-end gap-1"
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
      )}

      {/* Strengths / weaknesses */}
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
              <CheckCircle2 size={18} className="text-emerald-600" />
              {t('dashboard.strengths')}
            </h3>
            {(data.strengths || []).length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">لا توجد بيانات بعد.</p>
            ) : (
              <ul className="space-y-3">
                {data.strengths.map((s) => (
                  <li
                    key={s.pillar_ar || s.pillar_en}
                    className="flex items-center justify-between rounded-xl bg-emerald-50/50 px-4 py-3 dark:bg-emerald-950/30"
                  >
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {pillarLabel(s, locale)}
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      {formatScore(s.percentage)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h3 className="mb-4 flex items-center gap-2 font-bold text-slate-900 dark:text-slate-50">
              <AlertTriangle size={18} className="text-amber-600" />
              {t('dashboard.weaknesses')}
            </h3>
            {(data.weaknesses || []).length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">لا توجد نقاط ضعف حالياً.</p>
            ) : (
              <ul className="space-y-3">
                {data.weaknesses.map((s) => (
                  <li
                    key={s.pillar_ar || s.pillar_en}
                    className="flex items-center justify-between rounded-xl bg-amber-50/50 px-4 py-3 dark:bg-amber-950/30"
                  >
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {pillarLabel(s, locale)}
                    </span>
                    <span className="text-sm font-bold text-amber-700">
                      {formatScore(s.percentage)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>
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
      <Card>
        <CardBody>
          <EmptyState
            icon={<ClipboardList size={48} />}
            title={t('dashboard.emptyTitle')}
            description={t('dashboard.emptyDesc')}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/assessment" className="btn-primary">
                  {t('dashboard.startFirst')}
                  <ArrowLeft size={16} />
                </Link>
                <Link to="/project-review" className="btn-secondary">
                  <Sparkles size={16} />
                  راجع مشروعاً بالذكاء الاصطناعي
                </Link>
              </div>
            }
          />
        </CardBody>
      </Card>
      <HowToUseGuide autoOnce />
    </PageContainer>
  );
}

function ActionItem({ to, icon: Icon, title, desc, disabled, onClick }) {
  if (disabled) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 opacity-60 dark:bg-slate-800/60">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
          <Icon size={18} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
        </div>
      </div>
    );
  }
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-brand-50 hover:text-brand-700 dark:bg-slate-800/60 dark:hover:bg-brand-950/40 dark:hover:text-brand-300"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-400">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </Link>
  );
}
