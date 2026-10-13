# فایل مشخصات کامل پروژه — نسخه به‌روز (`PROJECT_SPEC.md`)

# مشخصات فنی پروژه — Hematology Course

> یک پلتفرم آموزشی پزشکی تحت وب، مبتنی بر میکرولرنینگ با کارت، نمونه سوالات ادوار گذشته، سیستم مرور (Spaced Repetition)، یادداشت شخصی، تنظیم فونت، حالت تاریک، PWA و پشتیبانی کامل RTL فارسی.

این سند مرجع کامل معماری، داده، طراحی و رفتار پروژه است. با خواندن این فایل، یک توسعه‌دهنده یا هوش مصنوعی می‌تواند کل پروژه را از صفر بسازد یا آن را برای یک دوره‌ی آموزشی دیگر تطبیق دهد.

---

## فهرست

1. نمای کلی
2. تکنولوژی‌ها
3. ساختار پوشه‌ها
4. داده‌ها
   4.1. course.json
   4.2. session-XX.json
   4.3. index.json (نمونه سوالات)
   4.4. exam-XX.json (سوالات یک دوره)
   4.5. قواعد شناسه (ID)
   4.6. مارک‌آپ متن
5. لایه‌ی Loader
6. Contextها
7. localStorage
8. Routing
9. Layout و Navigation
10. سیستم کارت
11. سیستم سوالات
12. RichText
13. سیستم یادداشت (Notes)
14. سیستم اندازه فونت (FontScale)
15. سیستم پیشرفت (Progress)
16. نکات سخت (HardPoints)
17. آزمون (Quiz)
18. سیستم مرور (Review)
19. Onboarding
20. حالت تاریک
21. PWA
22. Swipe Navigation
23. کامپوننت‌های مشترک
24. سیستم طراحی
25. انیمیشن‌ها
26. اسکریپت‌های کمکی
27. قواعد افزودن محتوای جدید
28. راهنمای تطبیق برای دوره‌ی دیگر

---

## ۱. نمای کلی

**نام پروژه:** Hematology Course  
**نوع:** Single-Page Application (SPA)  
**موضوع:** دوره‌ی هماتولوژی پزشکی با ۱۶ جلسه + نمونه سوالات ادوار گذشته  
**زبان:** فارسی (RTL)  
**دسترسی:** آفلاین-پسند (PWA) با ذخیره‌سازی محلی

### معماری داده (سلسله مراتبی)

```
Course
 └── Session (جلسه)
      └── Section (بخش)
           └── Card (کارت)
                ├── info       (متن آموزشی)
                ├── key_point  (نکته کلیدی)
                ├── table      (جدول)
                ├── flashcard  (فلش‌کارت)
                └── quiz       (سؤال چهارگزینه‌ای)

Sample Questions (مستقل از دوره اصلی)
 └── Exam (دوره امتحانی: بهمن ۱۴۰۰، مهر ۹۸، ...)
      └── Question (سوال)
           ├── mcq           (چهارگزینه‌ای)
           └── short_answer  (کوتاه‌پاسخ)
```

### مفاهیم بنیادی

پروژه **شش سیستم مستقل** دارد که هر کدام کلید localStorage جداگانه دارند و **هرگز با هم مخلوط نمی‌شوند**:

1. **Progress** — کدام بخش‌ها تکمیل شده‌اند.
2. **Hard Points** — کدام کارت‌ها و سوالات را کاربر دستی «سخت» علامت زده.
3. **Review** — کدام کارت‌ها و سوالات چه زمانی باید دوباره مرور شوند.
4. **Notes** — یادداشت‌های شخصی روی هر کارت و سوال.
5. **FontScale** — اندازه‌ی فونت انتخاب‌شده توسط کاربر.
6. **Sample Preferences** — تنظیمات نمایش پاسخ در بخش نمونه سوالات.

به‌علاوه دو سیستم فرعی:
- **Theme** — حالت روشن/تاریک
- **Onboarding** — آموزش‌هایی که کاربر دیده

---

## ۲. تکنولوژی‌ها

| ابزار | نسخه | هدف |
|---|---|---|
| **React** | ^18.3 | UI library |
| **Vite** | ^6.0 | Build tool + Dev server |
| **JavaScript** | ES2022+ | (بدون TypeScript) |
| **Tailwind CSS** | ^4.0 (با `@tailwindcss/vite`) | Styling |
| **React Router** | ^6.28 | Client-side routing — از `HashRouter` استفاده می‌شود |
| **Lucide React** | ^0.469 | Icon set |
| **Vazirmatn** | Google Fonts | فونت فارسی |

**بدون:** TypeScript، Redux/Zustand، Backend، Database، Authentication، UI Kit.

### `package.json`

```json
{
  "name": "hematology-course",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.469.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "^4.0.0",
    "vite": "^6.0.7"
  }
}
```

