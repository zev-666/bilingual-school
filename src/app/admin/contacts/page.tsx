// src/app/admin/contacts/page.tsx
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime, cn } from '@/lib/utils'
import { Mail, Phone, Clock, MessageSquare } from 'lucide-react'

export const metadata: Metadata = { title: '聯絡訊息' }

const STATUS_LABEL: Record<string, string> = {
  UNREAD: '未讀', READ: '已讀', REPLIED: '已回覆', ARCHIVED: '已封存',
}
const STATUS_COLOR: Record<string, string> = {
  UNREAD:   'bg-red-100 text-red-700',
  READ:     'bg-gray-100 text-gray-600',
  REPLIED:  'bg-green-100 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-400',
}

async function getContacts() {
  try {
    return await prisma.contact.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return []
  }
}

export default async function AdminContactsPage() {
  const contacts = await getContacts()
  const unread = contacts.filter((c) => c.status === 'UNREAD').length

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">聯絡訊息</h1>
        {unread > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {unread} 未讀
          </span>
        )}
      </div>

      <div className="space-y-3">
        {contacts.length === 0 ? (
          <div className="card p-12 text-center text-gray-400">
            <MessageSquare size={40} className="mx-auto mb-3 opacity-30" />
            <p>尚無聯絡訊息</p>
          </div>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                    <span className={cn('badge text-xs', STATUS_COLOR[contact.status])}>
                      {STATUS_LABEL[contact.status]}
                    </span>
                  </div>
                  <p className="font-medium text-primary-700 mb-2">{contact.subject}</p>
                  <p className="text-sm text-gray-600 line-clamp-2">{contact.message}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail size={12} /> {contact.email}
                    </span>
                    {contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} /> {contact.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock size={12} /> {formatRelativeTime(contact.createdAt, 'zh-TW')}
                    </span>
                  </div>
                </div>
                <a
                  href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject)}`}
                  className="shrink-0 btn-secondary text-xs px-3 py-2"
                >
                  回覆
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
