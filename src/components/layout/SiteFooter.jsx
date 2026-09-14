import { useEffect, useState } from 'react';
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Send,
  Twitter,
  Youtube,
} from 'lucide-react';
import { publicSettingsApi } from '../../api/community';

const ICONS = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  youtube: Youtube,
  telegram: Send,
};

const LABELS = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp',
  youtube: 'YouTube',
  telegram: 'Telegram',
};

export function SiteFooter({ className = '' }) {
  const [links, setLinks] = useState({});

  useEffect(() => {
    let cancelled = false;
    publicSettingsApi.socialLinks().then((res) => {
      if (!cancelled) setLinks(res?.data || res || {});
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const entries = Object.entries(links || {}).filter(([, url]) => !!url);

  return (
    <footer className={`mt-10 border-t border-slate-200/80 bg-white/70 py-8 dark:border-slate-800 dark:bg-slate-900/50 ${className}`}>
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:justify-between sm:text-right">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} HumaScale — للمساعدة تواصل معنا عبر المنصات التالية
        </p>
        {entries.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {entries.map(([key, url]) => {
              const Icon = ICONS[key] || MessageCircle;
              return (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  aria-label={LABELS[key] || key}
                >
                  <Icon size={14} />
                  {LABELS[key] || key}
                </a>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400">ستظهر روابط المساعدة هنا بعد ضبطها من لوحة التحكم</p>
        )}
      </div>
    </footer>
  );
}