### `vite.config.js`

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/hematology-course/',  // برای GitHub Pages
});
```

### `index.html` — نکات مهم

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#e11d48" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <link rel="apple-touch-icon" href="/assets/favicon.svg" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <!-- فونت -->
    <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**مهم:** هیچ‌وقت `user-scalable=no` یا `maximum-scale=1` استفاده نکن (هم بد است و هم استاندارد نیست).

---

## ۳. ساختار پوشه‌ها

```
hematology-course/
├── docs/
│   └── review-system.md
├── public/
│   ├── assets/
│   │   └── favicon.svg
│   ├── manifest.webmanifest
│   └── sw.js
├── scripts/
│   ├── break-sentences.js
│   └── enrich-json.js
├── src/
│   ├── components/
│   │   ├── cards/
│   │   │   ├── CardRenderer.jsx
│   │   │   ├── CardWrapper.jsx
│   │   │   ├── InfoCard.jsx
│   │   │   ├── KeyPointCard.jsx
│   │   │   ├── TableCard.jsx
│   │   │   ├── Flashcard.jsx
│   │   │   └── QuizCard.jsx
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── CardTransition.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── FontSizeControl.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── NoteEditor.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── RichText.jsx
│   │   │   └── ThemeToggle.jsx
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── BottomNav.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── onboarding/
│   │   │   ├── InstallPrompt.jsx
│   │   │   ├── SampleQuestionsGuide.jsx
│   │   │   ├── SwipeTutorial.jsx
│   │   │   └── WelcomeTour.jsx
│   │   ├── questions/
│   │   │   └── QuestionCard.jsx
│   │   ├── quiz/
│   │   │   ├── QuizProgress.jsx
│   │   │   ├── QuizResults.jsx
│   │   │   └── WrongAnswerReview.jsx
│   │   └── review/
│   │       ├── ReviewCard.jsx
│   │       ├── ReviewGuide.jsx
│   │       ├── ReviewProgress.jsx
│   │       ├── ReviewRating.jsx
│   │       └── ReviewSummary.jsx
│   ├── context/
│   │   ├── FontScaleContext.jsx
│   │   ├── HardPointsContext.jsx
│   │   ├── NotesContext.jsx
│   │   ├── OnboardingContext.jsx
│   │   ├── ProgressContext.jsx
│   │   ├── ReviewContext.jsx
│   │   ├── SamplePreferencesContext.jsx
│   │   ├── SectionSessionContext.jsx
│   │   └── ThemeContext.jsx
│   ├── data/
│   │   ├── course.json
│   │   ├── loaders.js
│   │   ├── sampleQuestionsLoader.js
│   │   ├── sample-questions/
│   │   │   ├── index.json
│   │   │   ├── bahman-1401.json
│   │   │   ├── bahman-1400.json
│   │   │   └── ...
│   │   └── sessions/
│   │       ├── session-01.json
│   │       └── ... (session-16.json)
│   ├── pages/
│   │   ├── HardPoints.jsx
│   │   ├── Home.jsx
│   │   ├── NotFound.jsx
│   │   ├── Progress.jsx
│   │   ├── Review.jsx
│   │   ├── SampleExam.jsx
│   │   ├── SampleQuestions.jsx
│   │   ├── SampleSession.jsx
│   │   ├── Section.jsx
│   │   ├── Session.jsx
│   │   └── Sessions.jsx
│   ├── router/
│   │   └── AppRouter.jsx
│   ├── styles/
│   │   └── index.css
│   ├── utils/
│   │   └── reviewUtils.js
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── PROJECT_SPEC.md
```

---

## ۴. داده‌ها

### ۴.۱. `src/data/course.json`

فقط نقش **index** دارد؛ متن‌های واقعی از فایل هر جلسه خوانده می‌شود.

```json
{
  "title": "هماتولوژی",
  "description": "دوره آموزشی هماتولوژی",
  "sessions": [
    { "id": "session-01", "title": "جلسه ۱", "file": "session-01.json" },
    { "id": "session-02", "title": "جلسه ۲", "file": "session-02.json" }
  ]
}
```

### ۴.۲. `src/data/sessions/session-XX.json`

```json
{
  "session": {
    "id": "session-01",
    "title": "اصول درمان سرطان",
    "description": "توضیح مختصر",
    "sections": [
      {
        "id": "section-01",
        "title": "مفاهیم پایه",
        "description": "توضیح بخش",
        "cards": [
          // 5 نوع کارت زیر
        ]
      }
    ]
  }
}
```

**انواع کارت:**

`info` / `key_point`:
```json
{
  "id": "session-01-section-01-card-01",
  "type": "info",
  "title": "عنوان",
  "content": "متن...\nخط دوم..."
}
```

`table`:
```json
{
  "id": "...",
  "type": "table",
  "title": "جدول",
  "columns": ["ستون ۱", "ستون ۲"],
  "rows": [["a", "b"], ["c", "d"]]
}
```

`flashcard`:
```json
{
  "id": "...",
  "type": "flashcard",
  "question": "سؤال؟",
  "answer": "پاسخ"
}
```

`quiz`:
```json
{
  "id": "...",
  "type": "quiz",
  "question": "سؤال؟",
  "options": ["الف", "ب", "ج", "د"],
  "correctAnswer": 1,
  "explanation": "توضیح"
}
```

`correctAnswer` **صفر-مبناست** (۰ = گزینه اول).

### ۴.۳. `src/data/sample-questions/index.json`

فهرست دوره‌های امتحانی.

```json
{
  "title": "نمونه سوالات",
  "description": "سوالات امتحانی ادوار گذشته",
  "exams": [
    {
      "id": "bahman-1401",
      "label": "بهمن ۱۴۰۱",
      "file": "bahman-1401.json",
      "questionCount": 40
    }
  ]
}
```

### ۴.۴. `src/data/sample-questions/[examId].json`

```json
{
  "exam": {
    "id": "bahman-1401",
    "label": "بهمن ۱۴۰۱",
    "sourceFile": "بهمن 1401.txt",
    "questionCount": 40,
    "questions": [
      {
        "id": "bahman-1401-q-01",
        "type": "short_answer",
        "question": "متن سوال",
        "answerText": "پاسخ کوتاه",
        "explanation": "توضیح",
        "sessionId": "session-04",
        "confidence": "high",
        "flags": {
          "hasIncompleteOptions": false,
          "requiresImage": false,
          "isDuplicate": false,
          "fileAnswerStatus": "correct"
        }
      },
      {
        "id": "bahman-1401-q-02",
        "type": "mcq",
        "question": "سوال چهارگزینه‌ای",
        "options": ["الف", "ب", "ج", "د"],
        "correctAnswer": 2,
        "explanation": "توضیح",
        "sessionId": "session-03",
        "confidence": "high",
        "flags": { /* ... */ }
      }
    ]
  }
}
```

**مقادیر `sessionId`:** `session-01` تا `session-16` یا `unknown`
**مقادیر `confidence`:** `high` / `medium` / `low`
**مقادیر `fileAnswerStatus`:** `correct` / `incorrect` / `uncertain` / `unanswered`

### ۴.۵. قواعد شناسه (ID)

- `session.id` = `session-XX`
- `section.id` = `section-YY` (منحصربه‌فرد در یک جلسه)
- `card.id` = `session-XX-section-YY-card-ZZ`
- `exam.id` = مثل `bahman-1401` (حروف کوچک لاتین + خط تیره)
- `question.id` = `{examId}-q-{شماره}` (مثل `bahman-1401-q-01`)

**⚠️ باگ رایج:** `card.id` رو با پیشوند `section-` ننویس (باید `session-` باشه).

### ۴.۶. مارک‌آپ متن

در `content`، `title`، `question`، `answer`، `explanation`، `options`، سلول‌های جدول:

| علامت | نتیجه |
|---|---|
| `**text**` | **بولد** |
| `==text==` | پس‌زمینه صورتی (کلمات کلیدی) |
| `++text++` | سبز (اعداد و مقادیر) |
| `@@text@@` | کهربایی (هشدارها) |
| `\n` | خط جدید |
| `\n\n` | پاراگراف جدید |

**نکته:** در عنوان‌ها از `<RichText as="span" />` استفاده می‌شود چون `<h1>` فقط فرزند inline قبول می‌کند.

---

## ۵. لایه‌ی Loader

### `src/data/loaders.js` (جلسات اصلی)

```js
import courseData from './course.json';

