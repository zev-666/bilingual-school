import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/utils';

/**
 * 全站搜尋 API
 * GET /api/search?q=關鍵字&locale=zh-TW|en
 *
 * ✅ 欄位名稱已對照真實 prisma/schema.prisma 確認：
 *   Announcement: titleZh, titleEn, slug, isPublished
 *   Document:     titleZh, titleEn, isPublished
 *   Album:        titleZh, titleEn, slug, isPublished
 *   Teacher:      nameZh, nameEn, isActive
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const locale = searchParams.get('locale') === 'en' ? 'en' : 'zh-TW';

  if (!q) {
    return apiSuccess([]);
  }

  if (q.length > 100) {
    return apiError('搜尋關鍵字過長', 400);
  }

  try {
    const [announcements, documents, albums, teachers] = await Promise.all([
      prisma.announcement.findMany({
        where: {
          isPublished: true,
          OR: [
            { titleZh: { contains: q, mode: 'insensitive' } },
            { titleEn: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, slug: true, titleZh: true, titleEn: true },
        take: 5,
      }),
      prisma.document.findMany({
        where: {
          isPublished: true,
          OR: [
            { titleZh: { contains: q, mode: 'insensitive' } },
            { titleEn: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, titleZh: true, titleEn: true },
        take: 5,
      }),
      prisma.album.findMany({
        where: {
          isPublished: true,
          OR: [
            { titleZh: { contains: q, mode: 'insensitive' } },
            { titleEn: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, slug: true, titleZh: true, titleEn: true },
        take: 5,
      }),
      prisma.teacher.findMany({
        where: {
          isActive: true,
          OR: [
            { nameZh: { contains: q, mode: 'insensitive' } },
            { nameEn: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, nameZh: true, nameEn: true },
        take: 5,
      }),
    ]);

    const results = [
      ...announcements.map((a: { id: string; slug: string; titleZh: string; titleEn: string }) => ({
        type: 'announcement' as const,
        id: a.id,
        title: locale === 'en' ? a.titleEn || a.titleZh : a.titleZh,
        href: `/${locale}/news/${a.slug}`,
      })),
      ...documents.map((d: { id: string; titleZh: string; titleEn: string }) => ({
        type: 'document' as const,
        id: d.id,
        title: locale === 'en' ? d.titleEn || d.titleZh : d.titleZh,
        href: `/${locale}/documents`,
      })),
      ...albums.map((al: { id: string; slug: string; titleZh: string; titleEn: string }) => ({
        type: 'album' as const,
        id: al.id,
        title: locale === 'en' ? al.titleEn || al.titleZh : al.titleZh,
        href: `/${locale}/albums/${al.slug}`,
      })),
      ...teachers.map((t: { id: string; nameZh: string; nameEn: string }) => ({
        type: 'teacher' as const,
        id: t.id,
        title: locale === 'en' ? t.nameEn || t.nameZh : t.nameZh,
        href: `/${locale}/teachers`,
      })),
    ];

    return apiSuccess(results);
  } catch (error) {
    console.error('Search error:', error);
    return apiError('搜尋時發生錯誤', 500);
  }
}
