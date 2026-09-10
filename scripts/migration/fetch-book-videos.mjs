// Phase 5A：搶救線上教材內嵌的 KTV 影片（只抓 mp4）
// 背景：id=12-16 教材內文裡的 http://ktv.kl.edu.tw/video/<32碼hex> 連結已失效
//       （2026-09 查證，平台回 "The search did not find any video"）。
//       以 32 碼前 6 碼比對平台現行 ID 系統（https://ktv.kl.edu.tw/json/video.json，2200 支）尋回，
//       實際檔案規則：https://ktv.kl.edu.tw/v/<code>.{mp4,webm,ogg}（本腳本只抓 mp4）。
// 用法：node scripts/migration/fetch-book-videos.mjs   （冪等：已存在且大小一致就跳過）
import { existsSync, statSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://ktv.kl.edu.tw';
const INVENTORY = 'scripts/_book-inventory.json';
const REPORT = 'scripts/_book-assets-videos-report.json';

// 對應關係已用 inventory 原始連結 × 平台 JSON 交叉核對（2026-09-09）
const MAPPING = [
  { bookId: 12, code: '09f753', orig32: '09f7530fea8c6294d770a784c782a06b', title: 'A組At the airport.MPG' },
  { bookId: 13, code: '6f2590', orig32: '6f25903b82efdb916a8fd23a66184d96', title: 'B組In the city.MPG' },
  { bookId: 14, code: '084348', orig32: '084348b59de1a05653765a64cbddf62f', title: 'C組My neighberhood.MPG' },
  { bookId: 15, code: '72940c', orig32: '72940c79d437f0532b1bb3607f8ad94e', title: 'D組Our fire station.MPG' },
  { bookId: 16, code: '5cc65b', orig32: '5cc65b186de20d0242eb668c42e39b06', title: '高程度學生發表.mpg' },
];
const POSTER = '基隆市東光國小';
const NOTE = '原始 32 碼連結在 2026-09 查證時已失效（平台回 "The search did not find any video"），係以 32 碼前 6 碼比對現行 ID 系統（/json/video.json）後尋回；平台 port 80 已關閉，一律走 https。';

const inv = JSON.parse(readFileSync(INVENTORY, 'utf8'));
const results = [];

for (const m of MAPPING) {
  const book = inv.find(b => b.id === m.bookId);
  if (!book) { console.error(`✗ inventory 找不到 id=${m.bookId}`); process.exit(1); }
  // 防呆：inventory 內文必須真的含有這個 32 碼連結，防止張冠李戴
  const content = (book.contentHtml || '') + ' ' + (book.contentText || '');
  if (!content.includes(m.orig32)) { console.error(`✗ id=${m.bookId} 內文不含 ${m.orig32}，對應關係有誤，中止`); process.exit(1); }
  if (!m.orig32.startsWith(m.code)) { console.error(`✗ id=${m.bookId} code 與 orig32 前綴不符`); process.exit(1); }

  const url = `${BASE}/v/${m.code}.mp4`;
  const headRes = await fetch(url, { method: 'HEAD' });
  const expected = Number(headRes.headers.get('content-length'));
  if (!headRes.ok || !expected) { console.error(`✗ ${url} HEAD 失敗: ${headRes.status}`); process.exit(1); }

  const dir = join('public', 'uploads', 'books', String(m.bookId));
  const dest = join(dir, `${m.code}.mp4`);
  let status, actual;
  if (existsSync(dest) && statSync(dest).size === expected) {
    status = 'skip（已存在且大小一致）'; actual = expected;
  } else {
    mkdirSync(dir, { recursive: true });
    const res = await fetch(url);
    if (!res.ok) { console.error(`✗ 下載失敗 ${url}: ${res.status}`); process.exit(1); }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length !== expected) { console.error(`✗ ${m.code}.mp4 大小不符: 磁碟 ${buf.length} ≠ HEAD ${expected}`); process.exit(1); }
    writeFileSync(dest, buf);
    status = 'downloaded'; actual = buf.length;
  }
  console.log(`✓ id=${m.bookId} ${m.code}.mp4 ${actual.toLocaleString()} bytes (${(actual / 1048576).toFixed(2)} MB) ${status}`);

  results.push({
    bookId: m.bookId,
    originalUrl: `http://ktv.kl.edu.tw/video/${m.orig32}`,
    originalCode32: m.orig32,
    currentCode: m.code,
    playUrl: `${BASE}/video/${m.code}`,
    platformTitle: m.title,
    platformPoster: POSTER,
    fileUrl: url,
    localPath: dest.replace(/\\/g, '/'),
    bytes: actual,
    status,
    note: NOTE,
  });

  // 寫回 inventory：books 該筆補 videos 區塊（唯一記錄影片出處與尋回方式的證據）
  book.videos = [{
    originalUrl: results.at(-1).originalUrl,
    currentCode: m.code,
    playUrl: results.at(-1).playUrl,
    platformTitle: m.title,
    platformPoster: POSTER,
    downloadedFile: { fileUrl: url, localPath: results.at(-1).localPath, bytes: actual },
    note: NOTE,
  }];
}

writeFileSync(REPORT, JSON.stringify({ fetchedAt: new Date().toISOString(), source: BASE, results }, null, 2));
writeFileSync(INVENTORY, JSON.stringify(inv, null, 2));
const total = results.reduce((s, r) => s + r.bytes, 0);
console.log(`\n完成: ${results.length} 支 mp4 / ${total.toLocaleString()} bytes (${(total / 1048576).toFixed(2)} MB)`);
console.log(`inventory 已更新（id 12-16 補 videos 區塊）; 報告: ${REPORT}`);
