// src/app/admin/teachers/new/page.tsx
import type { Metadata } from 'next'
import TeacherEditor from '../TeacherEditor'

export const metadata: Metadata = { title: '新增師資' }

export default function NewTeacherPage() {
  return <TeacherEditor mode="create" />
}
