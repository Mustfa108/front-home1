import { useMemo, useState } from 'react';
import { MapPin, Trash2, Plus, Lock, User } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { useToast } from '../../contexts/ToastContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { expansionAreasApi } from '../../api/expansionAreas';
import { projectMapApi } from '../../api/community';
import { pickLocale } from '../../utils/locale';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FullPageSpinner } from '../../components/ui/Spinner';
import 'leaflet/dist/leaflet.css';

function ClickCapture({ onPick, enabled }) {
  useMapEvents({
    click(e) {
      if (enabled) onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

const EMPTY_FORM = { name_ar: '', name_en: '', notes: '' };

export default function ExpansionMap() {
  const { locale, t } = useLanguage();
  useDocumentTitle(t('map.title'));
  const toast = useToast();
  const [tab, setTab] = useState('projects');
  const { data: projectsPayload, loading: loadingProjects, refresh: refreshProjects } = useAsync(
    () => projectMapApi.list(),
    { deps: [] },
  );
  const { data, loading, error, refresh } = useAsync(
    () => expansionAreasApi.list(),
    { deps: [] },
  );
  const items = data?.data?.items || data?.items || [];
  const projectPins = projectsPayload?.data?.items || projectsPayload?.items || [];
  const [draft, setDraft] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const center = useMemo(() => {
    if (tab === 'projects' && projectPins[0]) return [projectPins[0].lat, projectPins[0].lng];
    if (draft) return [draft.lat, draft.lng];
    if (items[0]) return [items[0].lat, items[0].lng];
    return [33.5138, 36.2765]; // Damascus default (Syria)
  }, [draft, items, projectPins, tab]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!draft) {
      toast.error(t('map.clickMap'));
      return;
    }
    setSaving(true);
    try {
      await expansionAreasApi.create({
        name_ar: form.name_ar,
        name_en: form.name_en || undefined,
        lat: draft.lat,
        lng: draft.lng,
        notes: form.notes || undefined,
      });
      toast.success(t('map.saved'));
      setForm(EMPTY_FORM);
      setDraft(null);
      refresh();
    } catch (err) {
      toast.error(err?.message || t('map.title'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await expansionAreasApi.remove(id);
      toast.success(t('map.deleted'));
      refresh();
    } catch (err) {
      toast.error(err?.message || t('common.delete'));
    }
  };

  if ((loading || loadingProjects) && !data && !projectsPayload) return <FullPageSpinner />;

  return (
    <PageContainer>
      <PageHeader
        title={locale === 'en' ? 'Projects & expansion map' : 'خريطة المشاريع والتوسع'}
        subtitle={locale === 'en'
          ? 'Claimed project pins and your expansion areas'
          : 'نقاط المشاريع المحجوزة ومناطق التوسع الخاصة بك'}
        actions={
          <Link to="/project-review" className="btn-primary text-sm">
            تقييم مشروع وحجز نقطة
          </Link>
        }
      />

      <div className="mb-4 flex gap-2">
        <Button variant={tab === 'projects' ? 'primary' : 'secondary'} onClick={() => setTab('projects')}>
          خريطة المشاريع
        </Button>
        <Button variant={tab === 'expansion' ? 'primary' : 'secondary'} onClick={() => setTab('expansion')}>
          مناطق التوسع
        </Button>
        <Button variant="secondary" onClick={() => { refreshProjects(); refresh(); }}>تحديث</Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardBody className="p-0">
            <div className="h-[480px] w-full">
              <MapContainer center={center} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ClickCapture enabled={tab === 'expansion'} onPick={setDraft} />

                {tab === 'projects' && projectPins.map((pin) => (
                  <CircleMarker
                    key={pin.id}
                    center={[pin.lat, pin.lng]}
                    radius={10}
                    pathOptions={{
                      color: pin.is_mine ? '#2563EB' : pin.is_claimed ? '#DC2626' : '#16A34A',
                      fillColor: pin.is_mine ? '#3B82F6' : pin.is_claimed ? '#EF4444' : '#22C55E',
                      fillOpacity: 0.85,
                    }}
                  >
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold">{pin.project_name}</p>
                        <p className="mt-1 text-xs">
                          {pin.is_mine ? 'مشروعي' : pin.is_claimed ? 'محجوز لمستخدم آخر' : 'متاح'}
                        </p>
                        {pin.location && <p className="text-xs text-slate-500">{pin.location}</p>}
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {tab === 'expansion' && items.map((item) => (
                  <CircleMarker
                    key={item.id}
                    center={[item.lat, item.lng]}
                    radius={9}
                    pathOptions={{ color: '#0F766E', fillColor: '#14B8A6', fillOpacity: 0.8 }}
                  >
                    <Popup>
                      <div className="space-y-2 text-sm">
                        <p className="font-bold">{pickLocale(item, 'name', locale) || item.name_ar}</p>
                        <Button variant="danger" onClick={() => handleDelete(item.id)} leftIcon={<Trash2 size={14} />}>
                          {t('common.delete')}
                        </Button>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}

                {tab === 'expansion' && draft && (
                  <CircleMarker center={[draft.lat, draft.lng]} radius={10} pathOptions={{ color: '#F59E0B', fillColor: '#FBBF24', fillOpacity: 0.9 }} />
                )}
              </MapContainer>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          {tab === 'projects' ? (
            <Card>
              <CardBody>
                <h3 className="mb-3 font-bold text-slate-800">دليل الألوان</h3>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" /> مشروعي</li>
                  <li className="flex items-center gap-2"><Lock size={14} className="text-red-500" /> محجوز (أخذه مستخدم)</li>
                  <li className="flex items-center gap-2"><User size={14} className="text-emerald-500" /> متاح</li>
                </ul>
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  احجز نقطة موقع من صفحة تقييم المشروع الذكي. النقاط المحجوزة تظهر للجميع ولا يمكن لمستخدم آخر أخذها.
                </p>
                {projectPins.length === 0 && (
                  <EmptyState icon={<MapPin size={32} />} title="لا توجد مشاريع على الخريطة بعد" description="أنشئ تقييم مشروع مع إحداثيات." className="mt-4 border-0 py-6" />
                )}
              </CardBody>
            </Card>
          ) : (
            <Card>
              <CardBody>
                <form onSubmit={handleSave} className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700 flex items-center gap-2"><Plus size={16} /> إضافة منطقة توسع</p>
                  {error && <p className="text-xs text-red-600">{error}</p>}
                  <Input label="الاسم بالعربية" value={form.name_ar} onChange={(e) => setForm((f) => ({ ...f, name_ar: e.target.value }))} required />
                  <Input label="الاسم بالإنجليزية" value={form.name_en} onChange={(e) => setForm((f) => ({ ...f, name_en: e.target.value }))} />
                  <Input label="ملاحظات" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                  <p className="text-xs text-slate-500">
                    {draft ? `الموقع: ${draft.lat.toFixed(5)}, ${draft.lng.toFixed(5)}` : 'انقر على الخريطة لتحديد النقطة'}
                  </p>
                  <Button type="submit" loading={saving} disabled={!draft}>حفظ المنطقة</Button>
                </form>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
