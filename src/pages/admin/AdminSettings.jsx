import { useEffect, useState } from 'react';
import { AlertTriangle, Info, KeyRound, Share2 } from 'lucide-react';
import { settingsApi } from '../../api/admin';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../contexts/ToastContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner } from '../../components/ui/Spinner';
import { formatDate } from '../../utils/format';

const SOCIAL_FIELDS = [
  'facebook',
  'instagram',
  'twitter',
  'linkedin',
  'whatsapp',
  'youtube',
  'telegram',
];

export default function AdminSettings() {
  useDocumentTitle('إعدادات المنصة');
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [savingAi, setSavingAi] = useState(false);
  const [savingSocial, setSavingSocial] = useState(false);
  const [ai, setAi] = useState({
    gemini_api_key: '',
    gemini_model: '',
    gemini_api_key_masked: '',
    gemini_api_key_set: false,
    quota_alert: null,
  });
  const [social, setSocial] = useState({});

  useEffect(() => {
    Promise.all([settingsApi.getAi(), settingsApi.getSocial()])
      .then(([aiRes, socialRes]) => {
        const payload = aiRes.data || {};
        setAi((prev) => ({
          ...prev,
          ...payload,
          gemini_api_key: '',
          gemini_model: payload.gemini_model || '',
          quota_alert: payload.quota_alert || null,
        }));
        setSocial(socialRes.data || {});
      })
      .catch((err) => toast.error(err?.message || 'تعذّر تحميل الإعدادات.'))
      .finally(() => setLoading(false));
  }, [toast]);

  const saveAi = async (e) => {
    e.preventDefault();
    setSavingAi(true);
    try {
      const payload = { gemini_model: ai.gemini_model };
      if (ai.gemini_api_key?.trim()) payload.gemini_api_key = ai.gemini_api_key.trim();
      const res = await settingsApi.updateAi(payload);
      const next = res.data || {};
      setAi((prev) => ({
        ...prev,
        ...next,
        gemini_api_key: '',
        gemini_model: next.gemini_model || prev.gemini_model,
        quota_alert: next.quota_alert || null,
      }));
      toast.success('تم حفظ إعدادات Gemini.');
    } catch (err) {
      toast.error(err?.message || 'تعذّر الحفظ.');
    } finally {
      setSavingAi(false);
    }
  };

  const saveSocial = async (e) => {
    e.preventDefault();
    setSavingSocial(true);
    try {
      const res = await settingsApi.updateSocial(social);
      setSocial(res.data || {});
      toast.success('تم حفظ روابط التواصل.');
    } catch (err) {
      toast.error(err?.message || 'تعذّر الحفظ.');
    } finally {
      setSavingSocial(false);
    }
  };

  if (loading) return <AdminLayout><FullPageSpinner /></AdminLayout>;

  const quota = ai.quota_alert;

  return (
    <AdminLayout>
      <PageHeader title="إعدادات المنصة" subtitle="مفتاح Gemini وروابط المساعدة أسفل الصفحات" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="الذكاء الاصطناعي (Gemini)" subtitle="يُستخدم للتقييم والتحليل والدردشة" action={<KeyRound size={18} className="text-brand-600" />} />
          <CardBody>
            <form onSubmit={saveAi} className="space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                الحالة:{' '}
                {ai.gemini_api_key_set
                  ? `مفعّل (${ai.gemini_api_key_masked || '****'})`
                  : 'غير مضبوط — ضع المفتاح هنا أو في ملف البيئة'}
              </p>

              {quota?.active && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-300" />
                    <div className="space-y-2">
                      <p className="font-bold">تنبيه: الحد اليومي / حصة المفتاح مستنفدة</p>
                      <p className="leading-7">{quota.message_ar}</p>
                      <p className="text-xs leading-6 text-amber-800 dark:text-amber-200">{quota.log_hint_ar}</p>
                      {quota.hit_at && (
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          آخر رصد من اللوج/الاستجابة: {formatDate(quota.hit_at)}
                          {quota.http_status ? ` — HTTP ${quota.http_status}` : ''}
                          {quota.error_status ? ` — ${quota.error_status}` : ''}
                        </p>
                      )}
                      {quota.last_error && (
                        <p className="break-words rounded-lg bg-amber-100/80 p-2 font-mono text-[11px] leading-5 text-amber-950 dark:bg-amber-900/40 dark:text-amber-50">
                          {quota.last_error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
                <div className="mb-1 flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-200">
                  <Info size={14} />
                  كيف تعرف من اللوج أن الحصة انتهت؟
                </div>
                <ul className="list-disc space-y-1 pe-4">
                  <li>
                    <code className="text-brand-700 dark:text-brand-300">status: 429</code>
                    {' '}أو{' '}
                    <code className="text-brand-700 dark:text-brand-300">RESOURCE_EXHAUSTED</code>
                  </li>
                  <li>
                    رسالة تحتوي{' '}
                    <code className="text-brand-700 dark:text-brand-300">quota</code>
                    {' / '}
                    <code className="text-brand-700 dark:text-brand-300">rate limit</code>
                    {' / '}
                    <code className="text-brand-700 dark:text-brand-300">exceeded your current quota</code>
                  </li>
                  <li>
                    خطأ{' '}
                    <code className="text-brand-700 dark:text-brand-300">503</code>
                    {' '}مع{' '}
                    <code className="text-brand-700 dark:text-brand-300">high demand</code>
                    {' '}≠ حد يومي؛ هو ضغط مؤقت على النموذج
                  </li>
                </ul>
              </div>

              <Input
                label="مفتاح Gemini الجديد"
                type="password"
                value={ai.gemini_api_key}
                onChange={(e) => setAi((s) => ({ ...s, gemini_api_key: e.target.value }))}
                placeholder="اتركه فارغاً إن لم ترد تغييره"
              />
              <Input
                label="اسم النموذج"
                value={ai.gemini_model || ''}
                onChange={(e) => setAi((s) => ({ ...s, gemini_model: e.target.value }))}
                placeholder="gemini-3.6-flash"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                النموذج الموصى به حالياً: <code className="text-brand-700 dark:text-brand-300">gemini-3.6-flash</code>
                — تجنّب النماذج القديمة مثل gemini-1.5-flash أو gemini-2.5-flash (تعيد 404).
              </p>
              <Button type="submit" loading={savingAi}>حفظ إعدادات الذكاء</Button>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="مواقع التواصل للمساعدة" subtitle="تظهر أسفل صفحات المنصة" action={<Share2 size={18} className="text-brand-600" />} />
          <CardBody>
            <form onSubmit={saveSocial} className="space-y-3">
              {SOCIAL_FIELDS.map((field) => (
                <Input
                  key={field}
                  label={field}
                  value={social[field] || ''}
                  onChange={(e) => setSocial((s) => ({ ...s, [field]: e.target.value }))}
                  placeholder={`رابط ${field}`}
                />
              ))}
              <Button type="submit" loading={savingSocial}>حفظ الروابط</Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}
