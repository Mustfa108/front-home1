import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';

const STORAGE_KEY = 'humascale_splash_seen';

/**
 * Animated welcome splash — shown once per browser session.
 * Plays a logo + wordmark + tagline choreography, then slides away.
 * Respects prefers-reduced-motion via CSS in index.css.
 */
export default function SplashScreen() {
  const [phase, setPhase] = useState(() =>
    typeof window !== 'undefined' && sessionStorage.getItem(STORAGE_KEY)
      ? 'done'
      : 'enter',
  );

  useEffect(() => {
    if (phase !== 'enter') return undefined;

    const exitTimer = setTimeout(() => setPhase('exit'), 2400);
    const doneTimer = setTimeout(() => {
      setPhase('done');
      sessionStorage.setItem(STORAGE_KEY, '1');
    }, 3100);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [phase]);

  if (phase === 'done') return null;

  const exiting = phase === 'exit';

  return (
    <div
      aria-hidden={exiting}
      role="presentation"
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gradient-to-bl from-brand-950 via-brand-900 to-brand-950 ${
        exiting ? 'animate-splash-exit pointer-events-none' : ''
      }`}
    >
      {/* Ambient texture + glow orbs */}
      <div className="absolute inset-0 bg-noise opacity-40" />
      <div className="absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="absolute -bottom-24 left-1/4 h-96 w-96 rounded-full bg-brand-400/15 blur-3xl" />

      <div className="relative flex flex-col items-center px-6 text-center">
        {/* Pulsing rings + logo */}
        <div className="relative mb-7 flex h-24 w-24 items-center justify-center">
          <span className="absolute inset-0 rounded-3xl border border-white/50 animate-logo-ring" />
          <span
            className="absolute inset-0 rounded-3xl border border-white/30 animate-logo-ring"
            style={{ animationDelay: '0.5s' }}
          />
          <span className="flex h-20 w-20 animate-logo-pop items-center justify-center rounded-3xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-glow">
            <Activity size={38} strokeWidth={2.2} className="text-white" />
          </span>
        </div>

        {/* Wordmark */}
        <h1
          className="font-wordmark text-4xl font-semibold tracking-tight text-white sm:text-5xl"
          style={{
            animation: 'wordReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both',
          }}
        >
          Huma<span className="text-brand-300">Scale</span>
        </h1>

        {/* Tagline */}
        <p
          className="mt-4 max-w-sm text-sm leading-7 text-brand-100/90 sm:text-base"
          style={{
            animation: 'wordReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.65s both',
          }}
        >
          قيّم جاهزية فريقك للتوسع — نتائج فورية، خطة عمل مخصصة، وتحليل ذكي
        </p>

        {/* Loading bar */}
        <div
          className="mt-10 h-1 w-44 overflow-hidden rounded-full bg-white/15"
          style={{
            animation: 'fadeIn 0.5s ease-out 0.9s both',
          }}
        >
          <div className="h-full w-full origin-right rounded-full bg-gradient-to-l from-brand-300 to-white">
            <div className="splash-shimmer h-full w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
