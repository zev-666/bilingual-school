// prisma/seed.ts
// Run: npx ts-node --project tsconfig.json prisma/seed.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Admin user ────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin@1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.edu.tw' },
    update: {},
    create: {
      name: '系統管理員',
      email: 'admin@school.edu.tw',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin user:', admin.email)

  // ── Editor user ───────────────────────────────────────────────
  const editorPw = await bcrypt.hash('Editor@1234', 12)
  await prisma.user.upsert({
    where: { email: 'editor@school.edu.tw' },
    update: {},
    create: {
      name: '內容編輯',
      email: 'editor@school.edu.tw',
      password: editorPw,
      role: 'EDITOR',
    },
  })
  console.log('✅ Editor user created')

  // ── Banner slides ─────────────────────────────────────────────
  await prisma.bannerSlide.createMany({
    skipDuplicates: true,
    data: [
      { titleZh: '培育雙語人才', titleEn: 'Cultivating Bilingual Leaders', subtitleZh: '卓越教育，成就未來', subtitleEn: 'Excellence in Education', imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1920&q=80', linkUrl: '/admission', linkTextZh: '了解招生資訊', linkTextEn: 'Explore Admissions', sortOrder: 0 },
      { titleZh: '世界級學習環境', titleEn: 'World-Class Learning', subtitleZh: '現代設施，激發無限潛能', subtitleEn: 'Modern Facilities, Unlimited Potential', imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1920&q=80', linkUrl: '/about', linkTextZh: '了解更多', linkTextEn: 'Learn More', sortOrder: 1 },
    ],
  })
  console.log('✅ Banner slides seeded')

  // ── Announcements ─────────────────────────────────────────────
  await prisma.announcement.createMany({
    skipDuplicates: true,
    data: [
      { slug: 'welcome-2024', titleZh: '2024學年度開學典禮圓滿舉行', titleEn: '2024 Opening Ceremony Successfully Held', summaryZh: '本校2024學年度開學典禮於上週五圓滿舉行。', summaryEn: 'Our 2024 opening ceremony was successfully held last Friday.', contentZh: '# 2024學年度開學典禮\n\n本校2024學年度開學典禮於9月2日（五）上午9時圓滿舉行...\n\n## 活動亮點\n\n- 全體師生歡聚一堂\n- 新生代表致詞\n- 校長勉勵演講', contentEn: '# 2024 Opening Ceremony\n\nOur 2024 academic year opening ceremony was held on Friday, September 2nd...\n\n## Highlights\n\n- All faculty and students gathered\n- New student representative speech\n- Principal\'s address', category: 'ACTIVITY', coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80', isPinned: true, isPublished: true, publishedAt: new Date('2024-09-02'), viewCount: 342, authorId: admin.id },
      { slug: 'admission-2025', titleZh: '2025學年度招生簡章公告', titleEn: '2025 Admissions Brochure Released', summaryZh: '2025學年度招生作業即將展開。', summaryEn: '2025 admissions are now open.', contentZh: '# 2025學年度招生資訊\n\n本校2025學年度招生報名即將正式開始，歡迎有興趣的家長及學生前來了解。', contentEn: '# 2025 Admissions\n\nWe are now accepting applications for the 2025 academic year.', category: 'ADMISSION', isPinned: false, isPublished: true, publishedAt: new Date('2024-08-15'), viewCount: 589, authorId: admin.id },
    ],
  })
  console.log('✅ Announcements seeded')

  // ── Teachers ──────────────────────────────────────────────────
  await prisma.teacher.createMany({
    skipDuplicates: true,
    data: [
      { nameZh: '陳雅雯', nameEn: 'Dr. Grace Chen', titleZh: '校長', titleEn: 'Principal', bioZh: '擁有30年教育經驗，致力推動雙語教育。', bioEn: '30 years of educational leadership.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80', type: 'STAFF', subjects: [], sortOrder: 0 },
      { nameZh: '王建明', nameEn: 'James Wang', titleZh: '英語教師', titleEn: 'English Teacher', bioZh: '美國UCLA語言學碩士。', bioEn: 'MA Linguistics from UCLA.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80', type: 'FULL_TIME', subjects: ['English'], sortOrder: 1 },
      { nameZh: '李美玲', nameEn: 'Amy Li', titleZh: '數學教師', titleEn: 'Math Teacher', bioZh: '台灣大學數學系博士。', bioEn: 'PhD Mathematics from NTU.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&q=80', type: 'FULL_TIME', subjects: ['Math'], sortOrder: 2 },
    ],
  })
  console.log('✅ Teachers seeded')

  // ── Site settings ─────────────────────────────────────────────
  const settings = [
    { key: 'site_name_zh',    value: '雙語實驗學校' },
    { key: 'site_name_en',    value: 'Bilingual School' },
    { key: 'contact_email',   value: 'info@bilingualschool.edu.tw' },
    { key: 'contact_phone',   value: '(02) 1234-5678' },
    { key: 'address_zh',      value: '台灣某市某區某路123號' },
    { key: 'address_en',      value: '123 School Road, City, Taiwan' },
    { key: 'facebook_url',    value: 'https://facebook.com/bilingualschool' },
    { key: 'youtube_url',     value: 'https://youtube.com/@bilingualschool' },
  ]
  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    })
  }
  console.log('✅ Site settings seeded')

  console.log('\n🎉 Seed complete!')
  console.log('   Admin login: admin@school.edu.tw / Admin@1234')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
