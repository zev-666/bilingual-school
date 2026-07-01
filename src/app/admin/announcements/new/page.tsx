// src/app/admin/announcements/new/page.tsx
import type { Metadata } from 'next'
import AnnouncementEditor from '../AnnouncementEditor'

export const metadata: Metadata = { title: '新增公告' }

export default function NewAnnouncementPage() {
  return <AnnouncementEditor mode="create" />
}
