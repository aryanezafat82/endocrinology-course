// scripts/setup-endocrinology.js
// Usage: node scripts/setup-endocrinology.js
//
// پروژه‌ی هماتولوژی را به کورس غدد تبدیل می‌کند.
// رنگ‌ها همان rose باقی می‌مانند.
// از همه‌ی فایل‌های تغییر یافته بکاپ .bak گرفته می‌شود.

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ============================================================
//  CONFIG
// ============================================================
const CONFIG = {
  projectName: 'endocrinology-course',
  titleFa: 'غدد درون‌ریز',
  titleShortFa: 'غدد',
  descriptionFa: 'دوره آموزشی غدد درون‌ریز',
  themeColor: '#e11d48',           // ← همون رنگ قبلی
  viteBase: '/endocrinology-course/',
  iconName: 'FlaskConical',        // ← آیکون فلاسک آزمایشگاهی
  updateColors: false,             // ← رنگ‌ها عوض نمی‌شن
  updateStorageKeys: true,
  storagePrefix: 'endo',
};

// ============================================================
//  HELPERS
// ============================================================

const full = (rel) => path.join(ROOT, rel);
const exists = (rel) => fs.existsSync(full(rel));
const read = (rel) => fs.readFileSync(full(rel), 'utf8');
const write = (rel, content) => fs.writeFileSync(full(rel), content, 'utf8');

function backup(rel) {
  if (!exists(rel)) return;
  const bak = rel + '.bak';
  if (!fs.existsSync(full(bak))) {
    fs.copyFileSync(full(rel), full(bak));
  }
}

function replaceInFile(rel, replacements) {
  if (!exists(rel)) {
    console.log(`  ⚠️  ${rel} پیدا نشد`);
    return false;
  }
  let content = read(rel);
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    write(rel, content);
    console.log(`  ✅ ${rel}`);
  } else {
    console.log(`  ⏭️  ${rel} — تغییری لازم نبود`);
  }
  return changed;
}

async function confirm(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(message + ' (y/N) ', (a) => {
      rl.close();
      resolve(a.trim().toLowerCase() === 'y');
    });
  });
}

// ============================================================
//  STEPS
// ============================================================

const FILES_TO_BACKUP = [
  'package.json',
  'index.html',
  'public/manifest.webmanifest',
  'vite.config.js',
  'src/components/layout/Sidebar.jsx',
  'src/components/layout/Header.jsx',
  'public/assets/favicon.svg',
];

function stepBackup() {
  console.log('\n📦 مرحله ۱ — بکاپ‌گیری');
  for (const f of FILES_TO_BACKUP) backup(f);
  console.log(`  ✅ ${FILES_TO_BACKUP.length} فایل .bak`);
}

function stepPackageJson() {
  console.log('\n📝 مرحله ۲ — package.json');
  const pkg = JSON.parse(read('package.json'));
  pkg.name = CONFIG.projectName;
  write('package.json', JSON.stringify(pkg, null, 2) + '\n');
  console.log(`  ✅ name → ${CONFIG.projectName}`);
}

function stepIndexHtml() {
  console.log('\n📝 مرحله ۳ — index.html');
  replaceInFile('index.html', [
    ['<title>هماتولوژی — دوره آموزشی پزشکی</title>',
     `<title>${CONFIG.titleFa} — دوره آموزشی پزشکی</title>`],
    ['content="دوره آموزشی هماتولوژی — دانشگاه علوم پزشکی گیلان"',
     `content="${CONFIG.descriptionFa}"`],
    ['content="هماتولوژی"', `content="${CONFIG.titleShortFa}"`],
  ]);
}

function stepManifest() {
  console.log('\n📝 مرحله ۴ — manifest.webmanifest');
  if (!exists('public/manifest.webmanifest')) return;
  const manifest = JSON.parse(read('public/manifest.webmanifest'));
  manifest.name = `${CONFIG.titleFa} — دوره آموزشی`;
  manifest.short_name = CONFIG.titleShortFa;
  manifest.description = CONFIG.descriptionFa;
  write('public/manifest.webmanifest', JSON.stringify(manifest, null, 2) + '\n');
  console.log('  ✅ name، short_name، description');
}

function stepViteConfig() {
  console.log('\n📝 مرحله ۵ — vite.config.js');
  replaceInFile('vite.config.js', [
    [`base: '/hematology-course/'`, `base: '${CONFIG.viteBase}'`],
  ]);
}

