import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Lightbulb,
  MapPin,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  Target,
  TrendingUp,
  ListOrdered,
  Star,
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { projectReviewsApi } from '../../api/projectReviews';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useAsync } from '../../hooks/useAsync';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, CardHeader, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { FullPageSpinner, InlineSpinner } from '../../components/ui/Spinner';
import { OrgProfileGate } from '../../components/OrgProfileGate';
import { useAuth } from '../../contexts/AuthContext';
import { isOrgProfileComplete } from '../../utils/orgProfile';
import 'leaflet/dist/leaflet.css';

const initialForm = {
  project_name: '',
  stage: 'idea',
  location: '',
  lat: null,
  lng: null,
  team_size: '',
  annual_budget: '',
  mission: '',
  problem: '',
  beneficiaries: '',
  activities: '',
  impact: '',
  sustainability: '',
};

const stageLabels = {
  idea: 'فكرة أولية',
  pilot: 'تجربة أولية',
  operating: 'يعمل حالياً',
  growing: 'في مرحلة نمو',
};

function MapClickPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function ProjectReview() {
  useDocumentTitle('تقييم مشروع ذكي');
  const toast = useToast();
  const { user } = useAuth();
  const orgReady = isOrgProfileComplete(user);
  const [form, setForm] = useState(initialForm);
  const [review, setReview] = useState(null);
  const [creating, setCreating] = useState(false);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const { data: reviewsPayload, loading: loadingHistory } = useAsync(
    () => projectReviewsApi.list(),
    { deps: [] },
  );
  const reviews = reviewsPayload?.data || [];

  useEffect(() => {
    if (!review && reviews.length) {
      projectReviewsApi.get(reviews[0].id).then((response) => setReview(response.data)).catch(() => {});
    }
  }, [reviews, review]);

  const update = (name) => (event) => {
    setForm((current) => ({ ...current, [name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!orgReady) {
      toast.error('أكمل ملف منظمتك (النوع والحجم) قبل تحليل المشروع.');
      return;
    }
    setCreating(true);
    try {
      const payload = {
        ...form,
        team_size: form.team_size ? Number(form.team_size) : null,
        annual_budget: form.annual_budget ? Number(form.annual_budget) : null,
        lat: form.lat != null ? Number(form.lat) : null,
        lng: form.lng != null ? Number(form.lng) : null,
      };
      const response = await projectReviewsApi.create(payload);
      setReview(response.data);
      toast.success('اكتمل تحليل المشروع. يمكنك الآن مناقشة النتيجة مع المساعد.');
    } catch (error) {
      const detail =
        error?.errors
          ? Object.values(error.errors).flat().join(' ')
          : error?.message;
      toast.error(detail || 'تعذّر تحليل المشروع. تحقق من الاتصال أو مفتاح الذكاء الاصطناعي.');
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    setForm(initialForm);
    setReview(null);
    setChatText('');
  };

  const openReview = async (id) => {
    try {
      const response = await projectReviewsApi.get(id);
      setReview(response.data);
    } catch (error) {
      toast.error(error?.message || 'تعذّر تحميل التقييم.');
    }
  };

  const sendChat = async (event) => {
    event.preventDefault();
    const message = chatText.trim();
    if (!message || !review) return;
    setChatText('');
    setChatLoading(true);
    try {
      const response = await projectReviewsApi.chat(review.id, message);
      setReview((current) => ({
        ...current,
        messages: [
          ...(current.messages || []),
          { id: `local-user-${Date.now()}`, role: 'user', content: message },
          { id: `local-ai-${Date.now()}`, role: 'assistant', content: response.data.message },
        ],
      }));
    } catch (error) {
      setChatText(message);
      toast.error(
        error?.status === 429
          ? 'تم تجاوز الحد اليومي للمساعد. حاول غداً.'
          : error?.message || 'تعذّر الاتصال بالمساعد الذكي. تحقق من مفتاح Gemini أو إعدادات الشبكة.',
      );
    } finally {
      setChatLoading(false);
    }
  };

  if (loadingHistory && !reviews.length) return <FullPageSpinner />;

  const mapCenter = form.lat && form.lng ? [form.lat, form.lng] : [33.5138, 36.2765];

  return (
    <PageContainer>
      <PageHeader
        title="مراجعة مشروع بالذكاء الاصطناعي"
        subtitle="ملخص كامل، ميزات متوقعة، خطوات مثالية، وحجز نقطة على الخريطة."
        actions={
          <div className="flex gap-2">
            <Link to="/expansion" className="btn-secondary text-sm inline-flex items-center gap-1">
              <MapPin size={14} /> الخريطة
            </Link>
            <Button variant="secondary" onClick={reset} leftIcon={<RotateCcw size={16} />}>
              تقييم جديد
            </Button>
          </div>
        }
      />

      <OrgProfileGate className="mb-5" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.75fr)]">
        <Card>
          <CardHeader
            title="بيانات المشروع"
            subtitle="كلما كان الوصف محدداً، أصبحت التوصيات أقرب إلى الواقع."
            action={<span className="badge-neutral">تحليل خاص بحسابك</span>}
          />
          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="اسم المشروع"
                  name="project_name"
                  value={form.project_name}
                  onChange={update('project_name')}
                  placeholder="مثال: نادي القراءة المجتمعي"
                  required
                />
                <div>
                  <label className="label" htmlFor="stage">مرحلة المشروع</label>
                  <select id="stage" name="stage" value={form.stage} onChange={update('stage')} className="input">
                    {Object.entries(stageLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                <Input label="الموقع أو النطاق الجغرافي" name="location" value={form.location} onChange={update('location')} placeholder="المدينة / المنطقة" />
                <Input label="حجم الفريق" name="team_size" type="number" min="1" value={form.team_size} onChange={update('team_size')} placeholder="عدد الأشخاص" />
                <Input label="الميزانية السنوية التقريبية" name="annual_budget" type="number" min="0" value={form.annual_budget} onChange={update('annual_budget')} placeholder="بالعملة المحلية" />
              </div>

              <div>
                <p className="label mb-2">موقع المشروع على الخريطة (اختياري — يحجز النقطة لك)</p>
                <div className="h-56 overflow-hidden rounded-2xl border border-slate-200">
                  <MapContainer center={mapCenter} zoom={7} style={{ height: '100%', width: '100%' }}>
                    <TileLayer attribution="&copy; OSM" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickPicker onPick={({ lat, lng }) => setForm((f) => ({ ...f, lat, lng }))} />
                    {form.lat != null && form.lng != null && (
                      <CircleMarker center={[form.lat, form.lng]} radius={10} pathOptions={{ color: '#2563EB', fillColor: '#3B82F6', fillOpacity: 0.9 }} />
                    )}
                  </MapContainer>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {form.lat != null
                    ? `تم اختيار النقطة: ${Number(form.lat).toFixed(5)}, ${Number(form.lng).toFixed(5)} — ستُعلَّم كمحجوزة بعد التحليل`
                    : 'انقر على الخريطة لتحديد موقع المشروع وحجزه'}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Textarea label="رسالة المشروع" name="mission" value={form.mission} onChange={update('mission')} placeholder="ما الذي يريد المشروع تغييره؟" minLength={20} required />
                <Textarea label="المشكلة التي يعالجها" name="problem" value={form.problem} onChange={update('problem')} placeholder="صف المشكلة كما تظهر في الواقع." minLength={20} required />
                <Textarea label="الفئة المستفيدة" name="beneficiaries" value={form.beneficiaries} onChange={update('beneficiaries')} placeholder="من المستفيد؟ وكم عددهم تقريباً؟" minLength={10} required />
                <Textarea label="الأنشطة الأساسية" name="activities" value={form.activities} onChange={update('activities')} placeholder="ما الذي ينفذه الفريق فعلياً؟" minLength={20} required />
                <Textarea label="الأثر المتوقع (اختياري)" name="impact" value={form.impact} onChange={update('impact')} placeholder="ما النتيجة التي ستتغير لدى المستفيدين؟" />
                <Textarea label="خطة الاستدامة (اختياري)" name="sustainability" value={form.sustainability} onChange={update('sustainability')} placeholder="كيف سيستمر المشروع بعد التجربة الأولى؟" />
              </div>

              <div className="flex flex-col gap-3 rounded-2xl bg-brand-50 p-4 text-sm text-brand-800 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 shrink-0 text-brand-600" size={19} />
                  <p>الذكاء الاصطناعي يشرح البيانات المدخلة ولا يستبدل التحقق الميداني أو قرار الفريق.</p>
                </div>
                <Button type="submit" loading={creating} rightIcon={<Sparkles size={16} />}>
                  تحليل المشروع
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden border-brand-200 bg-gradient-to-br from-brand-700 via-brand-600 to-teal-700 text-white">
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-100">مفتاح الذكاء</p>
                  <h2 className="mt-2 text-2xl font-extrabold">قرار أوضح، خطوة تالية أسرع</h2>
                </div>
                <span className="rounded-2xl bg-white/15 p-3"><Bot size={25} /></span>
              </div>
              <p className="mt-4 text-sm leading-7 text-brand-100">
                بعد التحليل ستحصل على ملخص كامل وميزات متوقعة وخارطة خطوات مثالية، ويمكنك سؤال المساعد عن أي توصية.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="تقييماتك السابقة" subtitle="يمكنك فتح أي تحليل ومتابعة الحوار حوله." />
            <CardBody className="p-3">
              {reviews.length === 0 ? (
                <EmptyState icon={<ClipboardCheck size={30} />} title="لا توجد تقييمات بعد" description="أنشئ أول مراجعة لمشروعك من النموذج." className="border-0 py-7" />
              ) : (
                <div className="space-y-2">
                  {reviews.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => openReview(item.id)}
                      className={`flex w-full items-center justify-between rounded-xl p-3 text-right transition ${review?.id === item.id ? 'bg-brand-50 text-brand-800' : 'hover:bg-slate-50'}`}
                    >
                      <span>
                        <span className="block text-sm font-bold">{item.project_name}</span>
                        <span className="mt-1 block text-xs text-slate-500">{stageLabels[item.stage] || item.stage}</span>
                      </span>
                      <span className="text-lg font-extrabold text-brand-600">{item.ai_score}%</span>
                    </button>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {review && <ReviewResult review={review} chatText={chatText} setChatText={setChatText} sendChat={sendChat} chatLoading={chatLoading} />}
    </PageContainer>
  );
}

function ReviewResult({ review, chatText, setChatText, sendChat, chatLoading }) {
  const scoreTone = review.ai_score >= 80 ? 'text-emerald-600' : review.ai_score >= 60 ? 'text-amber-600' : 'text-red-600';
  const messages = review.messages || [];
  const recommendations = review.recommendations || [];
  const kpis = review.kpis || [];
  const features = review.features || [];
  const goals = review.goals || [];
  const howItWorks = review.how_it_works || [];
  const idealSteps = review.ideal_steps || [];

  return (
    <section className="mt-6 space-y-6">
      <div className="flex items-center gap-2">
        <Target className="text-brand-600" size={21} />
        <h2 className="heading-3">نتيجة التقييم: {review.project_name}</h2>
      </div>

      {review.is_fallback && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">تقييم تقريبي (وضع احتياطي)</p>
            <p className="mt-1 text-amber-800 dark:text-amber-200">
              تعذّر الاتصال بخدمة الذكاء الاصطناعي أو تحليل الرد حالياً، لذلك عُرض تقييم مبسّط مبني على إجاباتك. المحتوى تقريبي — أعد الإرسال لاحقاً بعد التأكد من مفتاح Gemini على السيرفر.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardBody><p className="text-sm text-slate-500">الدرجة الواقعية</p><p className={`mt-2 text-4xl font-extrabold ${scoreTone}`}>{review.ai_score}<span className="text-lg">/100</span></p></CardBody></Card>
        <Card><CardBody><p className="text-sm text-slate-500">مستوى الجاهزية</p><p className="mt-3 text-xl font-bold text-slate-900">{review.ai_level}</p><span className="mt-2 inline-flex items-center gap-1 text-xs text-slate-500"><TrendingUp size={14} /> بناءً على وصف المشروع</span></CardBody></Card>
        <Card><CardBody><p className="text-sm text-slate-500">مرحلة التنفيذ</p><p className="mt-3 text-xl font-bold text-slate-900">{stageLabels[review.stage] || review.stage}</p>
          {review.is_claimed && <span className="mt-2 inline-flex items-center gap-1 text-xs text-emerald-600"><MapPin size={14} /> نقطة محجوزة على الخريطة</span>}
        </CardBody></Card>
      </div>

      <Card>
        <CardHeader title="الملخص الكامل للمشروع" subtitle="شرح مفصّل بالذكاء الاصطناعي بعد إجاباتك" />
        <CardBody>
          <p className="leading-8 text-slate-700 dark:text-slate-200 whitespace-pre-line">{review.full_summary || review.ai_summary_ar}</p>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="أهداف المشروع" action={<Target size={16} className="text-brand-600" />} />
          <CardBody>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {goals.length === 0 && <li className="text-slate-500">لا توجد أهداف مُولَّدة بعد.</li>}
              {goals.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2 rounded-xl bg-teal-50/80 px-3 py-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-teal-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="ميزات المشروع" action={<Star size={16} className="text-brand-600" />} />
          <CardBody>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {features.length === 0 && <li className="text-slate-500">لا توجد ميزات مُولَّدة بعد.</li>}
              {features.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2 rounded-xl bg-brand-50/70 px-3 py-2">
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="كيف يعمل المشروع" action={<ListOrdered size={16} className="text-brand-600" />} />
          <CardBody>
            <ol className="space-y-3">
              {howItWorks.length === 0 && <li className="text-sm text-slate-500">لا توجد آلية عمل مُولَّدة بعد.</li>}
              {howItWorks.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">{index + 1}</span>
                  <span className="pt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">{item}</span>
                </li>
              ))}
            </ol>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="الخطوات المثالية" action={<ListOrdered size={16} className="text-brand-600" />} />
        <CardBody>
          <ol className="space-y-3">
            {idealSteps.length === 0 && <li className="text-sm text-slate-500">لا توجد خطوات مُولَّدة بعد.</li>}
            {idealSteps.map((item, index) => (
              <li key={`${item}-${index}`} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-700">{index + 1}</span>
                <span className="pt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">{item}</span>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader title="القراءة التنفيذية" subtitle="تفسير مبني على البيانات التي قدمها فريقك." />
          <CardBody>
            <p className="leading-8 text-slate-700 dark:text-slate-200">{review.ai_summary_ar}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InsightList title="ما يدعم المشروع" items={review.strengths} icon={<CheckCircle2 size={17} />} tone="good" />
              <InsightList title="ما يحتاج تحققاً" items={review.risks} icon={<AlertTriangle size={17} />} tone="risk" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="خطة الـ 30–90 يوماً" subtitle="ابدأ بالأعلى تأثيراً والأقل تعقيداً." />
          <CardBody>
            <ol className="space-y-4">
              {recommendations.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">{index + 1}</span>
                  <span className="pt-1 text-sm leading-6 text-slate-700 dark:text-slate-200">{item}</span>
                </li>
              ))}
            </ol>
            <div className="mt-6 rounded-xl bg-emerald-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-800"><Lightbulb size={16} /> مؤشرات مقترحة</p>
              <ul className="mt-2 space-y-2 text-xs leading-5 text-emerald-700">
                {kpis.map((kpi, index) => <li key={`${kpi}-${index}`}>• {kpi}</li>)}
              </ul>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="مساعد المشروع" subtitle="اسأل عن النتيجة، اطلب تبسيط توصية، أو حوّلها إلى مهمة للفريق." action={<span className="badge-good"><MessageCircle size={13} /> متصل بسياق التقييم</span>} />
        <CardBody>
          <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
            {messages.length === 0 && (
              <div className="flex items-start gap-3 text-sm text-slate-600">
                <span className="rounded-xl bg-brand-100 p-2 text-brand-700"><Bot size={18} /></span>
                <p>أنا جاهز. جرّب: «ما أول خطوة خلال هذا الأسبوع؟» أو «كيف أقيس الأثر؟»</p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <span className={`rounded-xl p-2 ${message.role === 'user' ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200' : 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300'}`}>
                  {message.role === 'user' ? <MessageCircle size={17} /> : <Bot size={17} />}
                </span>
                <p className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === 'user' ? 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200' : 'bg-brand-50 text-slate-700 dark:bg-brand-950/40 dark:text-slate-200'}`}>{message.content}</p>
              </div>
            ))}
          </div>
          <form onSubmit={sendChat} className="flex gap-2">
            <input className="input" value={chatText} onChange={(event) => setChatText(event.target.value)} placeholder="اكتب سؤالك عن مشروعك..." maxLength={1200} />
            <Button type="submit" loading={chatLoading} aria-label="إرسال السؤال" className="shrink-0 px-4" rightIcon={<Send size={16} />}>إرسال</Button>
          </form>
          {chatLoading && <div className="mt-3"><InlineSpinner label="المساعد يراجع سياق تقييمك..." /></div>}
        </CardBody>
      </Card>
    </section>
  );
}

function InsightList({ title, items = [], icon, tone }) {
  const classes = tone === 'good'
    ? 'bg-emerald-50 text-emerald-800'
    : 'bg-amber-50 text-amber-800';
  return (
    <div className={`rounded-2xl p-4 ${classes}`}>
      <h3 className="flex items-center gap-2 text-sm font-bold">{icon}{title}</h3>
      <ul className="mt-3 space-y-2 text-xs leading-5">
        {items.map((item, index) => <li key={`${item}-${index}`}>• {item}</li>)}
      </ul>
    </div>
  );
}
