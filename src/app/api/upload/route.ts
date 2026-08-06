// src/app/api/upload/route.ts
export const runtime = 'nodejs'
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

  let url: string

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    // 優先使用 Vercel Blob：Serverless 環境（Vercel 正式站）唯一可靠的檔案儲存方式，
    // 因為 Vercel 的檔案系統在執行期間是唯讀的，寫入 public/uploads 在正式環境一定會失敗。
    const { put } = await import('@vercel/blob')
    const blob = await put(`uploads/${uniqueName}`, buffer, {
      access: 'public',
      contentType: file.type,
      // 明確傳入 token：Vercel Blob 預設的 OIDC 免 token 認證只在 Production
      // 環境自動生效，本機 `npm run dev`（development 環境）會被 Vercel Blob
      // 擋下來（BlobOidcEnvironmentNotAllowedError）。明確傳入 token 可以讓
      // 本機開發跟正式站都走同一套認證方式，不受 OIDC 環境限制影響。
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })
    url = blob.url
  } else if (process.env.AWS_S3_BUCKET) {
    // Dynamic import at runtime — avoids webpack bundling issues
    const s3Module = await import('@aws-sdk/client-s3')
    const s3 = new s3Module.S3Client({
      region: process.env.AWS_REGION ?? 'ap-northeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
    const key = `uploads/${uniqueName}`
    await s3.send(new s3Module.PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }))
    url = `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${key}`
  } else {
    // 僅供本機開發、且未設定任何雲端儲存 token 時的最後手段。
    // ⚠️ 這個分支在 Vercel 正式環境永遠不會被走到（BLOB_READ_WRITE_TOKEN 一定存在），
    // 保留只是避免本機完全沒設定任何 token 時整個功能掛掉。
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, uniqueName), buffer)
    url = `/uploads/${uniqueName}`
  }

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
