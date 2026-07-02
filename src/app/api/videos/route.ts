// src/app/api/videos/route.ts
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError, generateSlug } from '@/lib/utils'
import { z } from 'zod'

function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : null
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page    = parseInt(searchParams.get('page')    ?? '1', 10)
  const perPage = parseInt(searchParams.get('perPage') ?? '12', 10)
  const slug    = searchParams.get('slug')

  // Single video by slug
  if (slug) {
    const video = await prisma.video.findUnique({
      where: { slug, isPublished: true },
      include: { author: { select: { name: true } } },
    })
    if (!video) return apiError('Not found', 404)
    // Increment view count
    await prisma.video.update({ where: { id: video.id }, data: { viewCount: { increment: 1 } } })
    return apiSuccess(video)
  }

  const [data, total] = await Promise.all([
    prisma.video.findMany({
      where:   { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      skip:    (page - 1) * perPage,
      take:    perPage,
      include: { author: { select: { name: true } } },
    }),
    prisma.video.count({ where: { isPublished: true } }),
  ])

  return apiSuccess({ data, meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) } })
}

const createSchema = z.object({
  titleZh:     z.string().min(1),
  titleEn:     z.string().min(1),
  descZh:      z.string().optional(),
  descEn:      z.string().optional(),
  videoUrl:    z.string().url(),
  source:      z.enum(['YOUTUBE', 'VIMEO', 'SELF_HOSTED']).default('YOUTUBE'),
  thumbnail:   z.string().url().optional(),
  duration:    z.number().positive().optional(),
  isPublished: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return apiError(parsed.error.message, 422)

  const { videoUrl, source, titleZh } = parsed.data

  // Auto-extract embed ID
  let embedId: string | null = null
  if (source === 'YOUTUBE') embedId = extractYouTubeId(videoUrl)
  if (source === 'VIMEO')   embedId = extractVimeoId(videoUrl)

  // Auto-generate thumbnail if YouTube and none provided
  const thumbnail = parsed.data.thumbnail
    ?? (embedId && source === 'YOUTUBE'
        ? `https://img.youtube.com/vi/${embedId}/maxresdefault.jpg`
        : undefined)

  const slug = await generateUniqueSlug(titleZh)

  const video = await prisma.video.create({
    data: {
      ...parsed.data,
      slug,
      embedId,
      thumbnail,
      authorId:    authUser.userId,
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  })
  return apiSuccess(video, 201)
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = generateSlug(title)
  let slug   = base
  let count  = 0
  while (await prisma.video.findUnique({ where: { slug } })) {
    count++
    slug = `${base}-${count}`
  }
  return slug
}
