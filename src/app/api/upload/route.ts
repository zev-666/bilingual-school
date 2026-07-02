// src/app/api/upload/route.ts
import { NextRequest } from 'next/server'
import { getAuthUserFromRequest, hasPermission } from '@/lib/auth'
import { apiSuccess, apiError } from '@/lib/utils'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { randomUUID } from 'crypto'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
]
const MAX_SIZE_MB = 10

export async function POST(req: NextRequest) {
  const authUser = getAuthUserFromRequest(req)
  if (!authUser) return apiError('Unauthorized', 401)
  if (!hasPermission(authUser.role, 'EDITOR')) return apiError('Forbidden', 403)

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return apiError('No file provided', 400)

  if (file.size > MAX_SIZE_MB * 1024 * 1024)
    return apiError(`File too large (max ${MAX_SIZE_MB}MB)`, 400)

  const allAllowed = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES]
  if (!allAllowed.includes(file.type)) return apiError('File type not allowed', 400)

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type)
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = file.name
  const uniqueName = `${randomUUID()}${extname(file.name)}`

  // Save to local public/uploads (works on local dev; on Vercel use a CDN/storage service)
  const uploadDir = join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(join(uploadDir, uniqueName), buffer)
  const url = `/uploads/${uniqueName}`

  // Persist to Media table
  let media
  try {
    media = await prisma.media.create({
      data: { filename, url, mimeType: file.type, size: file.size },
    })
  } catch {
    media = { id: null, filename, url, mimeType: file.type, size: file.size }
  }

  return apiSuccess({ ...media, isImage }, 201)
}
