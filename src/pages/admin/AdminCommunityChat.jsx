import { useEffect, useRef, useState } from 'react';
import { Send, Shield } from 'lucide-react';
import { adminCommunityChatApi } from '../../api/admin';
import { createEcho } from '../../lib/echo';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../contexts/ToastContext';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner } from '../../components/ui/Spinner';

export default function AdminCommunityChat() {
  useDocumentTitle('دردشة المجتمع');
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    adminCommunityChatApi.list()
      .then((res) => setMessages(res.data?.messages || []))
      .catch((err) => toast.error(err?.message || 'تعذّر تحميل الدردشة.'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    const echo = createEcho('admin');
    if (!echo) return undefined;
    echo.private('community-chat').listen('.community.message', (payload) => {
      setMessages((prev) => (prev.some((m) => m.id === payload.id) ? prev : [...prev, payload]));
    });
    return () => {
      echo.leave('community-chat');
      echo.disconnect();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    setSending(true);
    setText('');
    try {
      const res = await adminCommunityChatApi.send(body);
      const msg = res.data;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (err) {
      setText(body);
      toast.error(err?.message || 'تعذّر الإرسال.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <AdminLayout><FullPageSpinner /></AdminLayout>;

  return (
    <AdminLayout>
      <PageHeader title="دردشة المجتمع" subtitle="مراقبة ومشاركة في الغرفة العامة للمستخدمين" />
      <Card>
        <CardHeader title="غرفة المجتمع" action={<span className="badge-medium"><Shield size={13} /> وضع الإدارة</span>} />
        <CardBody>
          <div className="mb-4 max-h-[60vh] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">
            {messages.map((message) => (
              <div key={message.id} className={`rounded-2xl px-4 py-3 text-sm ${message.is_admin ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-white ring-1 ring-slate-100'}`}>
                <p className="mb-1 text-[11px] font-bold text-slate-500">
                  {message.is_admin ? 'إدارة' : 'مستخدم'} — {message.sender_name}
                </p>
                <p className="text-slate-800">{message.body}</p>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="flex gap-2">
            <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="رد كإدارة..." maxLength={2000} />
            <Button type="submit" loading={sending} leftIcon={<Send size={16} />}>إرسال</Button>
          </form>
        </CardBody>
      </Card>
    </AdminLayout>
  );
}
