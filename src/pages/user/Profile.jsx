import { useEffect, useRef, useState } from 'react';
import { Building2, Mail, ShieldCheck, User as UserIcon, Globe, Moon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { authApi } from '../../api/auth';
import { organizationApi, ORG_TYPES, ORG_SIZES } from '../../api/organization';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Input, PasswordInput } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import HowToUseGuide from '../../components/help/HowToUseGuide';
import { formatDate } from '../../utils/format';
import { isOrgProfileComplete } from '../../utils/orgProfile';

export default function Profile() {
  const { t, locale, setLocale } = useLanguage();
  useDocumentTitle(t('profile.title'));
  const { user, refreshUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === '1';
  const orgSectionRef = useRef(null);

  const [pwForm, setPwForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSubmitting, setPwSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const [orgForm, setOrgForm] = useState({
    organization_name: user?.organization_name || '',
    org_type: '',
    org_size: '',
    team_member_count: '',
  });
  const [orgErrors, setOrgErrors] = useState({});
  const [orgLoading, setOrgLoading] = useState(true);
  const [orgSubmitting, setOrgSubmitting] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    if (isOnboarding) {
      setGuideOpen(true);
      const timer = setTimeout(() => {
        orgSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isOnboarding]);

  useEffect(() => {
    let mounted = true;
    organizationApi
      .show()
      .then((res) => {
        if (!mounted) return;
        setOrgForm({
          organization_name: res.data?.organization_name || user?.organization_name || '',
          org_type: res.data?.org_type || '',
          org_size: res.data?.org_size || '',
          team_member_count: res.data?.team_member_count || '',
        });
      })
      .catch(() => {})
      .finally(() => mounted && setOrgLoading(false));
    return () => {
      mounted = false;
    };
  }, [user?.organization_name]);

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setOrgErrors({});
    if (!orgForm.org_type || !orgForm.org_size) {
      setOrgErrors({
        org_type: !orgForm.org_type ? ['نوع المنظمة مطلوب.'] : undefined,
        org_size: !orgForm.org_size ? ['حجم المنظمة مطلوب.'] : undefined,
      });
      return;
    }
    setOrgSubmitting(true);
    try {
      await organizationApi.update({
        organization_name: orgForm.organization_name || undefined,
        org_type: orgForm.org_type,
        org_size: orgForm.org_size,
        team_member_count: orgForm.team_member_count
          ? Number(orgForm.team_member_count)
          : undefined,
      });
      toast.success('تم حفظ بيانات المنظمة بنجاح. ستُستخدم لتخصيص التوصيات.');
      await refreshUser?.();
      if (isOnboarding || !isOrgProfileComplete(user)) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      if (err?.errors) setOrgErrors(err.errors);
      toast.error(err?.message || 'تعذّر حفظ بيانات المنظمة.');
    } finally {
      setOrgSubmitting(false);
    }
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwErrors({});
    setPwSubmitting(true);
    try {
      await authApi.changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
        new_password_confirmation: pwForm.new_password_confirmation,
      });
      toast.success('تم تغيير كلمة المرور بنجاح. يرجى تسجيل الدخول مجدداً.');
      setPwForm({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
      });
      setTimeout(async () => {
        await logout();
        window.location.href = '/login';
      }, 800);
    } catch (err) {
      if (err?.errors) setPwErrors(err.errors);
      toast.error(err?.message || 'تعذّر تغيير كلمة المرور.');
    } finally {
      setPwSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification();
      toast.success('تم إعادة إرسال رابط التحقق.');
    } catch (err) {
      toast.error(err?.message || 'تعذّر إعادة الإرسال.');
    } finally {
      setResending(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('profile.title')}
        subtitle={
          isOnboarding
            ? 'أكمل بيانات منظمتك لتفعيل الملخص والمساعد الذكي'
            : t('profile.subtitle')
        }
      />

      {isOnboarding && (
        <div className="mb-5 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-200">
          خطوة مهمة: حدّد اسم المنظمة ونوعها وحجمها وعدد الأعضاء قبل استخدام التحليل الذكي.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardBody>
            <div className="flex flex-col items-center text-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-2xl font-extrabold text-white">
                {user?.name?.[0] || '؟'}
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-50">
                {user?.name}
              </h3>
              <p className="text-sm text-slate-500">{user?.email}</p>
              {(orgForm.organization_name || user?.organization_name) && (
                <p className="mt-1 text-xs text-slate-500">
                  {orgForm.organization_name || user?.organization_name}
                </p>
              )}
              <div className="mt-4">
                {user?.email_verified_at ? (
                  <span className="badge-good">
                    <ShieldCheck size={12} />
                    بريد موثّق
                  </span>
                ) : (
                  <span className="badge-medium">بريد غير موثّق</span>
                )}
              </div>
            </div>

            <ul className="mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <UserIcon size={14} className="text-slate-400" />
                {user?.name}
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                {user?.email}
              </li>
              {(orgForm.organization_name || user?.organization_name) && (
                <li className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-400" />
                  {orgForm.organization_name || user?.organization_name}
                </li>
              )}
              <li className="text-xs text-slate-400">
                عضو منذ {formatDate(user?.created_at, { withTime: false })}
              </li>
            </ul>
          </CardBody>
        </Card>

        <div className="space-y-5 lg:col-span-2">
          <div ref={orgSectionRef}>
            <Card className={isOnboarding ? 'ring-2 ring-brand-400/60' : ''}>
              <CardHeader title="ملف المنظمة" subtitle="تُستخدم هذه البيانات لتخصيص التوصيات الذكية" />
              <CardBody>
                {orgLoading ? (
                  <p className="text-sm text-slate-500">جاري تحميل بيانات المنظمة…</p>
                ) : (
                  <form onSubmit={handleOrgSubmit} className="space-y-4" noValidate>
                    <Input
                      name="organization_name"
                      label="اسم المنظمة"
                      placeholder="مثال: مؤسسة بناء"
                      value={orgForm.organization_name}
                      onChange={(e) =>
                        setOrgForm((f) => ({ ...f, organization_name: e.target.value }))
                      }
                      error={orgErrors.organization_name?.[0]}
                      autoComplete="organization"
                    />

                    <div>
                      <label className="label">نوع المنظمة <span className="text-red-500">*</span></label>
                      <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                        value={orgForm.org_type}
                        onChange={(e) => setOrgForm((f) => ({ ...f, org_type: e.target.value }))}
                      >
                        <option value="">اختر نوع المنظمة…</option>
                        {ORG_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.labelAr}
                          </option>
                        ))}
                      </select>
                      {orgErrors.org_type && (
                        <p className="mt-1 text-xs text-red-600">{orgErrors.org_type[0]}</p>
                      )}
                    </div>

                    <div>
                      <label className="label">حجم المنظمة <span className="text-red-500">*</span></label>
                      <div className="flex flex-wrap gap-2">
                        {ORG_SIZES.map((size) => (
                          <Button
                            key={size.value}
                            type="button"
                            variant={orgForm.org_size === size.value ? 'primary' : 'secondary'}
                            onClick={() => setOrgForm((f) => ({ ...f, org_size: size.value }))}
                          >
                            {size.labelAr}
                          </Button>
                        ))}
                      </div>
                      {orgErrors.org_size && (
                        <p className="mt-1 text-xs text-red-600">{orgErrors.org_size[0]}</p>
                      )}
                    </div>

                    <Input
                      name="team_member_count"
                      type="number"
                      min="1"
                      label="عدد أعضاء الفريق"
                      hint="مطلوب لتحديد حجم المنظمة الصغيرة أو المتوسطة"
                      value={orgForm.team_member_count}
                      onChange={(e) =>
                        setOrgForm((f) => ({ ...f, team_member_count: e.target.value }))
                      }
                      error={orgErrors.team_member_count?.[0]}
                      autoComplete="off"
                    />

                    <Button type="submit" loading={orgSubmitting}>
                      {isOnboarding ? 'حفظ والمتابعة للوحة المعلومات' : 'حفظ بيانات المنظمة'}
                    </Button>
                  </form>
                )}
              </CardBody>
            </Card>
          </div>

          {!isOnboarding && (
            <>
              <Card>
                <CardHeader title={t('profile.preferences')} />
                <CardBody className="space-y-4">
                  <div>
                    <p className="label flex items-center gap-2">
                      <Globe size={14} />
                      {t('common.language')}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={locale === 'ar' ? 'primary' : 'secondary'}
                        onClick={async () => {
                          await setLocale('ar');
                          toast.success(t('profile.localeSaved'));
                        }}
                      >
                        {t('common.arabic')}
                      </Button>
                      <Button
                        type="button"
                        variant={locale === 'en' ? 'primary' : 'secondary'}
                        onClick={async () => {
                          await setLocale('en');
                          toast.success(t('profile.localeSaved'));
                        }}
                      >
                        {t('common.english')}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <p className="label flex items-center gap-2">
                      <Moon size={14} />
                      {t('common.theme')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['light', 'dark', 'system'].map((value) => (
                        <Button
                          key={value}
                          type="button"
                          variant={theme === value ? 'primary' : 'secondary'}
                          onClick={async () => {
                            await setTheme(value);
                            toast.success(t('profile.themeSaved'));
                          }}
                        >
                          {t(`common.${value}`)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {!user?.email_verified_at && (
                <Card>
                  <CardBody>
                    <h3 className="font-bold text-amber-700">تأكيد البريد الإلكتروني</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      حسابك لم يتم تفعيله بعد. يرجى التحقق من بريدك الإلكتروني أو
                      إعادة إرسال رابط التحقق.
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-3"
                      onClick={handleResend}
                      loading={resending}
                    >
                      إعادة إرسال رابط التحقق
                    </Button>
                  </CardBody>
                </Card>
              )}

              <Card>
                <CardHeader title="تغيير كلمة المرور" />
                <CardBody>
                  <form onSubmit={handleChangePw} className="space-y-4" noValidate>
                    <PasswordInput
                      name="current_password"
                      label="كلمة المرور الحالية"
                      autoComplete="current-password"
                      required
                      value={pwForm.current_password}
                      onChange={(e) =>
                        setPwForm((f) => ({ ...f, current_password: e.target.value }))
                      }
                      error={pwErrors.current_password?.[0]}
                    />
                    <PasswordInput
                      name="new_password"
                      label="كلمة المرور الجديدة"
                      autoComplete="new-password"
                      required
                      value={pwForm.new_password}
                      onChange={(e) =>
                        setPwForm((f) => ({ ...f, new_password: e.target.value }))
                      }
                      error={pwErrors.new_password?.[0]}
                      hint="8 أحرف على الأقل وتختلف عن الحالية"
                    />
                    <PasswordInput
                      name="new_password_confirmation"
                      label="تأكيد كلمة المرور الجديدة"
                      autoComplete="new-password"
                      required
                      value={pwForm.new_password_confirmation}
                      onChange={(e) =>
                        setPwForm((f) => ({
                          ...f,
                          new_password_confirmation: e.target.value,
                        }))
                      }
                      error={pwErrors.new_password_confirmation?.[0]}
                    />
                    <Button type="submit" loading={pwSubmitting}>
                      حفظ كلمة المرور الجديدة
                    </Button>
                  </form>
                </CardBody>
              </Card>
            </>
          )}
        </div>
      </div>

      <HowToUseGuide open={guideOpen} onClose={() => setGuideOpen(false)} />
    </PageContainer>
  );
}
