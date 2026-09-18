import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, PlusCircle } from 'lucide-react';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { axesApi, versionsApi } from '../../api/admin';
import { PageHeader } from '../../components/layout/Navbar';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Card, CardBody, CardHeader, EmptyState } from '../../components/ui/Card';
import { Input, Textarea } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { FullPageSpinner } from '../../components/ui/Spinner';

/**
 * /admin/axes — add / edit / deactivate axes with weight and order.
 * Editing is limited to the draft version (published versions are immutable).
 */
export default function AdminAxes() {
  useDocumentTitle('إدارة المحاور');
  const toast = useToast();
  const [modal, setModal] = useState(null); // {mode:'create'} | {mode:'edit', axis}
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const { data, loading, error } = useAsync(() => axesApi.list(), { deps: [reloadKey] });

  if (loading && !data) {
    return (
      <AdminLayout>
        <FullPageSpinner />
      </AdminLayout>
    );
  }

  const d = data || {};
  const axes = d.axes || [];
  const editable = d.is_editable;
  const weightReport = d.weight_report;

  const openCreate = () => {
    setForm({ key: '', name_ar: '', description_ar: '', display_order: axes.length + 1, weight: '' });
    setModal({ mode: 'create' });
  };

  const openEdit = (axis) => {
    setForm({
      key: axis.key,
      name_ar: axis.name_ar || '',
      description_ar: axis.description_ar || '',
      display_order: axis.display_order,
      weight: axis.weight,
    });
    setModal({ mode: 'edit', axis });
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.mode === 'create') {
        await axesApi.create({ ...form, version_id: d.version?.id, weight: Number(form.weight), display_order: Number(form.display_order) });
        toast.success('تم إضافة المحور بنجاح.');
      } else {
        await axesApi.update(modal.axis.id, { name_ar: form.name_ar, description_ar: form.description_ar, weight: Number(form.weight), display_order: Number(form.display_order) });
        toast.success('تم تحديث المحور.');
      }
      setModal(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'تعذّر الحفظ.');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (axis) => {
    try {
      await axesApi.toggle(axis.id);
      toast.success(axis.is_active ? 'تم تعطيل المحور دون حذفه.' : 'تم تنشيط المحور.');
      setReloadKey((k) => k + 1);
    } catch (err) {
      toast.error(err?.message || 'تعذّر تنفيذ العملية.');
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="إدارة المحاور"
        subtitle={d.version ? `الإصدار ${d.version.version_number} (${d.version.status === 'draft' ? 'مسودة' : 'منشور'})` : ''}
        actions={
          editable ? (
            <Button onClick={openCreate} leftIcon={<PlusCircle size={16} />}>إضافة محور</Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <span className="badge-neutral">الإصدار منشور — أنشئ مسودة جديدة للتعديل</span>
              <Link to="/admin/assessment-versions">
                <Button variant="secondary">إصدارات الاستبيان</Button>
              </Link>
            </div>
          )
        }
      />

      {weightReport && (
        <Card>
          <CardBody>
            <p className={`text-sm font-semibold ${weightReport.axis_weights_valid ? 'text-emerald-700' : 'text-red-600'}`}>
              مجموع أوزان المحاور: {weightReport.axis_weight_sum}%{' '}
              {weightReport.axis_weights_valid ? '(صحيح)' : '(يجب أن يكون 100%)'}
            </p>
          </CardBody>
        </Card>
      )}

      {error ? (
        <Card><CardBody><p className="text-sm text-red-600">{error}</p></CardBody></Card>
      ) : axes.length === 0 ? (
        <Card><CardBody>
          <EmptyState icon={<Layers size={44} />} title="لا توجد محاور" description="ابدأ بإضافة أول محور أو أنشئ إصدار استبيان جديد." />
        </CardBody></Card>
      ) : (
        <div className="grid gap-3">
          {axes.map((axis) => (
            <Card key={axis.id} className={!axis.is_active ? 'opacity-60' : ''}>
              <CardBody>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      {axis.name_ar}
                      {!axis.is_active && <span className="badge-low mr-2">معطّل</span>}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      المفتاح: {axis.key} — الترتيب: {axis.display_order} — الأسئلة: {axis.questions_count}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge-medium">وزن المحور: {axis.weight}%</span>
                    <Button variant="secondary" onClick={() => openEdit(axis)} disabled={!editable}>تعديل</Button>
                    <Button variant={axis.is_active ? 'danger' : 'primary'} onClick={() => toggle(axis)} disabled={!editable}>
                      {axis.is_active ? 'تعطيل' : 'تنشيط'}
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal open onClose={() => setModal(null)} title={modal.mode === 'create' ? 'إضافة محور جديد' : 'تعديل المحور'}>
          <form onSubmit={save} className="space-y-4">
            {modal.mode === 'create' && (
              <>
                <Input label="المفتاح (بالإنجليزية)" required value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} hint="مثال: governance" />
                <Input label="اسم المحور بالعربية" required value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} />
              </>
            )}
            {modal.mode === 'edit' && (
              <Input label="اسم المحور بالعربية" required value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} />
            )}
            <Textarea label="وصف المحور" required value={form.description_ar} onChange={(e) => setForm((f) => ({ ...f, description_ar: e.target.value }))} />
            <Input label="وزن المحور (%)" type="number" min="0" max="100" step="0.01" required value={form.weight} onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))} />
            <Input label="ترتيب العرض" type="number" min="0" required value={form.display_order} onChange={(e) => setForm((f) => ({ ...f, display_order: e.target.value }))} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setModal(null)}>إلغاء</Button>
              <Button type="submit" loading={saving}>حفظ</Button>
            </div>
          </form>
        </Modal>
      )}
    </AdminLayout>
  );
}
