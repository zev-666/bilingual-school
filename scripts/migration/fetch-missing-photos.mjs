// Phase 3 前置：從舊站下載鏡像缺失的相簿原圖（一次性補完鏡像動作，不下載縮圖）
// 來源清單：scripts/_photo-inventory.json（65 相簿 / 709 張照片清單）
// 已存在於鏡像的檔案自動跳過（冪等、可中斷續傳）
// 完成後輸出 scripts/_photo-download-report.json 供驗證
import { existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const BASE = 'https://englishcenter.kl.edu.tw';
const ROOT = join(process.cwd(), 'migration-source', 'englishcenter.kl.edu.tw', 'englishcenter.kl.edu.tw');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) mirror-completion', 'Referer': BASE + '/' };
const DELAY_MS = 300, RETRIES = 3, TIMEOUT_MS = 30000;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const sanitize = name => name.replace(/[\\:*?"<>|]/g, '_'); // Windows 檔名非法字元防禦

const inventory = JSON.parse(await readFile('scripts/_photo-inventory.json', 'utf8'));
const jobs = inventory.flatMap(a => a.photos.map(p => ({ albumId: a.id, rel: p })));
console.log(`清單: ${inventory.length} 相簿 / ${jobs.length} 張照片`);

let downloaded = 0, skipped = 0, failed = [], bytes = 0;
for (let i = 0; i < jobs.length; i++) {
  const { albumId, rel } = jobs[i];
  const fname = sanitize(rel.split('/').pop());
  const dest = join(ROOT, 'photo', 'file', String(albumId), fname);
  if (existsSync(dest)) { skipped++; continue; }

  mkdirSync(dirname(dest), { recursive: true });
  let ok = false, lastErr = '';
  for (let attempt = 1; attempt <= RETRIES && !ok; attempt++) {
    try {
      const ac = new AbortController();
      const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
      const res = await fetch(`${BASE}/${encodeURI(rel)}`, { headers: UA, signal: ac.signal });
      clearTimeout(timer);
      if (!res.ok) { lastErr = `HTTP ${res.status}`; }
      else {
        const buf = Buffer.from(await res.arrayBuffer());
        writeFileSync(dest, buf);
        bytes += buf.length; downloaded++; ok = true;
      }
    } catch (e) { lastErr = e.name === 'AbortError' ? 'timeout' : e.message; }
    if (!ok && attempt < RETRIES) await sleep(1000 * attempt);
  }
  if (!ok) { failed.push({ albumId, rel, error: lastErr }); console.log(`  [FAIL] ${rel} (${lastErr})`); }
  if ((i + 1) % 50 === 0) console.log(`  進度 ${i + 1}/${jobs.length} — 下載 ${downloaded} 跳過 ${skipped} 失敗 ${failed.length}`);
  await sleep(DELAY_MS);
}

const report = { total: jobs.length, downloaded, skipped, failedCount: failed.length, bytes, failed };
writeFileSync('scripts/_photo-download-report.json', JSON.stringify(report, null, 1), 'utf8');
console.log(`\n完成: 下載 ${downloaded} 張 (${(bytes / 1048576).toFixed(2)} MB), 鏡像已有跳過 ${skipped}, 失敗 ${failed.length}`);
if (failed.length) console.log('失敗清單存於 scripts/_photo-download-report.json');
