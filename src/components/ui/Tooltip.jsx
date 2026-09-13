import clsx from 'clsx';
import { HelpCircle } from 'lucide-react';

/**
 * RTL-aware, dark/light friendly tooltip.
 * Shows on hover and keyboard focus. No external library.
 *
 * <Tooltip content="شرح مختصر">…anything…</Tooltip>
 */
const sideClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  start: 'end-full top-1/2 -translate-y-1/2 me-2',
  end: 'start-full top-1/2 -translate-y-1/2 ms-2',
};

export default function Tooltip({ content, side = 'top', children, className = '' }) {
  if (!content) return children;
  return (
    <span className={clsx('group/tt relative inline-flex', className)}>
      {children}
      <span
        role="tooltip"
        className={clsx(
          'pointer-events-none absolute z-50 w-max max-w-[17rem] whitespace-pre-line rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium leading-5 text-white opacity-0 shadow-xl transition-all duration-200 translate-y-1 group-hover/tt:translate-y-0 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100 group-focus-within/tt:translate-y-0 dark:bg-slate-700 dark:ring-1 dark:ring-slate-600',
          sideClasses[side] || sideClasses.top,
        )}
      >
        {content}
      </span>
    </span>
  );
}

/**
 * A small round help icon that explains the adjacent element.
 * <InfoTip content="الوزن يحدد أثر المحور في النتيجة النهائية" />
 */
export function InfoTip({ content, side = 'top', className = '', label = 'مساعدة' }) {
  return (
    <Tooltip content={content} side={side} className={className}>
      <button
        type="button"
        aria-label={label}
        className="cursor-help align-middle text-slate-400 transition-colors hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400"
      >
        <HelpCircle size={15} />
      </button>
    </Tooltip>
  );
}
