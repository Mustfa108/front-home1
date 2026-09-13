import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, FileDown, LineChart, ListChecks, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useLanguage } from '../../contexts/LanguageContext';

/* ------------------------------------------------------------------ */
/* Inline SVG illustrations — theme-aware (light/dark) and RTL-neutral */
/* ------------------------------------------------------------------ */

function IllProfile() {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-full" aria-hidden="true">
      <rect x="30" y="14" width="160" height="92" rx="14" className="fill-brand-50 dark:fill-slate-800" />
      <circle cx="66" cy="46" r="14" className="fill-brand-200 dark:fill-brand-700" />
      <circle cx="66" cy="42" r="6" className="fill-white dark:fill-slate-200" />
      <path d="M56 56c2-6 18-6 20 0v6H56z" className="fill-white dark:fill-slate-200" />
      <rect x="92" y="34" width="72" height="8" rx="4" className="fill-brand-400/70 dark:fill-brand-500/70" />
      <rect x="92" y="50" width="52" height="6" rx="3" className="fill-slate-300 dark:fill-slate-600" />
      <rect x="48" y="76" width="46" height="14" rx="7" className="fill-brand-500 dark:fill-brand-600" />
      <rect x="102" y="76" width="46" height="14" rx="7" className="fill-slate-200 dark:fill-slate-700" />
      <circle cx="186" cy="22" r="9" className="fill-amber-300/80 dark:fill-amber-500/60" />
    </svg>
  );
}

