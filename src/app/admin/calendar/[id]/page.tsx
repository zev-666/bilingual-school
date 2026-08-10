// src/app/admin/calendar/[id]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import CalendarEventEditor from '../CalendarEventEditor'

export const metadata: Metadata = { title: '編輯行程' }

interface Props { params: { id: string } }

async function getEvent(id: string) {
  try {
    return await prisma.calendarEvent.findUnique({ where: { id } })
  } catch {
    return null
  }
}

function toDateInputValue(d: Date | null | undefined) {
  if (!d) return ''
  return new Date(d).toISOString().slice(0, 10)
}

export default async function EditCalendarEventPage({ params }: Props) {
  const event = await getEvent(params.id)
  if (!event) notFound()

  return (
    <CalendarEventEditor
      mode="edit"
      initialData={{
        id:          event.id,
        titleZh:     event.titleZh,
        titleEn:     event.titleEn,
        descZh:      event.descZh ?? '',
        descEn:      event.descEn ?? '',
        startDate:   toDateInputValue(event.startDate),
        endDate:     toDateInputValue(event.endDate),
        type:        event.type,
        isPublished: event.isPublished,
      }}
    />
  )
}
