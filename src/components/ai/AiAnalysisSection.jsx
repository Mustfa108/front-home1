import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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
  const [generateError, setGenerateError] = useState(null);
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
    setGenerateError(null);
    aiApi
      .generateAnalysis(assessmentId)
      .then((res) => {
        if (mounted) setData(res.data ?? res);
      })
      .catch((err) => {
        if (mounted) {
          const msg = err?.message || 'تعذر إنشاء التحليل الذكي حالياً، يمكنك المحاولة لاحقاً';
          setGenerateError(msg);
          toast.error(msg);
        }
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
    setGenerateError(null);
    try {
      const res = await aiApi.generateAnalysis(assessmentId, { force: Boolean(isFallback) });
      setData(res.data ?? res);
    } catch (err) {
      const msg = err?.message || 'تعذر إنشاء التحليل الذكي حالياً، يمكنك المحاولة لاحقاً';
      setGenerateError(msg);
      toast.error(msg);
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
        ) : error || generateError ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold">تعذر إنشاء التحليل الذكي حالياً</p>
                <p className="mt-1 text-amber-700 dark:text-amber-300">
                  {generateError || error || 'يمكنك المحاولة مرة أخرى أو العودة لاحقاً.'}
                </p>
              </div>
            </div>
            <Button variant="secondary" className="mt-4" onClick={handleRetry} loading={retrying} leftIcon={<RefreshCw size={14} />}>
              إعادة المحاولة
            </Button>
          </div>
        ) : data?.status === 'none' ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <Info size={18} className="mt-0.5 shrink-0 text-slate-500" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  أكمل بروفايل منظمتك لتفعيل التحليل الذكي
                </p>
                <p className="mt-1">
                  يجب إكمال نوع المنظمة وحجمها في الملف الشخصي قبل إنشاء التوصيات المخصصة. بدونها لن يُرسل طلب التوليد.
                </p>
                <Link to="/profile?onboarding=1" className="mt-3 inline-flex text-sm font-semibold text-brand-600 hover:underline">
                  إكمال الملف الشخصي
                </Link>
              </div>
            </div>
          </div>
        ) : analysis ? (
          <div className="space-y-6">
            {isFallback && (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  هذا تحليل مبسط مبني على قواعد النظام (تعذر الاتصال بخدمة الذكاء الاصطناعي أو مفتاح Gemini غير مضبوط أو فشل تحليل الرد). يمكنك إعادة المحاولة للحصول على تحليل موسع.
                </div>
                <Button variant="secondary" onClick={handleRetry} loading={retrying} leftIcon={<RefreshCw size={14} />}>
                  إعادة توليد تحليل ذكي موسّع
                </Button>
              </div>
            )}

            {/* Project Summary Card */}
            <div className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm dark:border-brand-800 dark:from-brand-950/40 dark:to-slate-900">
              <h4 className="mb-3 flex items-center gap-2 text-base font-bold text-brand-800 dark:text-brand-200">
                <Bot size={20} className="text-brand-600 dark:text-brand-300" />
                ملخص المشروع
              </h4>
              <p className="text-sm leading-8 text-slate-700 dark:text-slate-200">{analysis.overall_summary}</p>
            </div>

            {/* Strengths & Weaknesses Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {analysis.strengths?.length > 0 && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/30">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                    مميزات المشروع
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.weaknesses?.length > 0 && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 dark:border-amber-800 dark:bg-amber-950/30">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-200">
                    <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
                    جوانب تحتاج إلى تحسين
                  </h4>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Next Steps */}
            {analysis.recommendations?.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <h4 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
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
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-800 dark:text-slate-100">{r.title}</span>
                          {r.timeframe_ar && <span className="badge-neutral">{r.timeframe_ar}</span>}
                          {r.related_axis && <span className="badge-medium">{r.related_axis}</span>}
                        </div>
                        <p className="leading-7 text-slate-600 dark:text-slate-300">{r.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {analysis.priorities?.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
                <h4 className="mb-3 text-sm font-bold text-slate-800 dark:text-slate-100">الأولويات</h4>
                <ul className="space-y-2">
                  {analysis.priorities.map((p, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                        {i + 1}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">{p.axis}</span>
                      <span className="badge-medium">{p.priority}</span>
                      <p className="text-slate-600 dark:text-slate-300">{p.reason}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.progress_summary && (
              <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/30">
                <h4 className="text-sm font-bold text-brand-800 dark:text-brand-200">مقارنة مع التقييم السابق</h4>
                <p className="mt-1 text-sm leading-7 text-brand-900 dark:text-brand-100">{analysis.progress_summary}</p>
              </div>
            )}

            <p className="text-xs text-slate-400 text-center">
              تنبيه: التوصيات استرشادية وليست بديلاً عن التقييم المهني المتخصص.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">لا يوجد محتوى تحليل للعرض</p>
                <p className="mt-1">حاول إعادة التوليد، أو تحقق لاحقاً إذا كانت خدمة الذكاء الاصطناعي غير متاحة.</p>
                <Button variant="secondary" className="mt-3" onClick={handleRetry} loading={retrying} leftIcon={<RefreshCw size={14} />}>
                  إعادة المحاولة
                </Button>
              </div>
            </div>
          </div>
        )}
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
  const [historyError, setHistoryError] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setHistoryError(null);
    aiApi
      .chatHistory(assessmentId)
      .then((res) => mounted && setMessages(res.data?.messages || []))
      .catch((err) => {
        if (mounted) {
          setHistoryError(err?.message || 'تعذّر تحميل سجل المحادثة.');
        }
      })
      .finally(() => mounted && setLoaded(true));
    return () => {
      mounted = false;
    };
  }, [assessmentId]);

  useEffect(() => {
    const container = listRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, loaded]);

  const send = async (text) => {
    const message = (text ?? input).trim();
    if (sending) return;
    if (!message) {
      toast.error('اكتب سؤالاً قبل الإرسال.');
      return;
    }
    if (message.length < 3) {
      toast.error('السؤال قصير جداً (٣ أحرف على الأقل).');
      return;
    }
    if (message.length > 500) {
      toast.error('الحد الأقصى لطول السؤال 500 حرف.');
      return;
    }

    setSending(true);
    const tempId = `local-user-${Date.now()}`;
    setMessages((m) => [...m, { id: tempId, role: 'user', content: message }]);
    setInput('');
    try {
      const res = await aiApi.chat(assessmentId, message);
      setMessages(res.data?.messages || []);
    } catch (err) {
      setMessages((m) => m.filter((row) => row.id !== tempId));
      setInput(message);
      toast.error(
        err?.status === 429
          ? 'تم تجاوز الحد المسموح لعدد الرسائل اليوم. حاول غداً.'
          : err?.message || 'تعذّر إرسال السؤال حالياً. تحقق من مفتاح Gemini أو الاتصال.',
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
        {historyError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
            {historyError} يمكنك المتابعة وطرح سؤال جديد.
          </div>
        )}
        {messages.length === 0 && loaded && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                disabled={sending}
                className="rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-50 dark:border-brand-800 dark:bg-brand-950 dark:text-brand-200 dark:hover:bg-brand-900"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div
          ref={listRef}
          className="min-h-[28rem] max-h-[32rem] space-y-3 overflow-y-auto rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60"
        >
          {messages.map((m, index) => (
            <div
              key={m.id || `${m.role}-${index}`}
              className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-7 ${
                  m.role === 'user'
                    ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-slate-100'
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
            autoComplete="off"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
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
