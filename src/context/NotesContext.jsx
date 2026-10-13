import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'endo-notes';
const QUESTION_PREFIX = '__q__';

const NotesContext = createContext(null);

function readInitial() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }
    const cleaned = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string' && value.trim().length > 0) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  } catch {
    return {};
  }
}

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      /* noop */
    }
  }, [notes]);

  const getNote = useCallback((key) => notes[key] ?? null, [notes]);

  const hasNote = useCallback((key) => Boolean(notes[key]), [notes]);

  const setNote = useCallback((key, text) => {
    if (typeof text !== 'string') return;
    const trimmed = text.trim();
    setNotes((prev) => {
      if (!trimmed) {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        return next;
      }
      if (prev[key] === trimmed) return prev;
      return { ...prev, [key]: trimmed };
    });
  }, []);

  const removeNote = useCallback((key) => {
    setNotes((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const getCardNoteKey = useCallback(
    (sessionId, sectionId, cardId) => `${sessionId}/${sectionId}/${cardId}`,
    []
  );

  const getQuestionNoteKey = useCallback(
    (examId, questionId) => `${QUESTION_PREFIX}/${examId}/${questionId}`,
    []
  );

  const getNotesCount = useCallback(() => Object.keys(notes).length, [notes]);

  const clearAll = useCallback(() => {
    setNotes({});
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo(
    () => ({
      getNote,
      hasNote,
      setNote,
      removeNote,
      getCardNoteKey,
      getQuestionNoteKey,
      getNotesCount,
      clearAll,
    }),
    [
      getNote,
      hasNote,
      setNote,
      removeNote,
      getCardNoteKey,
      getQuestionNoteKey,
      getNotesCount,
      clearAll,
    ]
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error('useNotes must be used within <NotesProvider>');
  return ctx;
}