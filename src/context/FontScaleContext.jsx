import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'endo-font-scale';

// 4 سطح: کوچک، عادی، بزرگ، خیلی بزرگ
const SCALES = [0.85, 1.0, 1.15, 1.3];
const DEFAULT_INDEX = 1;

const FontScaleContext = createContext(null);

function readInitial() {
  if (typeof window === 'undefined') return DEFAULT_INDEX;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return DEFAULT_INDEX;
    const idx = parseInt(raw, 10);
    if (Number.isInteger(idx) && idx >= 0 && idx < SCALES.length) return idx;
  } catch {
    /* noop */
  }
  return DEFAULT_INDEX;
}

export function FontScaleProvider({ children }) {
  const [index, setIndex] = useState(readInitial);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(index));
    } catch {
      /* noop */
    }
  }, [index]);

  const scale = SCALES[index];

  const increase = useCallback(() => {
    setIndex((i) => Math.min(SCALES.length - 1, i + 1));
  }, []);

  const decrease = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const reset = useCallback(() => setIndex(DEFAULT_INDEX), []);

  const value = useMemo(
    () => ({
      index,
      scale,
      increase,
      decrease,
      reset,
      canIncrease: index < SCALES.length - 1,
      canDecrease: index > 0,
      levels: SCALES.length,
    }),
    [index, scale, increase, decrease, reset]
  );

  return (
    <FontScaleContext.Provider value={value}>
      {children}
    </FontScaleContext.Provider>
  );
}

export function useFontScale() {
  const ctx = useContext(FontScaleContext);
  if (!ctx) throw new Error('useFontScale must be used within <FontScaleProvider>');
  return ctx;
}