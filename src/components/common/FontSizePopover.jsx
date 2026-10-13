import { useEffect, useRef, useState } from 'react';
import { Type } from 'lucide-react';
import FontSizeControl from './FontSizeControl.jsx';

/**
 * آیکون کوچک که با کلیک، یه پاپ‌اور باز می‌کنه و کنترل فونت داخلشه.
 * برای موبایل استفاده می‌شه (کنار ThemeToggle در Header).
 */
export default function FontSizePopover() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="اندازه فونت"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="اندازه فونت"
        className={[
          'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150 active:scale-95',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500',
          open
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
        ].join(' ')}
      >
        <Type className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="اندازه فونت"
          className="absolute top-full left-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg animate-fade-in dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="mb-1.5 px-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            اندازه فونت
          </p>
          <FontSizeControl />
        </div>
      )}
    </div>
  );
}