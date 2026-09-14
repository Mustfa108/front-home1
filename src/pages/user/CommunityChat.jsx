import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Shield } from 'lucide-react';
import { communityChatApi } from '../../api/community';
import { createEcho } from '../../lib/echo';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner, InlineSpinner } from '../../components/ui/Spinner';

export default function CommunityChat() {
  useDocumentTitle('دردشة المجتمع');
  const toast = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    communityChatApi.list()
      .then((res) => {
        if (!cancelled) setMessages(res.data?.messages || []);
      })
      .catch((err) => toast.error(err?.message || 'تعذّر تحميل الدردشة.'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast]);

  useEffect(() => {
    const echo = createEcho('user');
    if (!echo) return undefined;

    const channel = echo.private('community-chat');
    channel.listen('.community.message', (payload) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === payload.id)) return prev;
        return [...prev, payload];
      });
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
      const res = await communityChatApi.send(body);
      const msg = res.data;
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    } catch (err) {
      setText(body);
      toast.error(err?.message || 'تعذّر إرسال الرسالة.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <PageContainer>
      <PageHeader
        title="دردشة المجتمع"
        subtitle="غرفة واحدة لجميع المستخدمين — يمكن للإدارة المشاهدة والمشاركة أيضاً"
      />
      <Card className="overflow-hidden">
        <CardHeader title="المحادثة الحية" subtitle="الرسائل تظهر فوراً عند تشغيل Reverb" action={<span className="badge-good"><MessageCircle size={13} /> مجتمع HumaScale</span>} />
        <CardBody>
          <div className="mb-4 max-h-[55vh] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">ابدأ المحادثة — كن أول من يكتب رسالة للمجتمع.</p>
            )}
            {messages.map((message) => {
              const mine = !message.is_admin && message.user_id === user?.id;
              return (
                <div key={message.id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                    message.is_admin
                      ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200'
                      : mine
                        ? 'bg-brand-600 text-white'
                        : 'bg-white text-slate-700 ring-1 ring-slate-100 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                  >
                    <p className="mb-1 flex items-center gap-1 text-[11px] font-bold opacity-80">
                      {message.is_admin && <Shield size={12} />}
                      {message.sender_name}
                    </p>
                    <p>{message.body}</p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={send} className="flex gap-2">
            <input
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="اكتب رسالة للمجتمع..."
              maxLength={2000}
            />
            <Button type="submit" loading={sending} className="shrink-0" leftIcon={<Send size={16} />}>
              إرسال
            </Button>
          </form>
          {sending && <div className="mt-2"><InlineSpinner label="جارٍ الإرسال…" /></div>}
        </CardBody>
      </Card>
    </PageContainer>
  );
}
