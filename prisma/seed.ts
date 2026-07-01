import { PrismaClient, UserRole, AnnouncementCategory, TeacherType, DocumentCategory, VideoSource } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Users
  const hashedPassword = await bcrypt.hash('Admin@1234', 12)
  await prisma.user.upsert({
    where: { email: 'admin@school.edu.tw' },
    update: {},
    create: {
      name: '系統管理員',
      email: 'admin@school.edu.tw',
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
    },
  })

  // Announcements
  await prisma.announcement.createMany({
    skipDuplicates: true,
    data: [
      {
        slug: '2024-welcome',
        titleZh: '113學年度開學典禮公告',
        titleEn: '2024 Opening Ceremony Announcement',
        contentZh: '歡迎所有同學回到校園！113學年度開學典禮將於9月1日上午9時舉行，請全體師生準時出席。',
        contentEn: 'Welcome back to campus! The 2024 Opening Ceremony will be held on September 1st at 9:00 AM. All students and teachers are required to attend.',
        category: AnnouncementCategory.NEWS,
        isPinned: true,
        isPublished: true,
        publishedAt: new Date('2024-08-25'),
      },
      {
        slug: '2024-admission',
        titleZh: '114學年度招生簡章公告',
        titleEn: '2025 Admission Guidelines',
        contentZh: '114學年度招生簡章已公告，即日起開放報名，名額有限，請有意就讀的家長盡早提出申請。',
        contentEn: 'The 2025 admission guidelines have been released. Registration is now open. Spots are limited, so please apply early.',
        category: AnnouncementCategory.ADMISSION,
        isPinned: false,
        isPublished: true,
        publishedAt: new Date('2024-09-01'),
      },
    ],
  })

  // Banner Slides
  await prisma.bannerSlide.createMany({
    skipDuplicates: true,
    data: [
      {
        titleZh: '啟迪未來，雙語領航',
        titleEn: 'Inspire the Future, Bilingual Leadership',
        subtitleZh: '提供最優質的雙語教育環境',
        subtitleEn: 'Providing the finest bilingual education environment',
        imageUrl: '/images/banner-1.jpg',
        sortOrder: 1,
        isActive: true,
      },
      {
        titleZh: '國際視野，在地關懷',
        titleEn: 'Global Vision, Local Care',
        subtitleZh: '培育具備全球競爭力的未來人才',
        subtitleEn: 'Nurturing future talent with global competitiveness',
        imageUrl: '/images/banner-2.jpg',
        sortOrder: 2,
        isActive: true,
      },
    ],
  })

  // Teachers
  await prisma.teacher.createMany({
    skipDuplicates: true,
    data: [
      {
        nameZh: '王大明',
        nameEn: 'David Wang',
        titleZh: '校長',
        titleEn: 'Principal',
        bioZh: '擁有超過20年的教育行政經驗，致力於推動雙語教育政策。',
        bioEn: 'With over 20 years of educational administration experience, committed to promoting bilingual education policies.',
        type: TeacherType.STAFF,
        subjects: [],
        sortOrder: 1,
      },
      {
        nameZh: '李美玲',
        nameEn: 'Emily Li',
        titleZh: '英語科主任',
        titleEn: 'English Department Head',
        bioZh: '英國劍橋大學教育學碩士，專精英語教學與課程設計。',
        bioEn: 'Master of Education from Cambridge University, specializing in English teaching and curriculum design.',
        type: TeacherType.FULL_TIME,
        subjects: ['English', 'Literature'],
        sortOrder: 2,
      },
      {
        nameZh: '陳建志',
        nameEn: 'Jason Chen',
        titleZh: '數學科教師',
        titleEn: 'Mathematics Teacher',
        bioZh: '台灣大學數學系畢業，擅長以生活化方式教授數學概念。',
        bioEn: 'Graduate of NTU Mathematics Department, skilled at teaching math concepts through real-life applications.',
        type: TeacherType.FULL_TIME,
        subjects: ['Mathematics', 'Statistics'],
        sortOrder: 3,
      },
    ],
  })

  // Site Settings
  const settings = [
    { key: 'site_name_zh', value: '雙語實驗學校' },
    { key: 'site_name_en', value: 'Bilingual Experimental School' },
    { key: 'site_description_zh', value: '提供優質雙語教育的實驗學校' },
    { key: 'site_description_en', value: 'An experimental school providing quality bilingual education' },
    { key: 'contact_email', value: 'info@school.edu.tw' },
    { key: 'contact_phone', value: '02-1234-5678' },
    { key: 'contact_address_zh', value: '台北市信義區教育路1號' },
    { key: 'contact_address_en', value: 'No.1, Education Rd., Xinyi Dist., Taipei City' },
    { key: 'facebook_url', value: '' },
    { key: 'youtube_url', value: '' },
    { key: 'google_maps_embed', value: '' },
    { key: 'footer_text_zh', value: '© 2024 雙語實驗學校 版權所有' },
    { key: 'footer_text_en', value: '© 2024 Bilingual Experimental School. All rights reserved.' },
  ]

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
