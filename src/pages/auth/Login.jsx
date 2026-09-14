import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { postAuthDestination } from '../../utils/orgProfile';
import { AuthLayout } from './AuthLayout';

export default function Login() {
  useDocumentTitle('تسجيل الدخول');

  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const profile = await login(form.email, form.password);
      toast.success('مرحباً بك مجدداً!');
      navigate(postAuthDestination(profile), { replace: true });
    } catch (err) {
      if (err?.errors) setErrors(err.errors);
      toast.error(err?.message || 'تعذّر تسجيل الدخول. تحقق من بياناتك.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="أهلاً بعودتك"
      subtitle="سجّل دخولك للوصول إلى لوحة التقييم وخطط التطوير"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          type="email"
          name="email"
          label="البريد الإلكتروني"
          placeholder="example@org.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange}
          error={errors.email?.[0]}
        />
        <PasswordInput
          name="password"
          label="كلمة المرور"
          placeholder="••••••••"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={handleChange}
          error={errors.password?.[0]}
        />
        <div className="flex items-center justify-between text-sm">
          <Link
            to="/forgot-password"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
        <Button type="submit" loading={submitting} className="w-full">
          تسجيل الدخول
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>أو</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <p className="text-center text-sm text-slate-600">
        ليس لديك حساب؟{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          أنشئ حساباً جديداً
        </Link>
      </p>

      <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
        <span className="font-semibold text-slate-700">مدير النظام؟</span>{' '}
        <Link to="/admin/login" className="text-brand-600 hover:underline">
          تسجيل دخول الأدمن
        </Link>
      </div>
    </AuthLayout>
  );
}