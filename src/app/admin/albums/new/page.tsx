// src/app/admin/albums/new/page.tsx
import type { Metadata } from 'next'
import AlbumEditor from '../AlbumEditor'

export const metadata: Metadata = { title: '新增相簿' }

export default function NewAlbumPage() {
  return <AlbumEditor mode="create" />
}
