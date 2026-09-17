import { CheckCircle2, Circle } from 'lucide-react';
import clsx from 'clsx';
import { pickLocale } from '../../utils/locale';

export function AssessmentProgress({ pillars = [], answers = {}, locale = 'ar' }) {
  const totalQuestions = pillars.reduce(
    (acc, p) => acc + (p.questions?.length || 0),
    0,
  );
  const answered = Object.keys(answers).filter((k) => answers[k] != null).length;
  const percent = totalQuestions
    ? Math.round((answered / totalQuestions) * 100)
    : 0;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-200">تقدم التقييم</span>
        <span className="font-bold text-brand-700 dark:text-brand-300">{percent}٪</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div
          className="h-full rounded-full bg-gradient-to-l from-brand-500 to-brand-700 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {answered} من {totalQuestions} سؤال تمت الإجابة عليه
      </p>

      <ul className="mt-4 space-y-2">
        {pillars.map((p) => {
          const total = p.questions?.length || 0;
          const done = (p.questions || []).filter(
            (q) => answers[q.id] != null,
          ).length;
          const complete = total > 0 && done === total;
          return (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-800"
            >
              <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                {complete ? (
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle size={16} className="text-slate-300 dark:text-slate-500" />
                )}
                {pickLocale(p, 'name', locale)}
              </span>
              <span
                className={clsx(
                  'text-xs font-semibold',
                  complete ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400',
                )}
              >
                {done}/{total}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
