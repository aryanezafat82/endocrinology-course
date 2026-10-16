import { useMemo } from 'react';
import { Copy, AlertTriangle } from 'lucide-react';
import { getDuplicateInfo } from '../../utils/duplicateDetector.js';

export default function DuplicateBadge({ question }) {
  const info = useMemo(
    () => getDuplicateInfo(question?.examId, question?.id),
    [question?.examId, question?.id]
  );

  if (!info) return null;
  if (!info.isFirst && !info.isDuplicate) return null;

  if (info.isFirst) {
    // این سوال قدیمی‌ترین نسخه است
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:border-violet-800/60 dark:bg-violet-950/40 dark:text-violet-300"
        title={info.duplicates
          .map((d) => d.examLabel)
          .join(' • ')}
      >
        <Copy className="h-3 w-3" />
        {info.count} بار تکرار شده
      </span>
    );
  }

  // این سوال تکراری است
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300"
      title={`اولین بار در ${info.firstExamLabel}`}
    >
      <AlertTriangle className="h-3 w-3" />
      تکراری — اولین بار در {info.firstExamLabel}
    </span>
  );
}