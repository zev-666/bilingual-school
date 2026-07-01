// src/app/[locale]/albums/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import AlbumsClient from './AlbumsClient'

interface AlbumsPageProps { params: { locale: string } }

export async function generateMetadata({ params: { locale } }: AlbumsPageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'albums' })
  return { title: t('title'), description: t('subtitle') }
}

async function getAlbums() {
  try {
    return await prisma.album.findMany({
      where: { isPublished: true },
      orderBy: [{ eventDate: 'desc' }, { createdAt: 'desc' }],
      include: { _count: { select: { photos: true } } },
    })
  } catch {
    return MOCK_ALBUMS
  }
}

const MOCK_ALBUMS = [
  {
    id: '1', slug: 'graduation-2024', titleZh: '2024屆畢業典禮', titleEn: '2024 Graduation Ceremony',
    descZh: '恭喜2024屆同學順利完成學業，踏上人生新旅程。', descEn: 'Congratulations to the Class of 2024!',
    coverImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',
    eventDate: new Date('2024-06-15'), isPublished: true, sortOrder: 0,
    authorId: '1', createdAt: new Date(), updatedAt: new Date(),
    _count: { photos: 48 },
  },
  {
    id: '2', slug: 'science-fair-2024', titleZh: '2024科學展覽', titleEn: '2024 Science Fair',
    descZh: '學生們展示了精彩的科學研究成果。', descEn: 'Students showcased brilliant science projects.',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543559cde3a0?w=600&q=80',
    eventDate: new Date('2024-05-20'), isPublished: true, sortOrder: 1,
    authorId: '1', createdAt: new Date(), updatedAt: new Date(),
    _count: { photos: 36 },
  },
  {
    id: '3', slug: 'sports-day-2024', titleZh: '2024運動會', titleEn: '2024 Sports Day',
    descZh: '精彩的運動會，同學們展現了運動精神。', descEn: 'An exciting sports day showcasing athletic spirit.',
    coverImage: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=600&q=80',
    eventDate: new Date('2024-04-10'), isPublished: true, sortOrder: 2,
    authorId: '1', createdAt: new Date(), updatedAt: new Date(),
    _count: { photos: 62 },
  },
  {
    id: '4', slug: 'english-camp-2024', titleZh: '2024英語夏令營', titleEn: '2024 English Summer Camp',
    descZh: '沉浸式英語學習體驗，開拓國際視野。', descEn: 'An immersive English learning experience.',
    coverImage: 'https://images.unsplash.com/photo-1529400971008-f566de0e6dfc?w=600&q=80',
    eventDate: new Date('2024-07-01'), isPublished: true, sortOrder: 3,
    authorId: '1', createdAt: new Date(), updatedAt: new Date(),
    _count: { photos: 29 },
  },
  {
    id: '5', slug: 'art-exhibition-2024', titleZh: '2024藝術特展', titleEn: '2024 Art Exhibition',
    descZh: '學生藝術創作特展，展現無限創意。', descEn: 'A showcase of student artistic creativity.',
    coverImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    eventDate: new Date('2024-03-25'), isPublished: true, sortOrder: 4,
    authorId: '1', createdAt: new Date(), updatedAt: new Date(),
    _count: { photos: 41 },
  },
  {
    id: '6', slug: 'cultural-festival-2024', titleZh: '2024文化節', titleEn: '2024 Cultural Festival',
    descZh: '多元文化匯聚，感受世界的豐富多彩。', descEn: 'Celebrating cultural diversity and global perspectives.',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
    eventDate: new Date('2024-11-15'), isPublished: true, sortOrder: 5,
    authorId: '1', createdAt: new Date(), updatedAt: new Date(),
    _count: { photos: 55 },
  },
]

export default async function AlbumsPage({ params: { locale } }: AlbumsPageProps) {
  const albums = await getAlbums()
  return <AlbumsClient locale={locale} albums={albums as typeof MOCK_ALBUMS} />
}
