import { Minus, Plus } from 'lucide-react';
import { useFontScale } from '../../context/FontScaleContext.jsx';

export default function FontSizeControl({ className = '' }) {
  const { increase, decrease, canIncrease, canDecrease } = useFontScale();

  return (
    <div
      role="group"
      aria-label="اندازه فونت"
      className={[
        'flex w-full items-center justify-between gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900',
        className,
      ].join(' ')}
    >
      <button
        type="button"
        onClick={decrease}
        disabled={!canDecrease}
        aria-label="کوچک‌تر کردن فونت"
        title="کوچک‌تر"
        className={[
          'inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors',
          canDecrease
            ? 'text-slate-600 hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800'
            : 'cursor-not-allowed text-slate-300 dark:text-slate-700',
        ].join(' ')}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      <span className="select-none text-xs font-medium text-slate-500 dark:text-slate-400">
        فونت
      </span>

      <button
        type="button"
        onClick={increase}
        disabled={!canIncrease}
        aria-label="بزرگ‌تر کردن فونت"
        title="بزرگ‌تر"
        className={[
          'inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors',
          canIncrease
            ? 'text-slate-600 hover:bg-slate-100 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800'
            : 'cursor-not-allowed text-slate-300 dark:text-slate-700',
        ].join(' ')}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}