function IllAssessment() {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-full" aria-hidden="true">
      <rect x="55" y="10" width="110" height="100" rx="12" className="fill-brand-50 dark:fill-slate-800" />
      <rect x="70" y="26" width="80" height="10" rx="5" className="fill-brand-400/70 dark:fill-brand-500/70" />
      {[46, 64, 82].map((y, i) => (
        <g key={y}>
          <rect x="70" y={y} width="14" height="14" rx="4" className={i < 2 ? 'fill-emerald-400/80 dark:fill-emerald-500/70' : 'fill-slate-200 dark:fill-slate-700'} />
          {i < 2 && (
            <path d={`M73 ${y + 7}l3 3 5-6`} stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
          <rect x="92" y={y + 3} width="52" height="7" rx="3.5" className="fill-slate-300 dark:fill-slate-600" />
        </g>
      ))}
      <rect x="70" y="98" width="80" height="0" rx="0" className="fill-transparent" />
      <circle cx="182" cy="96" r="12" className="fill-brand-500 dark:fill-brand-600" />
      <path d="M182 90v12M176 96h12" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function IllResults() {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-full" aria-hidden="true">
      <polygon points="110,14 146,36 146,78 110,100 74,78 74,36" className="fill-brand-100 dark:fill-slate-800" />
      <polygon points="110,24 138,41 138,73 110,90 82,73 82,41" className="fill-brand-300/50 dark:fill-brand-800/60" />
      <polygon points="110,38 130,49 130,66 110,77 90,66 90,49" className="fill-brand-500/70 dark:fill-brand-600/80" />
      <circle cx="110" cy="14" r="4" className="fill-brand-600 dark:fill-brand-400" />
      <circle cx="146" cy="36" r="4" className="fill-brand-600 dark:fill-brand-400" />
      <circle cx="146" cy="78" r="4" className="fill-brand-600 dark:fill-brand-400" />
      <circle cx="110" cy="100" r="4" className="fill-brand-600 dark:fill-brand-400" />
      <circle cx="74" cy="78" r="4" className="fill-brand-600 dark:fill-brand-400" />
      <circle cx="74" cy="36" r="4" className="fill-brand-600 dark:fill-brand-400" />
      <rect x="158" y="40" width="40" height="34" rx="8" className="fill-amber-300/70 dark:fill-amber-500/50" />
      <path d="M170 57h16M178 49v16" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="38" cy="60" r="12" className="fill-emerald-300/70 dark:fill-emerald-600/50" />
      <path d="M32 60l4 4 8-8" stroke="white" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IllCompare() {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-full" aria-hidden="true">
      <rect x="30" y="16" width="160" height="88" rx="14" className="fill-brand-50 dark:fill-slate-800" />
      <rect x="58" y="72" width="22" height="22" rx="4" className="fill-slate-300 dark:fill-slate-600" />
      <rect x="90" y="52" width="22" height="42" rx="4" className="fill-brand-300 dark:fill-brand-700" />
      <rect x="122" y="34" width="22" height="60" rx="4" className="fill-emerald-400/90 dark:fill-emerald-600/80" />
      <path d="M62 52c26-16 52-22 86-26" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="1 7" />
      <path d="M148 20l6 8-10 2z" className="fill-amber-500" />
    </svg>
  );
}

function IllReport() {
  return (
    <svg viewBox="0 0 220 120" className="h-28 w-full" aria-hidden="true">
      <path d="M78 12h48l24 24v72a8 8 0 01-8 8H78a8 8 0 01-8-8V20a8 8 0 018-8z" className="fill-brand-50 dark:fill-slate-800" />
      <path d="M126 12l24 24h-18a6 6 0 01-6-6z" className="fill-brand-300 dark:fill-brand-700" />
      <rect x="84" y="48" width="52" height="7" rx="3.5" className="fill-brand-400/70 dark:fill-brand-500/70" />
      <rect x="84" y="62" width="40" height="6" rx="3" className="fill-slate-300 dark:fill-slate-600" />
      <rect x="84" y="74" width="46" height="6" rx="3" className="fill-slate-300 dark:fill-slate-600" />
      <circle cx="152" cy="92" r="15" className="fill-emerald-400 dark:fill-emerald-600" />
      <path d="M145 92l5 5 10-10" stroke="white" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STEPS = [
  {
    icon: Building2,
    Ill: IllProfile,
    titleAr: 'أكمل ملف منظمتك',
    titleEn: 'Complete your organization profile',
    bodyAr: 'من صفحة الملف الشخصي، حدّد نوع المنظمة وحجمها وعدد أعضاء الفريق. هذه البيانات تُخصّص التوصيات لتناسب وضعك الفعلي.',
    bodyEn: 'From the profile page, set your organization type, size, and team member count. This data personalizes your recommendations.',
  },
  {
    icon: ListChecks,
    Ill: IllAssessment,
    titleAr: 'ابدأ تقييم الجاهزية',
    titleEn: 'Start the readiness assessment',
    bodyAr: 'أجب عن 18 سؤالاً موزعة على 6 محاور (الفريق، التمويل، الأثر، الشراكات، التقنية، الاستدامة). يستغرق التقييم نحو 5 دقائق.',
    bodyEn: 'Answer 18 questions across 6 axes (team, funding, impact, partnerships, technology, sustainability). It takes about 5 minutes.',
  },
  {
    icon: Sparkles,
    Ill: IllResults,
    titleAr: 'استعرض نتيجتك والتحليل الذكي',
    titleEn: 'View your results & AI analysis',
    bodyAr: 'بعد الإنهاء تظهر النتيجة العامة ومستوى الجاهزية ونتيجة كل محور، مع تحليل ذكي وتوصيات عملية، ومساعد يجيب عن أسئلتك حول نتيجتك.',
    bodyEn: 'After finishing, you get your overall score, readiness level, per-axis results, an AI analysis with practical recommendations, and an assistant that answers questions about your score.',
  },
  {
    icon: LineChart,
    Ill: IllCompare,
    titleAr: 'قارن تقييماتك وقِس التحسن',
    titleEn: 'Compare assessments & track progress',
    bodyAr: 'من سجل التقييمات اختر تقييمين للمقارنة لترى مقدار التحسن أو التراجع في كل محور، مع رسوم بيانية واضحة.',
    bodyEn: 'From the assessment history, pick two assessments to compare improvement or decline per axis with clear charts.',
  },
  {
    icon: FileDown,
    Ill: IllReport,
    titleAr: 'حمّل تقريرك وشاركه',
    titleEn: 'Download & share your report',
    bodyAr: 'يمكنك تنزيل تقرير PDF احترافي بنتائج التقييم وخطة العمل لمشاركته مع فريقك أو الداعمين.',
    bodyEn: 'Download a professional PDF report with your results and action plan to share with your team or supporters.',
  },
];

const GUIDE_SEEN_KEY = 'hs_guide_seen_v1';

/**
 * Illustrated "How to use the platform" onboarding guide.
 * Auto-opens once on first Dashboard visit, then only via the help button.
 */
export default function HowToUseGuide({ open, onClose, autoOnce = false }) {
  const { locale } = useLanguage();
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState(0);

  const isOpen = open ?? internalOpen;
  const setOpen = (v) => (open === undefined ? setInternalOpen(v) : onClose?.());

  useEffect(() => {
    if (autoOnce && !localStorage.getItem(GUIDE_SEEN_KEY)) {
      const timer = setTimeout(() => setInternalOpen(true), 900);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoOnce]);

  useEffect(() => {
    if (isOpen) {
      localStorage.setItem(GUIDE_SEEN_KEY, '1');
      setStep(0);
    }
  }, [isOpen]);

  const ar = locale !== 'en';
  const s = STEPS[step];
  const Icon = s.icon;
  const { Ill } = s;

  return (
    <Modal
      open={isOpen}
      onClose={() => setOpen(false)}
      size="lg"
      title={ar ? 'كيف تستخدم منصة HumaScale؟' : 'How to use HumaScale'}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`step ${i + 1}`}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-brand-600' : 'w-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)} leftIcon={<ArrowRight size={16} />}>
                {ar ? 'السابق' : 'Back'}
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(step + 1)} rightIcon={<ArrowLeft size={16} />}>
                {ar ? 'التالي' : 'Next'}
              </Button>
            ) : (
              <Button onClick={() => setOpen(false)}>
                <CheckCircle2 size={16} />
                {ar ? 'لنبدأ' : "Let's go"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-glow">
          <Icon size={22} />
        </div>
        <p className="mt-3 text-xs font-bold uppercase tracking-widest text-brand-600 dark:text-brand-400">
          {ar ? `الخطوة ${step + 1} من ${STEPS.length}` : `Step ${step + 1} of ${STEPS.length}`}
        </p>
        <h4 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-50">
          {ar ? s.titleAr : s.titleEn}
        </h4>
        <div className="mx-auto mt-4 max-w-sm overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft dark:border-slate-700 dark:bg-slate-900">
          <Ill />
        </div>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
          {ar ? s.bodyAr : s.bodyEn}
        </p>
      </div>
      {step === STEPS.length - 1 && (
        <p className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-center text-xs leading-6 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
          {ar
            ? 'تنبيه: التوصيات استرشادية ولمساعدتك في التخطيط، وليست بديلاً عن التقييم المهني المتخصص.'
            : 'Note: recommendations are advisory guidance for planning, not a substitute for specialized professional assessment.'}
        </p>
      )}
    </Modal>
  );
}
