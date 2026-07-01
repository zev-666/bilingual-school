// src/app/admin/media/page.tsx
import type { Metadata } from 'next'
import MediaLibrary from './MediaLibrary'

export const metadata: Metadata = { title: '媒體庫' }

export default function AdminMediaPage() {
  return <MediaLibrary />
}
