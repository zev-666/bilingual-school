import { prisma } from '@/lib/prisma'
import ContactList from './ContactList'

async function getContacts() {
  try { return await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } }) } catch { return [] }
}

export default async function ContactsPage() {
  const contacts = await getContacts()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">聯絡訊息</h1>
      <ContactList initialContacts={contacts as any} />
    </div>
  )
}