function stepBranding() {
  console.log('\n📝 مرحله ۶ — Sidebar و Header (نام + آیکون)');
  const files = [
    'src/components/layout/Sidebar.jsx',
    'src/components/layout/Header.jsx',
  ];
  for (const f of files) {
    if (!exists(f)) continue;
    let content = read(f);

    // نام برند (فقط در متن JSX، نه در import)
    content = content.replace(
      /(>\s*)هماتولوژی(\s*<)/g,
      `$1${CONFIG.titleShortFa}$2`
    );

    // آیکون: Droplet → آیکون جدید
    if (CONFIG.iconName && CONFIG.iconName !== 'Droplet') {
      content = content.replace(/\bDroplet\b/g, CONFIG.iconName);
    }

    write(f, content);
    console.log(`  ✅ ${f}`);
  }
}

function stepFavicon() {
  console.log('\n📝 مرحله ۷ — favicon.svg (فلاسک)');
  if (!exists('public/assets/favicon.svg')) return;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="${CONFIG.themeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M10 2v7.31"/>
  <path d="M14 9.3V1.99"/>
  <path d="M8.5 2h7"/>
  <path d="M14 9.3a6.5 6.5 0 1 1-4 0"/>
  <path d="M5.52 16h12.96"/>
</svg>
`;
  write('public/assets/favicon.svg', svg);
  console.log(`  ✅ favicon جدید (فلاسک)`);
}

function stepStorageKeys() {
  if (!CONFIG.updateStorageKeys) return;
  console.log(`\n🔑 مرحله ۸ — کلیدهای localStorage`);
  console.log(`   hematology- → ${CONFIG.storagePrefix}-`);

  const contextFiles = [
    'src/context/ProgressContext.jsx',
    'src/context/HardPointsContext.jsx',
    'src/context/ReviewContext.jsx',
    'src/context/ThemeContext.jsx',
    'src/context/FontScaleContext.jsx',
    'src/context/NotesContext.jsx',
    'src/context/SamplePreferencesContext.jsx',
    'src/context/OnboardingContext.jsx',
  ];

  let count = 0;
  for (const f of contextFiles) {
    if (!exists(f)) continue;
    let content = read(f);
    if (content.includes('hematology-')) {
      backup(f);
      content = content.split('hematology-').join(`${CONFIG.storagePrefix}-`);
      write(f, content);
      count++;
      console.log(`  ✅ ${f}`);
    }
  }
  if (count === 0) console.log('  ⏭️  چیزی برای تغییر نبود');
}

// ============================================================
//  MAIN
// ============================================================

async function main() {
  console.log('🚀 تبدیل پروژه هماتولوژی به کورس غدد');
  console.log(`   پوشه: ${ROOT}`);
  console.log('');
  console.log('   تنظیمات:');
  console.log(`   • نام پروژه:   ${CONFIG.projectName}`);
  console.log(`   • عنوان:        ${CONFIG.titleFa}`);
  console.log(`   • آیکون:        ${CONFIG.iconName}`);
  console.log(`   • رنگ:          دست‌نخورده (rose)`);
  console.log(`   • storage:      hematology- → ${CONFIG.storagePrefix}-`);
  console.log(`   • base:         ${CONFIG.viteBase}`);
  console.log('');

  const ok = await confirm('ادامه می‌دهی؟');
  if (!ok) {
    console.log('لغو شد.');
    return;
  }

  stepBackup();
  stepPackageJson();
  stepIndexHtml();
  stepManifest();
  stepViteConfig();
  stepBranding();
  stepFavicon();
  stepStorageKeys();

  console.log('\n✨ تمام!');
  console.log('');
  console.log('📋 قدم‌های بعدی:');
  console.log('   1. rm -rf node_modules/.vite');
  console.log('   2. rm src/data/sessions/session-*.json');
  console.log('   3. rm src/data/sample-questions/*.json');
  console.log('   4. course.json و index.json را خالی کن');
  console.log('   5. npm run dev');
  console.log('');
  console.log('💡 اگه آیکون رو دوست نداری، CONFIG.iconName رو عوض کن:');
  console.log('   گزینه‌ها: FlaskConical، Microscope، Dna، Atom، Gauge،');
  console.log('              Zap، Target، Waves، Activity، Stethoscope');
  console.log('');
}

main().catch((err) => {
  console.error('❌ خطا:', err);
  process.exit(1);
});