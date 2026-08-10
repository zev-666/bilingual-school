// src/app/admin/calendar/new/page.tsx
import type { Metadata } from 'next'
import CalendarEventEditor from '../CalendarEventEditor'

export const metadata: Metadata = { title: '新增行程' }

export default function NewCalendarEventPage() {
  return <CalendarEventEditor mode="create" />
}
