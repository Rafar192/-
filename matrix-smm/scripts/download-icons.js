#!/usr/bin/env node
/**
 * Скачивает иконки соцсетей в src/assets/icons/
 * Запуск: node scripts/download-icons.js
 * Требует Node.js 18+
 */

import { writeFileSync, mkdirSync, existsSync, renameSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, '../src/assets/icons');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

// Список иконок: name = имя файла в assets/icons (без расширения)
// url = страница или прямая ссылка
// direct = true если url уже ссылка на картинку
// wikimedia = true если нужно использовать Special:FilePath
const ICONS = [
  // ── Wikimedia Commons (SVG через Special:FilePath) ──────────────
  { name: 'steam',    wikimedia: 'Steam_icon_logo.svg' },
  { name: 'pinterest',wikimedia: 'Pinterest.svg' },
  { name: 'medium',   wikimedia: 'Medium_logo_Monogram.svg' },
  { name: 'linkedin', wikimedia: 'LinkedIn_icon.svg' },
  { name: 'dzen',     wikimedia: 'Zen_logo_icon.svg' },
  { name: 'yappy',    wikimedia: 'Yappy_Icon.jpg' },
  { name: 'vk',       wikimedia: 'VK_Compact_Logo_(2021-present).svg' },
  { name: 'twitter',  wikimedia: 'X_logo.jpg' },
  { name: 'threads',  wikimedia: 'Threads_(app)_logo.svg' },

  // ── Прямая ссылка на картинку ────────────────────────────────────
  { name: 'dtf', direct: 'https://static.vecteezy.com/system/resources/previews/026/824/255/non_2x/dtf-logo-design-inspiration-for-a-unique-identity-modern-elegance-and-creative-design-watermark-your-success-with-the-striking-this-logo-vector.jpg' },

  // ── Страницы: берём og:image ──────────────────────────────────────
  { name: 'wibes',    page: 'https://wibes.en.uptodown.com/android' },
  { name: 'avito',    page: 'https://rskrf.ru/goods/avito-obyavleniya-ios/' },
  { name: 'vcru',     page: 'https://vc-ru.en.uptodown.com/android' },
  { name: 'ok',       page: 'https://logos-world.net/odnoklassniki-logo/' },
  { name: 'likee',    page: 'https://www.facebook.com/likeepakistani/' },
  { name: 'trovo',    page: 'https://trovo.live/' },
  { name: 'kick',     page: 'https://dashboardicons.com/icons/kick' },
  { name: 'spotify',  page: 'https://www.vecteezy.com/png/42148631-spotify-logo-spotify-social-media-icon' },
  { name: 'rutube',   page: 'https://png.klev.club/11722-rutub.html' },
  { name: 'facebook', page: 'https://www.vecteezy.com/png/18930698-facebook-logo-png-facebook-icon-transparent-png' },
  { name: 'twitch',   page: 'https://pl.freepik.com/darmowe-zdjecie-wektory/logo-twitch-szablon' },
  { name: 'max',      page: 'https://logo-teka.com/max/' },
  { name: 'instagram',page: 'https://www.magnific.com/pl/darmowe-zdjecie-wektory/logo-instagram' },
  { name: 'youtube',  page: 'https://www.magnific.com/pl/darmowe-zdjecie-wektory/logo-youtube' },
  { name: 'tiktok',   page: 'https://www.magnific.com/free-photos-vectors/tiktok-logo-png' },
  { name: 'shazam',   page: 'https://www.hiclipart.com/free-transparent-background-png-clipart-fvcex' },
];

// ──────────────────────────────────────────────────────────────────
async function fetchBinary(url) {
  const res = await fetch(url, { headers: HEADERS, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

async function fetchHtml(url) {
  const res = await fetch(url, { headers: HEADERS, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.text();
}

function extractImgUrl(html, baseUrl) {
  // 1. og:image
  const og = html.match(/property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
          || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (og) return og[1];

  // 2. twitter:image
  const tw = html.match(/name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i)
          || html.match(/content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
  if (tw) return tw[1];

  // 3. Первая крупная картинка на странице (png/jpg/svg)
  const imgs = [...html.matchAll(/<img[^>]+src=["']([^"']+\.(png|jpg|svg|webp)[^"']*)["']/gi)];
  for (const m of imgs) {
    const src = m[1];
    if (src.includes('logo') || src.includes('icon')) {
      return src.startsWith('http') ? src : new URL(src, baseUrl).href;
    }
  }

  throw new Error('Не нашёл картинку на странице');
}

function extFromUrl(url) {
  const m = url.match(/\.(svg|png|jpg|jpeg|webp)(\?|#|$)/i);
  return m ? m[1].toLowerCase() : 'png';
}

async function processIcon(icon) {
  try {
    let imgUrl, ext;

    if (icon.wikimedia) {
      imgUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(icon.wikimedia)}`;
      ext = extFromUrl(icon.wikimedia);
    } else if (icon.direct) {
      imgUrl = icon.direct;
      ext = extFromUrl(icon.direct);
    } else {
      process.stdout.write(`  [${icon.name}] Открываю страницу... `);
      const html = await fetchHtml(icon.page);
      imgUrl = extractImgUrl(html, icon.page);
      ext = extFromUrl(imgUrl);
      process.stdout.write(`нашёл ${imgUrl.slice(0, 60)}...\n`);
    }

    if (icon.wikimedia) process.stdout.write(`  [${icon.name}] Wikimedia → ${icon.wikimedia}... `);
    if (icon.direct)    process.stdout.write(`  [${icon.name}] Прямая ссылка... `);

    const data = await fetchBinary(imgUrl);
    if (data.length < 500) throw new Error(`Файл слишком маленький (${data.length}б) — вероятно ошибка`);

    const outPath = join(ICONS_DIR, `${icon.name}.${ext}`);
    writeFileSync(outPath, data);
    process.stdout.write(`✓ ${icon.name}.${ext} (${(data.length/1024).toFixed(1)} KB)\n`);

    // Если расширение изменилось (было .svg, стало .jpg) — возвращаем новое имя файла
    return { name: icon.name, ext, success: true };
  } catch (err) {
    process.stdout.write(`\n  [${icon.name}] ✗ ${err.message}\n`);
    return { name: icon.name, success: false, error: err.message };
  }
}

// ──────────────────────────────────────────────────────────────────
if (!existsSync(ICONS_DIR)) mkdirSync(ICONS_DIR, { recursive: true });

console.log('=== Скачиваю иконки ===\n');

const results = [];
for (const icon of ICONS) {
  const r = await processIcon(icon);
  results.push(r);
}

const ok   = results.filter(r => r.success);
const fail = results.filter(r => !r.success);

console.log('\n=== Готово ===');
console.log(`✓ Скачано: ${ok.length}/${results.length}`);
if (ok.length)   console.log('  ' + ok.map(r => `${r.name}.${r.ext}`).join('  '));
if (fail.length) {
  console.log(`\n✗ Не удалось (${fail.length}):`);
  fail.forEach(r => console.log(`  ${r.name}: ${r.error}`));
  console.log('\n  Для них оставлены оригинальные файлы из репозитория.');
}

// Подсказка: если расширение изменилось — нужно обновить icons.jsx
const changed = ok.filter(r => r.ext !== 'svg');
if (changed.length) {
  console.log('\n⚠ Некоторые иконки сохранены как JPG/PNG (не SVG):');
  changed.forEach(r => console.log(`  ${r.name}.${r.ext}`));
  console.log('  Обнови импорты в src/icons.jsx если расширения отличаются от .svg');
}
