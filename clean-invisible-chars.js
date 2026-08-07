const fs = require('fs');

const files = [
  'src/components/sections/SocialSection.tsx',
  'src/components/sections/CoolEnglishSection.tsx',
];

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.log('⚠️ 找不到檔案，略過:', f);
    continue;
  }
  let content = fs.readFileSync(f, 'utf8');
  const beforeLen = content.length;

  // 移除檔案開頭的 BOM
  content = content.replace(/^\uFEFF/, '');
  // 不換行空格 (U+00A0) → 換成一般空格
  content = content.replace(/\u00A0/g, ' ');
  // 零寬字元、雙向文字控制字元等 → 直接移除
  content = content.replace(/[\u200B-\u200F\u202A-\u202E\uFEFF]/g, '');

  fs.writeFileSync(f, content, 'utf8');
  const afterLen = content.length;

  if (beforeLen !== afterLen) {
    console.log(`✅ ${f}：清掉了 ${beforeLen - afterLen} 個隱藏字元`);
  } else {
    console.log(`ℹ️ ${f}：沒發現隱藏字元（長度沒變，問題可能是別的原因）`);
  }
}