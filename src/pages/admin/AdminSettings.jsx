import { useEffect, useState } from 'react';
import { KeyRound, Share2 } from 'lucide-react';
import { settingsApi } from '../../api/admin';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../contexts/ToastContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner } from '../../components/ui/Spinner';

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
  const [ai, setAi] = useState({ gemini_api_key: '', gemini_model: '', gemini_api_key_masked: '', gemini_api_key_set: false });
  const [social, setSocial] = useState({});

  useEffect(() => {
    Promise.all([settingsApi.getAi(), settingsApi.getSocial()])
      .then(([aiRes, socialRes]) => {
        setAi((prev) => ({
          ...prev,
          ...(aiRes.data || {}),
          gemini_api_key: '',
          gemini_model: aiRes.data?.gemini_model || '',
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
      setAi((prev) => ({
        ...prev,
        ...(res.data || {}),
        gemini_api_key: '',
        gemini_model: res.data?.gemini_model || prev.gemini_model,
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

  return (
    <AdminLayout>
      <PageHeader title="إعدادات المنصة" subtitle="مفتاح Gemini وروابط المساعدة أسفل الصفحات" />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="الذكاء الاصطناعي (Gemini)" subtitle="يُستخدم للتقييم والتحليل والدردشة" action={<KeyRound size={18} className="text-brand-600" />} />
          <CardBody>
            <form onSubmit={saveAi} className="space-y-4">
              <p className="text-xs text-slate-500">
                الحالة:{' '}
                {ai.gemini_api_key_set
                  ? `مفعّل (${ai.gemini_api_key_masked || '****'})`
                  : 'غير مضبوط — ضع المفتاح هنا أو في ملف البيئة'}
              </p>
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
