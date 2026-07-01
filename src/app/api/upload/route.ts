import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { apiSuccess, apiError, hasPermission } from '@/lib/utils'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const user = getCurrentUser()
    if (!user || !hasPermission(user.role, 'EDITOR')) return apiError('權限不足', 403)

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return apiError('請選擇要上傳的檔案', 400)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const ext = path.extname(file.name)
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const url = `/uploads/${filename}`

    try {
      await prisma.media.create({
        data: { filename: file.name, url, mimeType: file.type, size: file.size },
      })
    } catch {}

    return apiSuccess({ url, filename: file.name, size: file.size, mimeType: file.type }, 201)
  } catch (e) {
    return apiError('上傳失敗', 500)
  }
}
