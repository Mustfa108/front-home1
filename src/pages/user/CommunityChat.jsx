import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Shield, WifiOff } from 'lucide-react';
import { communityChatApi } from '../../api/community';
import { createEcho } from '../../lib/echo';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { PageContainer, PageHeader } from '../../components/layout/Navbar';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FullPageSpinner } from '../../components/ui/Spinner';

function describeSendError(err) {
  if (err?.isCorsError || err?.isNetworkError) {
    return err.message || 'تعذّر الاتصال بالخادم. غالباً مشكلة CORS أو إعدادات الشبكة.';
  }
  if (err?.status === 401) {
    return 'انتهت جلستك. سجّل الدخول مجدداً ثم أعد الإرسال.';
  }
  if (err?.status === 422) {
    return err.message || 'الرسالة غير صالحة.';
  }
  if (err?.status === 429) {
    return 'تم تجاوز حد الإرسال. حاول بعد قليل.';
  }
  return err?.message || 'تعذّر إرسال الرسالة.';
}

export default function CommunityChat() {
  useDocumentTitle('دردشة المجتمع');
  const toast = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [realtimeOk, setRealtimeOk] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    communityChatApi.list()
      .then((res) => {
        if (!cancelled) setMessages(res.data?.messages || []);
      })
      .catch((err) => toast.error(describeSendError(err) || 'تعذّر تحميل الدردشة.'))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [toast]);

  useEffect(() => {
    const echo = createEcho('user');
    if (!echo) {
      setRealtimeOk(false);
      return undefined;
    }

    setRealtimeOk(true);
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
      toast.error(describeSendError(err));
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
        <CardHeader
          title="المحادثة الحية"
          subtitle={
            realtimeOk === false
              ? 'الإرسال عبر HTTP متاح. التحديث الفوري يحتاج إعداد Reverb على السيرفر.'
              : 'الرسائل تظهر فوراً عند تشغيل Reverb'
          }
          action={
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
              realtimeOk === false
                ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200'
                : 'badge-good'
            }`}
            >
              {realtimeOk === false ? <WifiOff size={13} /> : <MessageCircle size={13} />}
              {realtimeOk === false ? 'بدون تحديث فوري' : 'مجتمع HumaScale'}
            </span>
          }
        />
        <CardBody>
          <div className="mb-4 max-h-[55vh] space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4 dark:bg-slate-950/40">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">ابدأ المحادثة — كن أول من يكتب رسالة للمجتمع.</p>
            )}
            {messages.map((message) => {
              const mine = !message.is_admin && message.user_id === user?.id;
              return (
                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                      message.is_admin
                        ? 'bg-amber-50 text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-100'
                        : mine
                          ? 'bg-brand-600 text-white'
                          : 'bg-white text-slate-700 ring-1 ring-slate-100 dark:bg-slate-900 dark:text-slate-200'
                    }`}
                  >
                    <p className="mb-1 flex items-center gap-1 text-[11px] font-bold opacity-80">
                      {message.is_admin && <Shield size={12} />}
                      {message.sender_name}
                    </p>
                    <p className="whitespace-pre-wrap break-words">{message.body}</p>
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
              autoComplete="off"
              name="community-message"
            />
            <Button type="submit" loading={sending} className="shrink-0" leftIcon={<Send size={16} />}>
              إرسال
            </Button>
          </form>
        </CardBody>
      </Card>
    </PageContainer>
  );
}