const sessionModules = import.meta.glob('./sessions/*.json', { eager: true });

export function getCourse() {
  return courseData;
}

export function getSessions() {
  return courseData.sessions ?? [];
}

export function getSessionMeta(sessionId) {
  return getSessions().find((s) => s.id === sessionId) ?? null;
}

export function getSessionData(sessionId) {
  const meta = getSessionMeta(sessionId);
  if (!meta) return null;
  const mod = sessionModules[`./sessions/${meta.file}`];
  if (!mod) return null;
  const raw = mod.default ?? mod;
  return raw.session ?? raw;
}

export function getSection(sessionId, sectionId) {
  const data = getSessionData(sessionId);
  if (!data) return null;
  return data.sections?.find((s) => s.id === sectionId) ?? null;
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__loaders = { getCourse, getSessions, getSessionMeta, getSessionData, getSection };
}
```

### `src/data/sampleQuestionsLoader.js` (سوالات)

```js
import indexData from './sample-questions/index.json';

const examModules = import.meta.glob('./sample-questions/*.json', { eager: true });

export function getSampleIndex() { return indexData; }
export function getExams() { return indexData.exams ?? []; }

export function getExamMeta(examId) {
  return getExams().find((e) => e.id === examId) ?? null;
}

export function getExamData(examId) {
  const meta = getExamMeta(examId);
  if (!meta) return null;
  const mod = examModules[`./sample-questions/${meta.file}`];
  if (!mod) return null;
  const raw = mod.default ?? mod;
  return raw.exam ?? raw;
}

export function getAllQuestions() {
  const all = [];
  for (const meta of getExams()) {
    const exam = getExamData(meta.id);
    if (!exam) continue;
    for (const q of exam.questions ?? []) {
      all.push({ ...q, examId: meta.id, examLabel: meta.label });
    }
  }
  return all;
}

export function getQuestionsBySession(sessionId) {
  return getAllQuestions().filter((q) => q.sessionId === sessionId);
}

export function getQuestionsCountBySession() {
  const counts = {};
  for (const q of getAllQuestions()) {
    const sid = q.sessionId || 'unknown';
    counts[sid] = (counts[sid] || 0) + 1;
  }
  return counts;
}

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__sampleLoaders = {
    getSampleIndex, getExams, getExamMeta, getExamData,
    getAllQuestions, getQuestionsBySession, getQuestionsCountBySession,
  };
}
```

**نکته:** `import.meta.glob` در dev کش می‌کند؛ بعد از افزودن فایل JSON جدید، سرور را ری‌استارت کن.

---

## ۶. Contextها

**۹ Context** در `src/context/` وجود دارد. ترتیب wrap در `main.jsx`:

```jsx
<OnboardingProvider>          ← بیرونی‌ترین
  <ThemeProvider>
    <FontScaleProvider>
      <SamplePreferencesProvider>
        <NotesProvider>
          <ProgressProvider>
            <HardPointsProvider>
              <ReviewProvider>
                <App />        ← داخلی‌ترین
              </ReviewProvider>
            </HardPointsProvider>
          </ProgressProvider>
        </NotesProvider>
      </SamplePreferencesProvider>
    </FontScaleProvider>
  </ThemeProvider>
