// src/app/admin/teachers/[id]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import TeacherEditor from '../TeacherEditor'

export const metadata: Metadata = { title: '編輯師資' }

interface Props { params: { id: string } }

async function getTeacher(id: string) {
  try {
    return await prisma.teacher.findUnique({ where: { id } })
  } catch {
    return null
  }
}

export default async function EditTeacherPage({ params }: Props) {
  const teacher = await getTeacher(params.id)
  if (!teacher) notFound()

  return (
    <TeacherEditor
      mode="edit"
      initialData={{
        id:        teacher.id,
        nameZh:    teacher.nameZh,
        nameEn:    teacher.nameEn,
        titleZh:   teacher.titleZh,
        titleEn:   teacher.titleEn,
        bioZh:     teacher.bioZh  ?? '',
        bioEn:     teacher.bioEn  ?? '',
        avatar:    teacher.avatar ?? '',
        type:      teacher.type,
        email:     teacher.email  ?? '',
        sortOrder: teacher.sortOrder,
        isActive:  teacher.isActive,
        subjects:  teacher.subjects,
      }}
    />
  )
}
