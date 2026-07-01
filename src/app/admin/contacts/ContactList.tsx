'use client'
import { useState } from 'react'
import { Mail, Trash2 } from 'lucide-react'

interface Contact {
  id: string; name: string; email: string; subject: string
  message: string; status: string; createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  UNREAD: '未讀', READ: '已讀', REPLIED: '已回覆', ARCHIVED: '已封存',
}
const STATUS_COLORS: Record<string, string> = {
  UNREAD: 'badge-yellow', READ: 'badge-blue', REPLIED: 'badge-green', ARCHIVED: 'badge-gray',
}

export default function ContactList({ initialContacts }: { initialContacts: Contact[] }) {
  const [contacts, setContacts] = useState(initialContacts)
  const [selected, setSelected] = useState<Contact | null>(null)

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/contacts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setContacts(contacts.map(c => c.id === id ? { ...c, status } : c))
    if (selected?.id === id) setSelected({ ...selected, status })
  }

  const deleteContact = async (id: string) => {
    if (!confirm('確定要刪除這則訊息嗎？')) return
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' })
    setContacts(contacts.filter(c => c.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const openMessage = (contact: Contact) => {
    setSelected(contact)
    if (contact.status === 'UNREAD') updateStatus(contact.id, 'READ')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 card overflow-hidden divide-y divide-gray-50">
        {contacts.map(contact => (
          <button key={contact.id} onClick={() => openMessage(contact)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selected?.id === contact.id ? 'bg-primary-50' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 text-sm">{contact.name}</span>
              <span className={`badge ${STATUS_COLORS[contact.status]}`}>{STATUS_LABELS[contact.status]}</span>
            </div>
            <p className="text-sm text-gray-600 truncate">{contact.subject}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(contact.createdAt).toLocaleString('zh-TW')}</p>
          </button>
        ))}
        {contacts.length === 0 && <div className="p-8 text-center text-gray-400 text-sm">尚無聯絡訊息</div>}
      </div>

      <div className="lg:col-span-3 card p-6">
        {selected ? (
          <div>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg">{selected.subject}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selected.name} &lt;{selected.email}&gt;
                </p>
                <p className="text-xs text-gray-400 mt-1">{new Date(selected.createdAt).toLocaleString('zh-TW')}</p>
              </div>
              <div className="flex gap-2">
                <a href={`mailto:${selected.email}`} className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1">
                  <Mail size={14} /> 回覆
                </a>
                <button onClick={() => deleteContact(selected.id)} className="btn-ghost py-1.5 px-3 text-xs text-red-600 hover:bg-red-50">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed mb-6">{selected.message}</p>
            <div className="flex gap-2">
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <button key={key} onClick={() => updateStatus(selected.id, key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selected.status === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm py-20">
            選擇一則訊息以查看詳情
          </div>
        )}
      </div>
    </div>
  )
}
