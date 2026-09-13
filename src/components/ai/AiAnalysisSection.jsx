import { useEffect, useState } from 'react';
import { Bot, CheckCircle2, RefreshCw, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { aiApi } from '../../api/results';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { InlineSpinner } from '../ui/Spinner';

/**
 * "التحليل الذكي لنتيجتك" section on the results page.
 * States: generating / ready (AI or fallback) / failed / retry when allowed.
 * The analysis is generated once and reused — never regenerated per visit.
 */
export function AiAnalysisSection({ assessmentId }) {
  const toast = useToast();
  const [retrying, setRetrying] = useState(false);
  const { data, loading, error, refresh, setData } = useAsync(
    () => aiApi.getAnalysis(assessmentId),
    { deps: [assessmentId] },
  );

  // Once the results page loads and no analysis exists, try generating once.
  useEffect(() => {
    if (!data || data.status !== 'none') return;
    if (!data.can_generate) return;
    let mounted = true;
    setRetrying(true);
    aiApi
      .generateAnalysis(assessmentId)
      .then((res) => {
        if (mounted) setData(res.data);
      })
      .catch((err) => {
        if (mounted) toast.error(err?.message || 'تعذر إنشاء التحليل الذكي حالياً، يمكنك المحاولة لاحقاً');
      })
      .finally(() => mounted && setRetrying(false));
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.status, data?.can_generate, assessmentId]);

  const analysis = data?.analysis;
  const isFallback = data?.is_fallback;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const res = await aiApi.generateAnalysis(assessmentId);
      setData(res.data);
    } catch (err) {
      toast.error(err?.message || 'تعذر إنشاء التحليل الذكي حالياً، يمكنك المحاولة لاحقاً');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="التحليل الذكي لنتيجتك"
        subtitle="تفسير مبسط لنتائجك مع توصيات عملية قابلة للتنفيذ"
      />
      <CardBody className="space-y-5">
        {loading || (data?.status === 'none' && retrying) ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-sm text-slate-500">
            <InlineSpinner size="md" className="text-brand-600" />
            <span className="animate-pulse">جاري إنشاء التحليل الذكي… يمكنك ترك الصفحة والعودة لاحقاً.</span>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 text-sm text-amber-800">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold">تعذر إنشاء التحليل الذكي حالياً</p>
                <p className="mt-1 text-amber-700">يمكنك المحاولة مرة أخرى أو العودة لاحقاً.</p>
              </div>
            </div>
            <Button variant="secondary" className="mt-4" onClick={handleRetry} loading={retrying} leftIcon={<RefreshCw size={14} />}>
              إعادة المحاولة
            </Button>
          </div>
        ) : data?.status === 'none' ? (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Info size={18} className="mt-0.5 shrink-0 text-slate-500" />
              <p>يجب إكمال بيانات المنظمة (النوع والحجم) في الملف الشخصي قبل إنشاء التوصيات المخصصة.</p>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {isFallback && (
              <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
                <Info size={14} className="mt-0.5 shrink-0" />
                هذا تحليل مبسط مبني على قواعد النظام (تعذر الاتصال بخدمة الذكاء الاصطناعي). يمكنك المحاولة لاحقاً للحصول على تحليل موسع.
              </div>
            )}

            {/* Project Summary Card */}
            <div className="rounded-xl bg-gradient-to-br from-brand-50 to-white border border-brand-100 p-5 shadow-sm">
              <h4 className="flex items-center gap-2 text-base font-bold text-brand-800 mb-3">
                <Bot size={20} className="text-brand-600" />
                ملخص المشروع
              </h4>
              <p className="text-sm leading-8 text-slate-700">{analysis.overall_summary}</p>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.strengths?.length > 0 && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-5">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-3">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    مميزات المشروع
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.weaknesses?.length > 0 && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-5">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-3">
                    <AlertTriangle size={16} className="text-amber-600" />
                    جوانب تحتاج إلى تحسين
                  </h4>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Next Steps */}
            {analysis.recommendations?.length > 0 && (
              <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4">
                  <Sparkles size={16} className="text-brand-600" />
                  الخطوات المثالية القادمة
                </h4>
                <ol className="space-y-3">
                  {analysis.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">{r.title}</span>
                          {r.timeframe_ar && <span className="badge-neutral">{r.timeframe_ar}</span>}
                          {r.related_axis && <span className="badge-medium">{r.related_axis}</span>}
                        </div>
                        <p className="leading-7 text-slate-600">{r.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {analysis.priorities?.length > 0 && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5">
                <h4 className="text-sm font-bold text-slate-800 mb-3">الأولويات</h4>
                <ul className="space-y-2">
                  {analysis.priorities.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                        {i + 1}
                      </span>
                      <span className="font-bold text-slate-800">{p.axis}</span>
                      <span className="badge-medium">{p.priority}</span>
                      <p className="text-slate-600">{p.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.progress_summary && (
              <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
                <h4 className="text-sm font-bold text-brand-800">مقارنة مع التقييم السابق</h4>
                <p className="mt-1 text-sm leading-7 text-brand-900">{analysis.progress_summary}</p>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">
              تنبيه: التوصيات استرشادية وليست بديلاً عن التقييم المهني المتخصص.
            </p>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

const SUGGESTED_QUESTIONS = [
  'لماذا حصلت على هذه النتيجة؟',
  'ما المحور الذي يجب أن أبدأ به؟',
  'كيف يمكنني تحسين محور التمويل؟',
  'ما الفرق بين تقييمي الحالي والسابق؟',
];

/**
 * "اسأل عن نتيجتك" chat widget — answers only within the assessment context.
 * Disables sending while waiting; never shows technical error messages.
 */
export function AiChatWidget({ assessmentId }) {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    aiApi
      .chatHistory(assessmentId)
      .then((res) => mounted && setMessages(res.data?.messages || []))
      .catch(() => {})
      .finally(() => mounted && setLoaded(true));
    return () => {
      mounted = false;
    };
  }, [assessmentId]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (!message || sending) return;
    if (message.length > 500) {
      toast.error('الحد الأقصى لطول السؤال 500 حرف.');
      return;
    }

    setSending(true);
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setInput('');
    try {
      const res = await aiApi.chat(assessmentId, message);
      setMessages(res.data?.messages || []);
    } catch (err) {
      setMessages((m) => m.slice(0, -1));
      setInput(message);
      toast.error(
        err?.status === 429
          ? 'تم تجاوز الحد المسموح لعدد الرسائل اليوم. حاول غداً.'
          : 'تعذّر إرسال السؤال حالياً. يرجى المحاولة لاحقاً.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader
        title="اسأل عن نتيجتك"
        subtitle="مساعد ذكي يجيب حصراً عن نتيجة تقييمك وخطة تطويرك"
      />
      <CardBody className="space-y-3">
        {messages.length === 0 && loaded && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                disabled={sending}
                className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="max-h-80 space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3">
          {messages.map((m) => (
            <div
              key={m.id || `${m.role}-${Math.random()}`}
              className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-7 ${
                  m.role === 'user'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'bg-brand-600 text-white'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-end">
              <div className="rounded-2xl bg-brand-600/70 px-3.5 py-2 text-sm text-white">
                جاري كتابة الرد…
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            maxLength={500}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
            placeholder="اكتب سؤالك عن نتيجتك…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
          />
          <Button type="submit" loading={sending} disabled={sending || input.trim().length < 3}>
            إرسال
          </Button>
        </form>
        <p className="text-xs text-slate-400">
          المساعد يجيب فقط عن نتيجة تقييمك. لا يظهر أي بيانات حساسة.
        </p>
      </CardBody>
    </Card>
  );
}
