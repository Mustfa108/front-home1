import clsx from 'clsx';
import { Check, X } from 'lucide-react';
import { LIKERT_SCALE } from '../../utils/constants';
import { useLanguage } from '../../contexts/LanguageContext';

export function QuestionCard({
  index,
  total,
  pillar,
  question,
  value,
  onChange,
  answerType = 'likert',
}) {
  const { locale, t } = useLanguage();
  const isYesNo = answerType === 'yes_no';

  return (
    <div className="card-padded animate-fade-in overflow-visible bg-gradient-to-br from-white via-white to-brand-50/40 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/30">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700 dark:bg-brand-950 dark:text-brand-200">
          {pillar}
        </span>
        <span className="text-slate-500">
          {t('assessment.questionOf', { n: index + 1, total })}
        </span>
      </div>
      <h2 className="text-xl font-bold text-slate-900 text-balance break-words dark:text-slate-50">
        {question}
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        {isYesNo
          ? (locale === 'en' ? 'Choose Yes or No' : 'اختر نعم أو لا')
          : t('assessment.likertHint')}
      </p>

      {isYesNo ? (
        <div className="mt-8 grid grid-cols-2 gap-4">
          {[
            { value: 5, labelAr: 'نعم', labelEn: 'Yes', color: '#16A34A', Icon: Check },
            { value: 1, labelAr: 'لا', labelEn: 'No', color: '#DC2626', Icon: X },
          ].map((opt) => {
            const selected = value === opt.value;
            const Icon = opt.Icon;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={clsx(
                  'group flex flex-col items-center justify-center rounded-3xl border-2 px-4 py-8 transition-all',
                  'hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                  selected
                    ? 'bg-white shadow-card ring-2 dark:bg-slate-900'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
                )}
                style={
                  selected
                    ? { borderColor: opt.color, boxShadow: `0 0 0 2px ${opt.color}33` }
                    : undefined
                }
              >
                <span
                  className="flex h-14 w-14 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: opt.color }}
                >
                  <Icon size={28} />
                </span>
                <span className="mt-3 text-lg font-bold text-slate-800 dark:text-slate-100">
                  {locale === 'en' ? opt.labelEn : opt.labelAr}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-5 gap-2 sm:gap-3">
          {LIKERT_SCALE.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(opt.value)}
                className={clsx(
                  'group flex flex-col items-center justify-center rounded-2xl border-2 p-3 transition-all',
                  'hover:-translate-y-0.5 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
                  selected
                    ? 'border-transparent bg-white shadow-card ring-2 dark:bg-slate-900'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900',
                )}
                style={
                  selected
                    ? {
                        borderColor: opt.color,
                        boxShadow: `0 0 0 2px ${opt.color}33`,
                      }
                    : undefined
                }
              >
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold text-white"
                  style={{ backgroundColor: opt.color }}
                >
                  {opt.value}
                </span>
                <span className="mt-2 text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
                  {locale === 'en' ? opt.labelEn : opt.labelAr}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
