import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Target,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileDown,
  LineChart,
  Lock,
} from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import Reveal from '../components/Reveal';
import { SiteFooter } from '../components/layout/SiteFooter';

export default function Landing() {
  useDocumentTitle('الرئيسية');

  return (
    <div className="min-h-screen dark:bg-slate-950">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f7f7f4]/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-soft">
              <Activity size={20} />
            </span>
            <span className="font-wordmark text-xl font-semibold text-slate-900 dark:text-white">
              Huma<span className="text-brand-600 dark:text-brand-400">Scale</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">
              تسجيل الدخول
            </Link>
            <Link to="/register" className="btn-primary">
              ابدأ الآن
              <ArrowLeft size={16} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <div className="bg-grid-dots absolute inset-0 -z-10 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)] dark:opacity-25" />
        <div className="absolute -top-40 left-1/4 -z-10 h-[28rem] w-[28rem] animate-float-slow rounded-full bg-brand-200/25 blur-3xl dark:bg-brand-500/15" />
        <div className="absolute -bottom-40 right-0 -z-10 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl dark:bg-brand-400/10" />

        <div className="container-page grid items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div>
            <span
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-bold text-brand-700 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-300"
              style={{ animation: 'wordReveal 0.7s ease-out 0.15s both' }}
            >
              <Sparkles size={14} />
              منصة تقييم ذكية للفرق والمنظمات
            </span>

            <h1
              className="mt-6 text-4xl font-extrabold leading-[1.25] tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl lg:text-[3.4rem]"
              style={{ animation: 'wordReveal 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s both' }}
            >
              قيّم جاهزية فريقك{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-l from-brand-600 to-brand-800 bg-clip-text text-transparent dark:from-brand-400 dark:to-brand-600">
                  للتوسع
                </span>
                <svg
                  className="absolute -bottom-2 right-0 w-full text-brand-400/70"
                  viewBox="0 0 120 10"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8 C 35 2, 80 2, 118 6"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ animation: 'fadeIn 0.8s ease-out 1.1s both' }}
                  />
                </svg>
              </span>{' '}
              في 18 سؤالاً فقط
            </h1>

            <p
              className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300"
              style={{ animation: 'wordReveal 0.8s ease-out 0.55s both' }}
            >
              منصة <strong className="text-slate-900 dark:text-white">HumaScale</strong> تساعد
              الفرق التطوعية، منظمات المجتمع المدني، والمشاريع الناشئة على تقييم
              وضعها الحالي والحصول على خطة عمل عملية مخصصة لتحسين الجاهزية.
            </p>

            <div
              className="mt-9 flex flex-wrap items-center gap-3"
              style={{ animation: 'wordReveal 0.8s ease-out 0.75s both' }}
            >
              <Link to="/register" className="btn-primary px-6 py-3 text-base shadow-glow">
                ابدأ تقييمك مجاناً
                <ArrowLeft size={18} />
              </Link>
              <Link to="/login" className="btn-secondary px-6 py-3 text-base">
                تسجيل الدخول
              </Link>
            </div>

            <ul
              className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400"
              style={{ animation: 'fadeIn 0.8s ease-out 0.95s both' }}
            >
              {['مجاني بالكامل', 'نتائج فورية', 'تقرير PDF قابل للتحميل'].map(
                (item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>

          {/* Hero visual */}
          <div
            className="relative"
            style={{ animation: 'slideUp 1s cubic-bezier(0.22,1,0.36,1) 0.5s both' }}
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-brand-200/40 to-brand-50/0 blur-2xl dark:from-brand-500/20" />
            <div className="card card-lift relative overflow-hidden p-6 md:p-7">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-slate-400">
                    جاهزية فريقك
                  </p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    68<span className="text-lg text-slate-400">٪</span>
                  </p>
                </div>
                <span className="badge-medium">متوسطة</span>
              </div>

              <div className="space-y-3.5">
                {HERO_BARS.map((b, i) => (
                  <div key={b.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600 dark:text-slate-300">{b.label}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-200">{b.value}٪</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full origin-right rounded-full animate-bar-grow"
                        style={{
                          width: `${b.value}%`,
                          backgroundColor: b.color,
                          animationDelay: `${0.8 + i * 0.12}s`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-3.5 text-xs leading-6 text-slate-600 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-slate-300">
                <Sparkles size={13} className="ml-1.5 inline text-brand-600 dark:text-brand-400" />
                ملخص ذكي: يحتاج الفريق إلى تعزيز محورَي التمويل والشراكات قبل
                التوسع.
              </div>
            </div>

            {/* Floating stat chip */}
            <div className="card absolute -bottom-5 -right-3 hidden animate-float-slow items-center gap-2.5 px-4 py-3 sm:flex">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <LineChart size={16} />
              </span>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">+24٪ تحسّن</p>
                <p className="text-[0.65rem] text-slate-400">عن التقييم السابق</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats band ===== */}
      <section className="border-y border-slate-200/80 bg-white/70 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="container-page grid grid-cols-2 gap-6 py-10 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90} className="text-center">
              <p className="font-wordmark text-4xl font-semibold text-brand-700 dark:text-brand-400">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== What is HumaScale? ===== */}
      <section className="py-20 md:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="kicker text-brand-600 dark:text-brand-400">ما هي HumaScale؟</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
              مقياس علمي لجاهزية منظمتك قبل خطوة التوسع الكبرى
            </h2>
            <div className="mt-5 space-y-4 text-base leading-8 text-slate-600 dark:text-slate-300">
              <p>
                كثير من الفرق الواعدة تتوسع مبكراً فتتعثر.{' '}
                <strong className="text-slate-900 dark:text-white">HumaScale</strong> تضع بين
                يديك مرآة موضوعية: تقييم موجّه عبر 6 محاور جوهرية، تُحوَّل
                إجاباتك إلى درجات مرجّحة بدقة، ومستوى جاهزية واضح يخبرك هل أنت
                جاهز فعلاً — وأين يجب أن تبدأ.
              </p>
              <p>
                وبعد التقييم يتولى <strong className="text-slate-900 dark:text-white">المحلل
                الذكي</strong> قراءة نتائجك ليكتب لك ملخصاً مبسطاً، يرتّب
                الأولويات، ويقترح توصيات عملية تناسب نوع منظمتك وحجمها — مع
                مقارنة تلقائية بتقييمك السابق لتتتبع التحسّن تقييماً بعد تقييم.
              </p>
            </div>
            <ul className="mt-7 space-y-3.5">
              {WHAT_POINTS.map((p) => (
                <li key={p.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <p.icon size={17} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{p.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{p.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-bl from-brand-100/60 to-transparent blur-xl dark:from-brand-500/10" />
              {/* Score composition card */}
              <div className="card relative overflow-hidden p-7">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    كيف تُحسب نتيجتك؟
                  </p>
                  <span className="badge-neutral">خوارزمية المنصة</span>
                </div>

                <div className="mt-5 space-y-4">
                  {SCORE_MATH.map((row, i) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: row.color, animation: `fadeIn 0.5s ease-out ${0.2 + i * 0.15}s both` }}
                      >
                        {row.weight}٪
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{row.label}</span>
                          <span className="text-slate-400">{row.note}</span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full origin-right rounded-full animate-bar-grow"
                            style={{ width: `${row.weight * 2.5}%`, backgroundColor: row.color, animationDelay: `${0.4 + i * 0.15}s` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl bg-gradient-to-l from-brand-950 to-brand-800 px-5 py-4 text-white">
                  <div>
                    <p className="text-[0.65rem] font-bold uppercase tracking-widest text-brand-200">
                      النتيجة العامة المرجّحة
                    </p>
                    <p className="mt-0.5 font-wordmark text-3xl font-semibold">82٪</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-300">
                    جاهزية جيدة
                  </span>
                </div>

                <p className="mt-4 text-center text-[0.7rem] leading-5 text-slate-400">
                  وزن كل محور × نتيجته = النتيجة النهائية — تُحسب بالكامل في
                  خادم المنصة ولا يتدخل الذكاء الاصطناعي في الدرجات
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section className="border-y border-slate-200/80 bg-white/70 py-20 dark:border-slate-800 dark:bg-slate-900/50 md:py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="kicker justify-center text-brand-600 dark:text-brand-400">الرحلة</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
              كيف تعمل المنصة؟
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              ثلاث خطوات بسيطة تفصلك عن خطة عمل مخصصة لتحسين جاهزية فريقك.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 130}>
                <div className="card card-lift relative h-full p-6">
                  <span className="font-wordmark absolute -top-5 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-base font-semibold text-white shadow-soft">
                    {i + 1}
                  </span>
                  <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <s.icon size={22} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{s.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pillars ===== */}
      <section className="py-20 md:py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="kicker justify-center text-brand-600 dark:text-brand-400">المحاور</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
              6 محاور تقيّمها المنصة
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              تغطية شاملة لجميع جوانب جاهزية فريقك للتوسع.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p, i) => (
              <Reveal key={p.key} delay={(i % 3) * 110}>
                <div className="card card-lift flex h-full items-start gap-4 p-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500/15 to-brand-700/15 text-xl dark:from-brand-400/15 dark:to-brand-600/15">
                    {p.icon}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{p.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">{p.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="border-y border-slate-200/80 bg-white/70 py-20 dark:border-slate-800 dark:bg-slate-900/50 md:py-24">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="kicker text-brand-600 dark:text-brand-400">المخرجات</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
              ماذا ستحصل عليه من التقييم؟
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              نتائج فورية + خطة عمل قابلة للتنفيذ + تقرير PDF احترافي.
            </p>
            <ul className="mt-7 space-y-4">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <f.icon size={18} />
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{f.title}</h3>
                    <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-9">
              <Link to="/register" className="btn-primary px-6 py-3 text-base">
                جرّب المنصة الآن
                <ArrowLeft size={16} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="grid grid-cols-2 gap-4">
              {RESULT_CARDS.map((c) => (
                <div key={c.label} className="card card-lift p-6 text-center">
                  <p className="font-wordmark text-4xl font-semibold text-brand-600 dark:text-brand-400">
                    {c.value}
                  </p>
                  <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">{c.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 md:py-24">
        <div className="container-page">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-bl from-brand-700 to-brand-950 px-8 py-16 text-center text-white shadow-lift">
              <div className="bg-noise absolute inset-0 opacity-30" />
              <div className="absolute -top-20 left-1/3 h-72 w-72 rounded-full bg-brand-400/25 blur-3xl" />
              <div className="relative">
                <p className="kicker justify-center text-brand-200">ابدأ رحلتك</p>
                <h2 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                  جاهز لتقييم جاهزية فريقك؟
                </h2>
                <p className="mx-auto mt-4 max-w-xl leading-8 text-brand-100">
                  أنشئ حسابك مجاناً وابدأ التقييم الآن. لا حاجة لبطاقة ائتمان.
                </p>
                <Link
                  to="/register"
                  className="mt-9 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-brand-700 shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-50 hover:shadow-lift"
                >
                  ابدأ الآن مجاناً
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}

const HERO_BARS = [
  { label: 'الفريق', value: 85, color: '#16A34A' },
  { label: 'التمويل', value: 42, color: '#DC2626' },
  { label: 'الأثر', value: 70, color: '#F59E0B' },
  { label: 'الشراكات', value: 55, color: '#F59E0B' },
  { label: 'التقنية', value: 78, color: '#16A34A' },
  { label: 'الاستدامة', value: 60, color: '#F59E0B' },
];

const STATS = [
  { value: '18', label: 'سؤالاً موجّهاً' },
  { value: '6', label: 'محاور جوهرية' },
  { value: '3', label: 'مراحل خطة عمل' },
  { value: '100٪', label: 'مجاني للفرق' },
];

const WHAT_POINTS = [
  {
    icon: Target,
    title: 'درجات مرجّحة لا أرقام عشوائية',
    desc: 'لكل محور وسؤال وزن محدد، والنتيجة تُحسب بخوارزمية ثابتة على الخادم.',
  },
  {
    icon: LineChart,
    title: 'تتبع التحسّن عبر الزمن',
    desc: 'قارن أي تقييمين وشاهد بالأرقام والنسب ما تحسّن وما يحتاج عملاً أكثر.',
  },
  {
    icon: Lock,
    title: 'بياناتك تبقى ملكك',
    desc: 'لا تُرسل أي بيانات شخصية للمحلل الذكي — نتائج مجهّلة فقط.',
  },
];

const SCORE_MATH = [
  { label: 'الفريق', weight: 20, note: 'أقوى محور لديك', color: '#16A34A' },
  { label: 'التقنية', weight: 18, note: 'أدوات ونظم', color: '#365fff' },
  { label: 'الأثر', weight: 17, note: 'أثر في المستفيدين', color: '#F59E0B' },
  { label: 'التمويل', weight: 15, note: 'يحتاج تعزيزاً', color: '#DC2626' },
  { label: 'الشراكات', weight: 15, note: 'شبكة العلاقات', color: '#8B5CF6' },
  { label: 'الاستدامة', weight: 15, note: 'استمرارية', color: '#0EA5E9' },
];

const STEPS = [
  {
    icon: ClipboardList,
    title: 'التقييم',
    desc: 'أجب على 18 سؤالاً تغطي 6 محاور رئيسية، من 1 (ضعيف جداً) إلى 5 (ممتاز).',
  },
  {
    icon: BarChart3,
    title: 'التحليل',
    desc: 'يقوم النظام بحساب نتيجة كل محور، تحديد نقاط القوة والضعف، ومستوى الجاهزية.',
  },
  {
    icon: Target,
    title: 'خطة العمل',
    desc: 'يختار النظام أضعف 3 محاور ويبني خطة من 3 مراحل: فورية، متوسطة، طويلة المدى.',
  },
];

const PILLARS = [
  { key: 'team', title: 'الفريق', desc: 'مدى تنظيم الفريق وكفاءته', icon: '👥' },
  { key: 'funding', title: 'التمويل', desc: 'مدى استقرار التمويل وتنوعه', icon: '💰' },
  { key: 'impact', title: 'الأثر', desc: 'مدى تأثير المشروع في المستفيدين', icon: '🎯' },
  { key: 'partnerships', title: 'الشراكات', desc: 'قوة شبكة الشراكات والتحالفات', icon: '🤝' },
  { key: 'technology', title: 'التقنية', desc: 'مدى توظيف التقنية وأدوات العمل', icon: '⚙️' },
  { key: 'sustainability', title: 'الاستدامة', desc: 'قدرة المنظمة على الاستمرارية والتوسع', icon: '🌱' },
];

const FEATURES = [
  { icon: BarChart3, title: 'رسم رادار تفاعلي', desc: 'تصور بصري شامل لجميع المحاور' },
  { icon: Target, title: 'خطة عمل مخصصة', desc: '3 مراحل: فورية، متوسطة، طويلة المدى' },
  { icon: Sparkles, title: 'ملخص ذكي', desc: 'شرح مبسّط لنتائجك بالذكاء الاصطناعي' },
  { icon: FileDown, title: 'تقرير PDF', desc: 'تقرير احترافي قابل للمشاركة والتحميل' },
];

const RESULT_CARDS = [
  { value: '18', label: 'سؤالاً' },
  { value: '6', label: 'محاور رئيسية' },
  { value: '3', label: 'مراحل خطة عمل' },
  { value: 'PDF', label: 'تقرير جاهز' },
];
