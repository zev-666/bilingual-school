// src/app/[locale]/news/mockData.ts
export const MOCK_NEWS = [
  {
    id: '1', slug: 'welcome-2024', titleZh: '2024學年度開學典禮圓滿舉行',
    titleEn: '2024 Academic Year Opening Ceremony Successfully Held',
    summaryZh: '本校2024學年度開學典禮於上週五圓滿舉行，全體師生歡聚一堂，共迎新學年的到來。',
    summaryEn: 'Our 2024 academic year opening ceremony was successfully held last Friday.',
    category: 'ACTIVITY',
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',
    isPinned: true, publishedAt: new Date('2024-09-02'), viewCount: 342,
    author: { name: '教務處' },
  },
  {
    id: '2', slug: 'english-competition', titleZh: '全國英語演講比賽獲獎公告',
    titleEn: 'National English Speech Competition Award Announcement',
    summaryZh: '恭喜本校學生在全國英語演講比賽中榮獲優異成績。',
    summaryEn: 'Congratulations to our students for excellent results in the competition.',
    category: 'COMPETITION',
    coverImage: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&q=80',
    isPinned: false, publishedAt: new Date('2024-08-28'), viewCount: 218,
    author: { name: '學務處' },
  },
  {
    id: '3', slug: 'admission-2025', titleZh: '2025學年度招生簡章公告',
    titleEn: '2025 Academic Year Admissions Brochure Released',
    summaryZh: '2025學年度招生作業即將展開，歡迎有意報名的家長及學生查閱招生簡章。',
    summaryEn: '2025 admissions are now open.',
    category: 'ADMISSION',
    coverImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
    isPinned: false, publishedAt: new Date('2024-08-15'), viewCount: 589,
    author: { name: '教務處' },
  },
]
