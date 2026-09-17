import { useState } from 'react';
import { HelpCircle, PlusCircle } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { questionsApi, axesApi } from '../../api/admin';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, CardHeader, EmptyState } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';

/**
 * /admin/questions — add / edit / deactivate questions linked to axes,
 * with weight and order, inside the draft version only.
 */
export default function AdminQuestions() {
  useDocumentTitle('إدارة الأسئلة');
  const toast = useToast();
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const { data, loading, error } = useAsync(async () => {
    const [q, a] = await Promise.all([questionsApi.list(), axesApi.list()]);
    return { questions: q.data, axes: a.data };
  }, { deps: [reloadKey] });

  if (loading && !data) return <FullPageSpinner />;

  const questions = data?.questions?.questions || [];
  const axes = data?.axes?.axes || [];
  const editable = data?.questions?.is_editable;
  const versionId = data?.questions?.version?.id;

  const openCreate = () => {
    setForm({ pillar_id: '', text_ar: '', display_order: questions.length + 1, weight: '', answer_type: 'likert' });
    setModal({ mode: 'create' });
  };

  const openEdit = (question) => {
    setForm({
      pillar_id: question.pillar_id,
      text_ar: question.text_ar || '',
      display_order: question.display_order,
      weight: question.weight,
      answer_type: question.answer_type || 'likert',
    });
    setModal({ mode: 'edit', question });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        pillar_id: Number(form.pillar_id),
        text_ar: form.text_ar,
        display_order: Number(form.display_order),
        weight: Number(form.weight),
        answer_type: form.answer_type || 'likert',
      };
      if (modal.mode === 'create') {
        await questionsApi.create({ ...payload, version_id: versionId });
        toast.success('تم إضافة السؤال بنجاح.');
      } else {
        await questionsApi.update(modal.question.id, payload);
        toast.success('تم تحديث السؤال.');
      }
      setModal(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'تعذّر الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (question) => {
    try {
      await questionsApi.toggle(question.id);
      toast.success(question.is_active ? 'تم تعطيل السؤال دون حذفه حفاظاً على النتائج السابقة.' : 'تم تنشيط السؤال.');
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'تعذّر تنفيذ العملية.');
    }
  };

  const totalWeight = questions.filter((q) => q.is_active).reduce((sum, q) => sum + Number(q.weight || 0), 0);

  return (
    <PageContainer>
      <PageHeader
        title="إدارة الأسئلة"
        actions={
          editable ? (
            <Button onClick={openCreate} leftIcon={<PlusCircle size={16} />}>إضافة سؤال</Button>
          ) : (
            <span className="badge-neutral">الإصدار منشور — أنشئ مسودة جديدة للتعديل</span>
          )
        }
      />

      <Card>
        <CardHeader title="مجموع أوزان الأسئلة" />
        <CardBody>
          <p className={`text-sm font-semibold ${Math.abs(totalWeight - 100) < 0.05 ? 'text-emerald-700' : 'text-red-600'}`}>
            مجموع أوزان الأسئلة النشطة: {Math.round(totalWeight * 100) / 100}%{' '}
            {Math.abs(totalWeight - 100) < 0.05 ? '(صحيح)' : '(يجب أن يكون 100% — عدّل الأوزان قبل نشر الإصدار)'}
          </p>
        </CardBody>
      </Card>

      {error ? (
        <Card><CardBody><p className="text-sm text-red-600">{error}</p></CardBody></Card>
      ) : questions.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={<HelpCircle size={44} />} title="لا توجد أسئلة" description="أضف أسئلة واربطها بالمحاور." />
        </CardBody></Card>
      ) : (
        <div className="grid gap-3">
          {questions.map((q) => (
            <Card key={q.id} className={!q.is_active ? 'opacity-60' : ''}>
              <CardBody>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {q.text_ar}
                      {!q.is_active && <span className="badge-low mr-2">معطّل</span>}
                      {q.used_in_assessments && <span className="badge-neutral mr-2">مستخدم في تقييمات سابقة</span>}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      المحور: {q.pillar_name_ar} — الترتيب: {q.display_order} — النوع:{' '}
                      {(q.answer_type || 'likert') === 'yes_no' ? 'نعم / لا' : 'مقياس Likert'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-medium">وزن السؤال: {q.weight}%</span>
                    <Button variant="secondary" onClick={() => openEdit(q)} disabled={!editable}>تعديل</Button>
                    <Button variant={q.is_active ? 'danger' : 'primary'} onClick={() => toggle(q)} disabled={!editable}>
                      {q.is_active ? 'تعطيل' : 'تنشيط'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal open onClose={() => setModal(null)} title={modal.mode === 'create' ? 'إضافة سؤال جديد' : 'تعديل السؤال'}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">ربط السؤال بمحور <span className="text-red-500">*</span></label>
              <select
                className="input"
                value={form.pillar_id || ''}
                onChange={(e) => setForm((f) => ({ ...f, pillar_id: e.target.value }))}
                required
              >
                <option value="">اختر المحور…</option>
                {axes.filter((a) => a.is_active).map((a) => (
                  <option key={a.id} value={a.id}>{a.name_ar}</option>
                ))}
              </select>
            </div>
            <Textarea label="نص السؤال" required value={form.text_ar} onChange={(e) => setForm((f) => ({ ...f, text_ar: e.target.value }))} />
            <div>
              <label className="label">نوع الإجابة</label>
              <select
                className="input"
                value={form.answer_type || 'likert'}
                onChange={(e) => setForm((f) => ({ ...f, answer_type: e.target.value }))}
              >
                <option value="likert">مقياس Likert (1–5)</option>
                <option value="yes_no">نعم / لا</option>
              </select>
            </div>
            <Input label="وزن السؤال (%)" type="number" min="0" max="100" step="0.01" required value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
            <Input label="ترتيب العرض" type="number" min="0" required value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModal(null)}>إلغاء</Button>
              <Button type="submit" loading={saving}>حفظ</Button>
            </div>
          </form>
        </Modal>
      )}
    </PageContainer>
  );
}