</OnboardingProvider>
```

### ۶.۱. `ProgressContext`

**کلید:** `hematology-progress`

**ساختار:**
```json
{
  "completedSections": ["session-01/section-01"],
  "lastStudied": { "sessionId": "session-01", "sectionId": "section-02" }
}
```

**API:** `isSectionCompleted`, `completeSection`, `setLastStudied`, `getLastStudied`, `getSessionProgress`, `getOverallProgress`, `getCompletedSessionsCount`, `resetProgress`

### ۶.۲. `HardPointsContext`

**کلید:** `hematology-hard-points`

**ساختار:**
```json
{
  "session-01/section-02/card-05": { "kind": "card", "sessionId": "...", "sectionId": "...", "cardId": "..." },
  "__q__/bahman-1401/bahman-1401-q-24": { "kind": "question", "examId": "...", "questionId": "..." }
}
```

**API کارت‌ها:** `isHardPoint`, `toggleHardPoint`, `removeHardPoint`
**API سوالات:** `isQuestionHardPoint`, `toggleQuestionHardPoint`, `removeQuestionHardPoint`
**API مشترک:** `getHardPoints({ kind })`, `getHardPointCount({ kind })`, `clearHardPoints`

### ۶.۳. `ReviewContext`

**کلید:** `hematology-review`

**ساختار:**
```json
{
  "session-01/section-02/card-05": {
    "kind": "card",
    "sessionId": "session-01", "sectionId": "section-02", "cardId": "card-05",
    "status": "learning",
    "nextReviewAt": "2026-10-03T08:00:00.000Z",
    "interval": 1, "reviewCount": 0, "lastReviewedAt": null
  },
  "__q__/bahman-1401/bahman-1401-q-24": {
    "kind": "question",
    "examId": "bahman-1401", "questionId": "bahman-1401-q-24",
    "status": "learning",
    "nextReviewAt": "2026-10-03T08:00:00.000Z",
    "interval": 1, "reviewCount": 0, "lastReviewedAt": null
  }
}
```

**API کارت‌ها:** `isInReview`, `addToReview`, `removeFromReview`, `toggleReview`, `rateReview`
**API سوالات:** `isQuestionInReview`, `toggleQuestionReview`, `rateQuestionReview`
**API مشترک:** `getDueReviews({ kind })`, `getDueCount({ kind })`, `getOverdueCount({ kind })`, `getUpcomingCount({ kind })`, `getTotalCount({ kind })`, `getAllItems({ kind })`, `clearAll`

`kind` می‌تواند `'card'` / `'question'` / `'all'` (پیش‌فرض) باشد.

### ۶.۴. `ThemeContext`

**کلید:** `hematology-theme` (`"light"` یا `"dark"`)
**API:** `theme`, `setTheme`, `toggleTheme`, `isDark`

### ۶.۵. `FontScaleContext`

**کلید:** `hematology-font-scale` (`0` / `1` / `2` / `3`)
**سطوح:** `[0.85, 1.0, 1.15, 1.3]`
**API:** `index`, `scale`, `increase`, `decrease`, `reset`, `canIncrease`, `canDecrease`

### ۶.۶. `NotesContext`

**کلید:** `hematology-notes`

**ساختار:**
```json
{
  "session-01/section-03/card-02": "متن یادداشت",
  "__q__/bahman-1401/bahman-1401-q-24": "متن یادداشت"
}
```

**API:** `getNote(key)`, `hasNote(key)`, `setNote(key, text)`, `removeNote(key)`, `getCardNoteKey(s, sec, c)`, `getQuestionNoteKey(e, q)`, `getNotesCount`, `clearAll`

### ۶.۷. `SamplePreferencesContext`

**کلید:** `hematology-sample-show-answers` (`"true"` / `"false"`)
**API:** `showAnswersByDefault`, `setShowAnswersByDefault`

### ۶.۸. `OnboardingContext`

**کلید:** `hematology-onboarding`

**ساختار:**
```json
{
  "welcome-tour": true,
  "swipe-navigation": true,
  "install-prompt": true,
  "sample-questions-guide": true
}
```

**API:** `hasSeen(key)`, `markSeen(key)`, `reset(key?)`

### ۶.۹. `SectionSessionContext`

**در حافظه** (نه localStorage). با `key={sectionId}` در `Section.jsx` هر بار reset می‌شود.

**API:** `quizAnswers`, `submitQuizAnswer`, `getQuizAnswer`, `revealedFlashcards`, `markFlashcardRevealed`, `isFlashcardRevealed`, `getQuizStats`, `reset`

---

## ۷. localStorage

**هشت کلید اصلی:**

| کلید | Context | ساختار |
|---|---|---|
| `hematology-progress` | ProgressContext | `{ completedSections: [], lastStudied: {} }` |
| `hematology-hard-points` | HardPointsContext | `{ "key": { kind, ... } }` |
| `hematology-review` | ReviewContext | `{ "key": { kind, ..., nextReviewAt, interval } }` |
| `hematology-theme` | ThemeContext | `"light"` / `"dark"` |
| `hematology-font-scale` | FontScaleContext | `"0"` / `"1"` / `"2"` / `"3"` |
| `hematology-notes` | NotesContext | `{ "key": "متن یادداشت" }` |
| `hematology-sample-show-answers` | SamplePreferencesContext | `"true"` / `"false"` |
| `hematology-onboarding` | OnboardingContext | `{ "welcome-tour": true, ... }` |

**قواعد:**
- اگر JSON خراب باشد، هر Context با مقدار پیش‌فرض شروع می‌کند (بدون crash).
- هیچ داده‌ی آموزشی در localStorage کپی نمی‌شود.
- آیتم‌های orphan (اشاره به محتوای حذف‌شده) در محاسبات نادیده گرفته می‌شوند.

### کلید توسعه‌دهنده

`hematology-review-sim-day` — فقط برای شبیه‌سازی زمان در Console (نباید در production ایجاد شود).

---

## ۸. Routing

### `src/router/AppRouter.jsx`

```jsx
import { HashRouter, Routes, Route } from 'react-router-dom';
// ... imports

