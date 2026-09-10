// Phase 5A：線上教材 — 建立 _book-inventory.json + 掃描內文資源
// 對 10 筆教材（id: 3,4,10,12,13,14,15,16,17,18）解析詳情頁，輸出：
//   - API 欄位（id/title/cate/unit/poster/yearly/mktime）
//   - 精確時間戳（card-footer，到秒）
//   - 內文完整內容（HTML 原樣 + 純文字版）
//   - 檔案清單（檔名/原始URL/實際bytes/新路徑）
//   - 內文資源掃描：<img>/<a>/<iframe> 分類 (a)舊站 (b)外部 (c)相對路徑
// HTML 實體解碼：迴圈解碼至穩定，上限 10 輪
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MIRROR = join(process.cwd(), 'migration-source', 'englishcenter.kl.edu.tw', 'englishcenter.kl.edu.tw', 'books');
const API = JSON.parse(readFileSync('scripts/_books-api.json', 'utf8'));
const BASE = 'https://englishcenter.kl.edu.tw';

function decodeEntities(s, maxRounds = 10) {
  let prev = '', cur = s, rounds = 0;
  while (cur !== prev && rounds < maxRounds) {
    prev = cur;
    cur = cur
      .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
      .replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&nbsp;', ' ')
      .replaceAll('&#13;', '').replaceAll('\r\n', '\n');
    rounds++;
  }
  return { text: cur, rounds };
}

function htmlToText(html) {
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/gi, ' ') // 移除附件區塊
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return decodeEntities(s).text;
}

const books = [];
for (const item of API) {
  const id = item.id;
  const html = readFileSync(join(MIRROR, `${id}.html`), 'utf8');

  // 標題（<h2> 內 <small>）
  const titleM = html.match(/<h2>[\s\S]*?<small>\s*([\s\S]*?)\s*<\/small>/);
  const titleRaw = decodeEntities(titleM ? titleM[1].trim() : item.title).text.replace(/\s+/g, ' ');

  // card-body（排除附件 blockquote 後的內文 HTML）
  const bodyM = html.match(/<div class="card-body">([\s\S]*?)<\/div>\s*(?:<div class="card-footer">|$)/);
  let bodyHTML = bodyM ? bodyM[1] : '';
  // 移除附件 blockquote（檔案清單在下方 files 區單獨擷取）
  const filesBlock = bodyHTML.match(/<blockquote class="files[\s\S]*?<\/blockquote>/);
  const bodyContentHtml = bodyHTML.replace(/<blockquote class="files[\s\S]*?<\/blockquote>/g, '').trim();
  const bodyText = htmlToText(bodyContentHtml);

  // card-footer 精確時間戳
  const footerM = html.match(/<i class="bi bi-calendar"><\/i>\s*([\d-]+ [\d:]+)/);
  const preciseDate = footerM ? footerM[1] : (item.mktime || null);

  // 附件檔案清單（<a href ... title="...">，title 才是純文字檔名）
  const files = [];
  const fileRe = /<a\s+href="([^"]*?\/?file\/(\d+)\/((?:(?!">).)+?))"\s+title="([^"]*)"/g;
  let m;
  while ((m = fileRe.exec(filesBlock ? filesBlock[0] : '')) !== null) {
    const rawName = decodeEntities(m[4]).text; // title 屬性 = 純文字檔名
    const fname = (await import('node:fs')).existsSync ? rawName.replace(/[\\:*?"<>|]/g, '_') : rawName;
    const diskPath = join(process.cwd(), 'public', 'uploads', 'books', String(id), fname);
    files.push({
      name: rawName,
      url: `${BASE}/books/file/${m[2]}/${encodeURIComponent(rawName)}`,
      bytes: existsSync(diskPath) ? (await import('node:fs')).statSync(diskPath).size : null,
      dest: `public/uploads/books/${id}/${encodeURIComponent(rawName)}`,
    });
  }

  // 內文資源掃描（<img>/<a>/<iframe>）
  const resources = { oldSite: [], external: [], relative: [] };
  const resRe = /<(img|a|iframe)\s+[^>]*?(?:src|href)\s*=\s*"([^"]+)"/g;
  let rm;
  while ((rm = resRe.exec(bodyContentHtml)) !== null) {
    const tag = rm[1], url = rm[2];
    if (url.startsWith('#') || url.startsWith('data:') || url.includes('api.kl.edu.tw')) continue;
    let entry = { tag, url, type: '', note: '' };
    if (url.includes('englishcenter.kl.edu.tw')) { entry.type = 'oldSite'; entry.note = '需下載搶救'; }
    else if (url.startsWith('/')) { entry.type = 'relative'; entry.note = '站內路徑，Phase 5B 需改寫'; }
    else if (url.startsWith('http')) { entry.type = 'external'; entry.note = '外部平台依賴'; }
    else { entry.type = 'other'; }
    resources[entry.type].push(entry);
  }

  books.push({
    id, api: item,
    titleZh: titleRaw,
    publishedAt: preciseDate,
    contentHtml: bodyContentHtml,
    contentText: bodyText,
    files,
    resources,
  });
}

writeFileSync('scripts/_book-inventory.json', JSON.stringify(books, null, 1), 'utf8');

console.log(`已寫入 scripts/_book-inventory.json（${books.length} 筆教材）\n`);
for (const b of books) {
  const resCount = b.resources.oldSite.length + b.resources.external.length + b.resources.relative.length;
  console.log(`[${b.id}] ${b.titleZh}`);
  console.log(`    內文 ${b.contentText.length} 字 | 附件 ${b.files.length} | 資源舊站 ${b.resources.oldSite.length} 外部 ${b.resources.external.length} 相對 ${b.resources.relative.length}`);
}