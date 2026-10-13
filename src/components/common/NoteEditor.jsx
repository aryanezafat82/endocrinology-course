import { useState, useRef, useEffect } from 'react';
import { Pencil, Trash2, Check, X, NotebookPen } from 'lucide-react';
import { useNotes } from '../../context/NotesContext.jsx';

export default function NoteEditor({ storageKey, className = '' }) {
  const { getNote, setNote, removeNote } = useNotes();
  const note = getNote(storageKey);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note ?? '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!editing) setDraft(note ?? '');
  }, [note, editing]);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  function handleStartEdit() {
    setDraft(note ?? '');
    setEditing(true);
  }

  function handleSave() {
    setNote(storageKey, draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft(note ?? '');
    setEditing(false);
  }

  function handleDelete() {
    const ok = window.confirm(
      'آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟'
    );
    if (!ok) return;
    removeNote(storageKey);
    setDraft('');
    setEditing(false);
  }

  // ---------- Editing (spans full width in grid) ----------
  if (editing) {
    return (
      <div
        dir="rtl"
        className={[
          'col-span-2 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/20',
          className,
        ].join(' ')}
      >
        <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-indigo-800 dark:text-indigo-300">
          <NotebookPen className="h-3.5 w-3.5" />
          یادداشت من
        </label>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          placeholder="یادداشت خود را اینجا بنویسید…"
          className="w-full resize-y rounded-lg border border-slate-200 bg-white p-2.5 text-sm leading-7 text-slate-800 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        />
        <div className="mt-2 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <X className="h-3.5 w-3.5" />
            لغو
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 dark:hover:bg-indigo-500"
          >
            <Check className="h-3.5 w-3.5" />
            ذخیره
          </button>
        </div>
      </div>
    );
  }

  // ---------- Note exists (spans full width) ----------
  if (note) {
    return (
      <div
        dir="rtl"
        className={[
          'col-span-2 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/20',
          className,
        ].join(' ')}
      >
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-indigo-800 dark:text-indigo-300">
            <NotebookPen className="h-3.5 w-3.5" />
            یادداشت من
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleStartEdit}
              aria-label="ویرایش یادداشت"
              title="ویرایش"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-indigo-700 transition-colors hover:bg-indigo-100 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              aria-label="حذف یادداشت"
              title="حذف"
              className="inline-flex h-6 w-6 items-center justify-center rounded-md text-rose-600 transition-colors hover:bg-rose-100 dark:text-rose-400 dark:hover:bg-rose-950/50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p className="whitespace-pre-line text-sm leading-7 text-slate-800 dark:text-slate-200">
          {note}
        </p>
      </div>
    );
  }

  // ---------- No note yet (compact, one grid cell) ----------
  return (
    <button
      type="button"
      onClick={handleStartEdit}
      className={[
        'flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/60 px-3 py-2.5 text-xs font-medium text-slate-500 transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300',
        className,
      ].join(' ')}
    >
      <NotebookPen className="h-3.5 w-3.5" />
      یادداشت
    </button>
  );
}