export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/session/:sessionId" element={<Session />} />
          <Route path="/session/:sessionId/section/:sectionId" element={<Section />} />
          <Route path="/hard-points" element={<HardPoints />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/review" element={<Review />} />
          <Route path="/sample-questions" element={<SampleQuestions />} />
          <Route path="/sample-questions/session/:sessionId" element={<SampleSession />} />
          <Route path="/sample-questions/exam/:examId" element={<SampleExam />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}
```

**چرا HashRouter؟** چون روی GitHub Pages با `base: '/hematology-course/'`، `BrowserRouter` با deep-link و refresh مشکل داره. `HashRouter` بدون هیچ تنظیم اضافی کار می‌کنه.

**Query params:**
- `/review?mode=hard` → فقط کارت‌ها/سوالات سخت سررسید
- `/session/X/section/Y?card=<cardId>` → پرش مستقیم به یک کارت

---

## ۹. Layout و Navigation

### `AppLayout.jsx`

```jsx
<div className="min-h-screen bg-slate-50 dark:bg-slate-950">
  <Sidebar />                     {/* دسکتاپ: راست، ثابت */}
  <div className="md:mr-64 flex min-h-screen flex-col">
    <Header />                    {/* موبایل: بالا */}
    <main className="flex-1 overflow-x-hidden pb-24 md:pb-10">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </main>
  </div>
  <BottomNav />                   {/* موبایل: پایین، ثابت */}
  <WelcomeTour />
  <InstallPrompt />
</div>
```

**نکته:** `overflow-x-hidden` روی `main` برای جلوگیری از zoom ناخواسته در موبایل.

### آیتم‌های Navigation (۶ مورد)

| Route | برچسب | Icon |
|---|---|---|
| `/` | خانه | `Home` |
| `/sessions` | جلسات | `BookOpen` |
| `/review` | مرور | `Repeat` |
| `/sample-questions` | سوالات | `HelpCircle` |
| `/hard-points` | نکات | `Star` |
| `/progress` | پیشرفت | `BarChart3` |

- **Sidebar (دسکتاپ):** همه‌ی ۶ + `ThemeToggle` در پایین
- **BottomNav (موبایل):** ۶ آیتم با `flex-1` (عرض مساوی) + `ThemeToggle` در Header

---

## ۱۰. سیستم کارت

### جریان رندر

```
<section.cards>
  ↓ map
<CardRenderer card sessionId sectionId />
  ↓ بر اساس card.type
<CardWrapper sessionId sectionId cardId>
  ├── کارت (InfoCard/KeyPointCard/TableCard/Flashcard/QuizCard)
  ├── دکمه‌های ⭐ سخت بود و 🔄 مرور (absolute top-left)
  └── NoteEditor + FontSizeControl (grid دو ستونه پایین)
```

### `CardRenderer.jsx`

Dispatcher مرکزی. اگر `card.type` ناشناخته بود، پیام «نوع کارت پشتیبانی نمی‌شود» نمایش می‌دهد.

### `CardWrapper.jsx`

- ⭐ سخت بود و 🔄 مرور در بالای کارت (absolute)
- محتوای کارت با `.card-text-scale` و `--font-scale` پیچیده شده
- در پایین: `<div className="grid grid-cols-2 gap-2">` شامل `NoteEditor` + `FontSizeControl`

### پنج کارت

| کامپوننت | props | رفتار |
|---|---|---|
| **InfoCard** | `{ card }` | `title` + `content` با RichText |
| **KeyPointCard** | `{ card }` | طراحی کهربایی + نوار کناری |
| **TableCard** | `{ card }` | جدول responsive با اسکرول افقی داخلی |
| **Flashcard** | `{ card }` | دکمه «نمایش پاسخ» + `animate-expand` |
| **QuizCard** | `{ card }` | انتخاب → «بررسی پاسخ» → نتیجه + توضیح |

---

## ۱۱. سیستم سوالات

### `QuestionCard.jsx`

کامپوننت مشترک برای نمایش سوال در همه‌ی صفحات (SampleExam، SampleSession، HardPoints، Review).

**props:**
- `question` — آبجکت سوال با `examId` و `examLabel` اضافه‌شده
- `showAnswerByDefault` — از `SamplePreferencesContext`
- `mode` — `'browse'` یا `'review'`
- `onRate` — فقط در حالت review

**ساختار:**
- **هدر:** badge نوع سوال + دوره + جلسه (راست) + دکمه‌های ⭐ و 🔄 (چپ، فقط در browse)
- **محتوا (scaled):** سوال + گزینه‌ها + دکمه بررسی/نمایش + پاسخ + توضیح + ارزیابی (در review)
- **پایین:** `grid grid-cols-2 gap-2` شامل `NoteEditor` + `FontSizeControl`

**رفتار MCQ:**
1. کاربر گزینه انتخاب می‌کند
2. دکمه «بررسی پاسخ» فعال می‌شود
3. بعد از submit: قفل، رنگ‌بندی، توضیح
4. در حالت review: سه دکمه ارزیابی ظاهر می‌شود

**رفتار short_answer:**
1. دکمه «نمایش پاسخ» → پاسخ + توضیح
2. در حالت review: سه دکمه ارزیابی

---

## ۱۲. RichText

### `src/components/common/RichText.jsx`

دو حالت:

- **Block (پیش‌فرض):** `<div>` با پاراگراف‌های جدا (برای `content`, `explanation`, `answer`)
- **Inline (`as="span"`):** بدون `<div>`, بدون `<p>` (برای `title`, `question`, سلول جدول)

```jsx
<RichText text={card.content} className="..." />
<RichText as="span" text={card.title} />
```

**تبدیل‌ها:** `**text**` → `<strong>`, `==text==` → rose bg, `++text++` → emerald, `@@text@@` → amber, `\n` → `<br>`, `\n\n` → پاراگراف جدید.

---

## ۱۳. سیستم یادداشت (Notes)

### `NotesContext.jsx`
- فقط در `localStorage` با کلید `hematology-notes`
- ساختار: `{ "uniqueKey": "متن یادداشت" }`
- یادداشت خالی خودکار حذف می‌شود (trim)

### `NoteEditor.jsx`

**سه حالت:**
1. **No note yet:** دکمه‌ی کوچیک «یادداشت» (نصف عرض در grid)
2. **Note exists:** نمایش یادداشت + دکمه‌های ویرایش و حذف (پهنای کامل `col-span-2`)
3. **Editing:** textarea + دکمه‌های ذخیره و لغو (پهنای کامل)

**کلیدهای storage:**
- کارت: `sessionId/sectionId/cardId`
- سوال: `__q__/examId/questionId`

**رفتار:**
- حذف با تأیید `window.confirm`
- `textarea` خودکار فوکوس می‌گیرد
- تغییرات در `useEffect` sync می‌شوند

### ویژگی‌ها
- مستقل از Progress، HardPoints، Review
- یادداشت‌ها در «پاک کردن پیشرفت» حذف نمی‌شوند
- در همه‌ی صفحاتی که CardRenderer یا QuestionCard دارن، خودکار ظاهر می‌شود

---

## ۱۴. سیستم اندازه فونت (FontScale)

### `FontScaleContext.jsx`
- **کلید:** `hematology-font-scale`
- **سطوح:** `[0.85, 1.0, 1.15, 1.3]` (۴ سطح)
- **پیش‌فرض:** index 1 (scale = 1.0)
- سراسری (نه per-card)

### `FontSizeControl.jsx`
- دکمه‌ی `-` (کوچک‌تر)
- متن «فونت» (نه آیکون T)
- دکمه‌ی `+` (بزرگ‌تر)
- در دسکتاپ با `flex-1`، در موبایل با `w-full`
- دکمه‌ها در انتها و ابتدا disabled می‌شوند

### مکانیزم اسکیل

در `src/styles/index.css`:

```css
.card-text-scale {
  --text-xs: 0.75em;
  --text-sm: 0.875em;
  --text-base: 1em;
  --text-lg: 1.125em;
  --text-xl: 1.25em;
  --text-2xl: 1.5em;
  --text-3xl: 1.875em;
  --text-4xl: 2.25em;
  font-size: calc(16px * var(--font-scale, 1));
}
```

در `CardWrapper` و `QuestionCard`:

```jsx
<div className="card-text-scale" style={{ '--font-scale': scale }}>
  {children}
</div>
```

**چرا `em`؟** چون نسبی است. اگر یه متن `text-xs` و یه متن `text-sm` داشته باشیم، با هر بار بزرگ‌کردن base، **هر دو به یه نسبت** بزرگ می‌شن و فاصله‌ی نسبی حفظ می‌شه.

**نکته:** `NoteEditor` و `FontSizeControl` **داخل** `.card-text-scale` نیستن (تا خودشون اسکیل نشن).

---

## ۱۵. سیستم پیشرفت (Progress)

### مبنا: تکمیل بخش
پیشرفت **فقط** بر اساس `completeSection` محاسبه می‌شود.

### محاسبه
- **جلسه:** `completed / total_of_session × 100`
- **کل دوره:** `total_completed / total_sections × 100`

### نمایش
- **Home:** درصد کل + جلسات کامل
- **Sessions:** Progress bar هر جلسه + بج «تکمیل شده»
- **Session:** Progress bar + وضعیت هر بخش
- **Progress:** داشبورد کامل + دکمه «پاک کردن پیشرفت» + لیست جلسات با نام کامل (`جلسه N — عنوان`)

### `lastStudied`
- هر بار ورود به یک Section معتبر، `setLastStudied` فراخوانی می‌شود
- در Home به‌عنوان «ادامه مطالعه»

### Reset
دکمه «پاک کردن پیشرفت» در Progress **همه‌ی سه سیستم** رو ریست می‌کند:
```js
resetProgress();
clearHardPoints();
clearAll();
```

**نکته:** Notes، FontScale، Theme و Onboarding **پاک نمی‌شن**.

---

## ۱۶. نکات سخت (HardPoints)

### دو تب
- **کارت‌ها:** استفاده از `CardRenderer` (کارت کامل + ⭐ + 🔄)
- **سوالات:** استفاده از `QuestionCard` (سوال کامل + ⭐ + 🔄)

### گروه‌بندی
- آکاردئون بر اساس جلسه (اولین جلسه باز)
- هر گروه شامل عنوان + تعداد + Chevron

### داخل گروه
- کارت: عنوان بخش بالا + `<CardRenderer>` کامل
- سوال: `<QuestionCard mode="browse">`

### حذف
- کاربر با زدن ⭐ روی کارت/سوال حذف می‌کند
- دکمه «حذف از نکات سخت» جداگانه **حذف شده**
- کارت‌های orphan (اشاره به محتوای حذف‌شده) پیام مناسب نشان می‌دهند

### «پاک کردن همه»
هر دو (کارت‌ها و سوالات) رو پاک می‌کند.

### توگل
«نمایش پاسخ‌ها از ابتدا» فقط در تب سوالات.

---

## ۱۷. آزمون (Quiz)

### Schema
```json
{
  "type": "quiz",
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "correctAnswer": 1,
  "explanation": "..."
}
```

### State
`SectionSessionContext` (فقط در حافظه). با خروج از Section reset می‌شود. **هیچ داده‌ای در localStorage ذخیره نمی‌شود**.

### جریان
1. کارت Quiz نمایش داده می‌شود
2. دکمه «بررسی پاسخ» فعال می‌شود
3. بعد از submit: قفل + رنگ‌بندی + explanation
4. `QuizProgress` بالای صفحه: «سوال X از Y»
5. پس از پایان: `QuizResults` با درصد + `WrongAnswerReview`

---

## ۱۸. سیستم مرور (Review)

### فلسفه
- فقط کارت‌ها/سوالاتی که کاربر دکمه «🔄 مرور» زده، وارد صف می‌شن
- تکمیل بخش خودکار چیزی اضافه نمی‌کند
- الگوریتم سبک (نه SM-2)

### بازه‌ها
```js
export const REVIEW_INTERVALS = [1, 3, 7, 14, 30];
```

### `computeNextInterval`
```js
function computeNextInterval(currentInterval, rating) {
  const base = Math.max(0, INTERVALS.indexOf(currentInterval));
  let nextIndex;
  if (rating === 'forgot') nextIndex = 0;
  else if (rating === 'partial') nextIndex = base + 1;
  else if (rating === 'easy') nextIndex = base + 2;
  else nextIndex = 0;
  return INTERVALS[Math.min(nextIndex, INTERVALS.length - 1)];
}
```

**جدول:**
| interval فعلی | یادم نبود | تا حدی | کاملاً |
|---|---|---|---|
| ۱ | ۱ | ۳ | ۷ |
| ۳ | ۱ | ۷ | ۱۴ |
| ۷ | ۱ | ۱۴ | ۳۰ |
| ۱۴ | ۱ | ۳۰ | ۳۰ |
| ۳۰ | ۱ | ۳۰ | ۳۰ |

### دو تب
- **کارت‌ها:** گروه‌بندی بر اساس جلسه
- **سوالات:** گروه‌بندی بر اساس جلسه

### حالت مرور
- کارت: `<ReviewCard>` با `mode="review"` و سه دکمه ارزیابی
- سوال: `<QuestionCard mode="review">` با سه دکمه ارزیابی

### حالت `?mode=hard`
فقط Hard Pointهای سررسید.

### `ReviewGuide`
راهنمای modal با ۷ مرحله (راهنما در تب هر دو یکسانه).

---

## ۱۹. Onboarding

### چهار کامپوننت مستقل

#### ۱۹.۱. `WelcomeTour.jsx`
- Modal، **۸ مرحله** (شامل نمونه سوالات)
- کلید: `welcome-tour`
- بعد از نیم‌ثانیه از ورود باز می‌شود

#### ۱۹.۲. `SwipeTutorial.jsx`
- اولین بار ورود به Section با ۲+ کارت
- کلید: `swipe-navigation`

#### ۱۹.۳. `InstallPrompt.jsx`
- iOS: راهنمای دستی
- Android: `beforeinstallprompt`
- کلید: `install-prompt`

#### ۱۹.۴. `SampleQuestionsGuide.jsx`
- **۷ مرحله** مخصوص بخش نمونه سوالات
- کلید: `sample-questions-guide`
- دکمه «متوجه شدم، دیگر نشان نده»

---

## ۲۰. حالت تاریک

- Tailwind v4 با `@custom-variant dark (&:where(.dark, .dark *))`
- کلاس `dark` روی `document.documentElement`
- ذخیره در `hematology-theme`
- اولین بار از `prefers-color-scheme` سیستم پیروی می‌کند
- `ThemeToggle.jsx` با دو variant: `icon` (Header موبایل)، `full` (Sidebar)

---

## ۲۱. PWA

### `public/manifest.webmanifest`
نام، آیکون، `theme_color: "#e11d48"`, `display: standalone`

### `public/sw.js`
- `skipWaiting` + `clients.claim`
- `CACHE_VERSION` برای invalidate کردن کش
- در `activate`: پاک کردن کش‌های قدیمی + پیام `SW_UPDATED` به کلاینت‌ها
- fetch handler: HTML با network-first، بقیه pass-through

### `main.jsx`
```js
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__deferredInstallPrompt = e;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
```

---

## ۲۲. Swipe Navigation

در `Section.jsx` با **Touch Events** (نه Pointer):

- Swipe راست (`dx > 0`) → کارت بعدی (RTL)
- Swipe چپ (`dx < 0`) → کارت قبلی
- روی دکمه‌ها/linkها: نادیده گرفته می‌شود
- روی جدول با `overflow-x: auto`: نادیده گرفته می‌شود
- عمودی: page scroll
- اگر `canProceed` false باشد و swipe کنه: `animate-shake`

`SWIPE_MIN_DISTANCE = 60`, `SWIPE_MAX_DURATION = 800`

---

## ۲۳. کامپوننت‌های مشترک

| کامپوننت | کار |
|---|---|
| `Button` | ۵ variant (`primary`, `secondary`, `outline`, `ghost`, `danger`)، ۳ size |
| `ProgressBar` | ۴ tone، ۳ size، transition نرم |
| `EmptyState` | آیکون + عنوان + توضیح + دکمه |
| `Loading` | اسپینر ساده |
| `CardTransition` | `animate-card-in` |
| `ThemeToggle` | دو variant |
| `RichText` | Block/Inline |
| `NoteEditor` | سیستم یادداشت |
| `FontSizeControl` | کنترل اندازه فونت |

---

## ۲۴. سیستم طراحی

### پالت

```css
--color-primary: #e11d48;         /* rose-600 */
--color-success: #059669;         /* emerald-600 */
--color-warning: #d97706;         /* amber-600 */
--color-error: #dc2626;
--color-hard: #d97706;            /* amber */
--color-review: #4f46e5;          /* indigo-600 */
```

### رنگ‌های معنایی

| رنگ | کاربرد |
|---|---|
| **Rose** | primary / کلیدواژه / بیماری‌ها |
| **Sky** | اطلاعات پایه (InfoCard) |
| **Amber** | نکات کلیدی / هشدار |
| **Violet** | جدول |
| **Emerald** | اعداد / پاسخ درست |
| **Indigo** | مرور / یادداشت |
| **Cyan** | نمونه سوالات |
| **Slate** | خنثی |

### Typography
- فونت **Vazirmatn** از Google Fonts
- `html, body { font-family: var(--font-sans); }`
- `p, li { line-height: 1.9; }`
- همیشه RTL: `<html lang="fa" dir="rtl">`

### Spacing
- کارت‌ها: `p-5 sm:p-6`
- صفحه: `max-w-4xl`, `px-4 sm:px-6 lg:px-8`
- بین کارت‌ها: `space-y-4`

### Mobile
- `touch-action: manipulation` روی همه‌ی `button`, `a`, `input`, `select`, `textarea`, `[role="button"]`, `[role="switch"]`
- `overflow-x-hidden` روی `main` و کانتینرهای اصلی
- `break-words` + `min-w-0` برای جلوگیری از overflow

---

## ۲۵. انیمیشن‌ها

| نام | مدت | کاربرد |
|---|---|---|
| `card-in` | 220ms | ورود کارت جدید |
| `pop-in` | 240ms | تیک تأیید، completion |
| `shake` | 320ms | پاسخ غلط Quiz |
| `fade-in` | 180ms | Empty state / modal |
| `expand-down` | 200ms | reveal فلش‌کارت |
| `swipe-hint-left/right` | 1.4s | آموزش swipe |

**همه با `prefers-reduced-motion` سازگارن.**

---

## ۲۶. اسکریپت‌های کمکی

### `scripts/break-sentences.js`
شکستن جمله‌ها به خطوط جدا (بعد از `.` `؟` `!` `;` `؛`). جلوگیری از شکستن اعداد اعشاری.

اجرا: `node scripts/break-sentences.js`

### `scripts/enrich-json.js`
افزودن `**bold**`, `==highlight==`, `++green++`, `@@warning@@` به JSON کارت‌ها.

**ترتیب اجرا:** `Bold → Highlight → Warning → Numbers`

**قبل از اجرا بکاپ بگیر:** `cp -r src/data/sessions src/data/sessions.bak`

### ابزارهای Console
`window.__loaders` و `window.__sampleLoaders` در dev mode در دسترس هستند.

---

## ۲۷. قواعد افزودن محتوای جدید

### افزودن جلسه‌ی جدید

1. فایل `session-XX.json` بساز
2. `session.id` = `session-XX`، `section.id` = `section-YY`، `card.id` = `session-XX-section-YY-card-ZZ`
3. در `course.json` یک رکورد اضافه کن
4. سرور را ری‌استارت کن

### افزودن دوره‌ی امتحانی جدید

1. فایل `[examId].json` بساز
2. `exam.id` = `[examId]`، `question.id` = `[examId]-q-NN`
3. در `sample-questions/index.json` یک رکورد اضافه کن
4. سرور را ری‌استارت کن

### قواعد طلایی
- ✅ از آخر اضافه کن، `id`های موجود را تغییر نده
- ❌ Rename کردن `session-01` → `session-A` (داده کاربران یتیم می‌شود)
- ❌ حذف بخشی که کاربر تکمیل کرده
- ✅ تغییر محتوای کارت با ویرایش درجا، نه حذف/بازسازی
- ✅ `card.id` هرگز تغییر نده (Hard Point/Review/Notes یتیم می‌شوند)

### افزودن کارت به بخش موجود
کارت را به `cards` اضافه کن. اگه فایل قبلاً بارگذاری شده، سرور را ری‌استارت کن.

---

## ۲۸. راهنمای تطبیق برای دوره‌ی دیگر

### قدم ۱: Fork پروژه
```bash
git clone <repo>
cd hematology-course
rm -rf .git node_modules/.vite
npm install
```

### قدم ۲: تغییر هویت

| فایل | تغییر |
|---|---|
| `package.json` | `name`, `version` |
| `index.html` | `<title>`, meta description |
| `src/data/course.json` | `title`, `description` |
| `public/manifest.webmanifest` | `name`, `short_name`, `theme_color` |
| `src/components/layout/Sidebar.jsx` | لوگو، نام |
| `src/components/layout/Header.jsx` | لوگو، نام |
| `src/pages/Home.jsx` | سازنده، دانشگاه، لینک تلگرام |
| `src/styles/index.css` | پالت رنگ (اختیاری) |

### قدم ۳: تغییر کلیدهای localStorage
```
hematology-progress         → [course]-progress
hematology-hard-points      → [course]-hard-points
hematology-review           → [course]-review
hematology-theme            → [course]-theme
hematology-font-scale       → [course]-font-scale
hematology-notes            → [course]-notes
hematology-sample-show-answers → [course]-sample-show-answers
hematology-onboarding       → [course]-onboarding
```

### قدم ۴: پاک کردن محتوای هماتولوژی
```bash
rm src/data/sessions/session-*.json
rm src/data/sample-questions/*.json
```

### قدم ۵: ساخت محتوای جدید
طبق بخش ۲۷.

### قدم ۶: تطبیق `scripts/enrich-json.js`
لیست‌های `BOLD_TERMS`, `HIGHLIGHT_TERMS`, `WARNING_PHRASES` را با اصطلاحات دوره‌ی جدید پر کن.

### قدم ۷: تطبیق مستر پرامپت AI
در پرامپت استخراج سوالات، جدول جلسات و کلمات کلیدی را با دوره‌ی جدید عوض کن.

### چیزهایی که تغییر نمی‌کنند
- معماری ۹ Context
- Routing و HashRouter
- سیستم Card و RichText
- الگوریتم Review
- Notes، FontScale، SamplePreferences
- Swipe Navigation
- Layout و Navigation
- PWA base
- اسکریپت‌های پایه

### چک‌لیست نهایی
```
[ ] package.json، index.html، manifest، course.json آپدیت
[ ] کلیدهای localStorage یکتا
[ ] session-XX.jsonهای جدید
[ ] card.idها با پیشوند session-XX-
[ ] sample-questions/index.json + exam-XX.json
[ ] enrich-json.js با اصطلاحات جدید
[ ] رنگ primary (اختیاری)
[ ] favicon و لوگو
[ ] نام برند در Sidebar/Header/Home
[ ] WelcomeTour و SampleQuestionsGuide متناسب
[ ] npm run dev بدون خطا
[ ] تست همه‌ی صفحات
```

---

## پیوست ۱: وابستگی فایل‌ها

```
main.jsx
 ├── OnboardingProvider ───→ hematology-onboarding
 ├── ThemeProvider ───────→ hematology-theme
 ├── FontScaleProvider ───→ hematology-font-scale
 ├── SamplePreferencesProvider → hematology-sample-show-answers
 ├── NotesProvider ───────→ hematology-notes
 ├── ProgressProvider ────→ hematology-progress
 ├── HardPointsProvider ──→ hematology-hard-points
 ├── ReviewProvider ──────→ hematology-review
 └── App.jsx
      └── AppRouter (HashRouter)
           └── AppLayout
                ├── Sidebar + Header + BottomNav + ThemeToggle
                ├── Outlet
                │    ├── Home
                │    ├── Sessions → Session → Section
                │    │    └── SectionSessionProvider
                │    │    └── CardRenderer → CardWrapper → 5 Card
                │    ├── HardPoints (تب کارت/سوال)
                │    ├── Progress
                │    ├── Review (تب کارت/سوال)
                │    ├── SampleQuestions → SampleSession / SampleExam
                │    │    └── QuestionCard (NoteEditor + FontSizeControl)
                │    └── NotFound
                ├── WelcomeTour
                ├── InstallPrompt
                └── (SampleQuestionsGuide داخل SampleQuestions)
```

---

## پیوست ۲: نکات بحرانی

1. **`main.jsx` ترتیب Providerها مهم است** — Onboarding بیرونی‌ترین، Review داخلی‌ترین.
2. **`SectionSessionProvider` با `key={sectionId}`** — reset بین بخش‌ها.
3. **`RichText` در کارت‌ها و سوالات الزامی است** — بدون آن `**` خام نمایش داده می‌شود.
4. **`em` نه `rem`** — برای `.card-text-scale` تا نسبت‌ها حفظ شوند.
5. **`HashRouter` نه `BrowserRouter`** — برای سازگاری با GitHub Pages.
6. **`overflow-x-hidden` روی `main` و کانتینرها** — جلوگیری از zoom.
7. **`import.meta.glob` کش می‌کند** — ری‌استارت سرور بعد از افزودن JSON.
8. **قبل از هر اسکریپت روی JSON، بکاپ بگیر.**
9. **`card.id` را هرگز تغییر نده** — Hard Point/Review/Notes یتیم می‌شوند.
10. **`course.json` فهرست است، نه منبع محتوا** — عنوان از `session-XX.json`.
11. **`sessionId` سوالات ممکن است `unknown` باشد** — بخش «سوالات بدون دسته» در SampleQuestions این را نمایش می‌دهد.
12. **iOS PWA کش می‌کند** — بعد از deploy، کاربران ممکن است نسخه‌ی قدیمی ببینند؛ راه‌حل: حذف و نصب مجدد PWA.

---

**پایان سند.**
```
