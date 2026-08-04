// src/lib/email.ts
import nodemailer from 'nodemailer'

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT || 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASSWORD

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  })
}

interface ContactNotificationInput {
  name: string
  email: string
  subject: string
  message: string
  contactId: string
}

/**
 * 聯絡表單送出後通知管理員信箱
 * 刻意設計成不會 throw error：SMTP 沒設定或寄送失敗，只印警告，不影響表單送出結果
 */
export async function sendContactNotification(
  input: ContactNotificationInput
): Promise<{ sent: boolean; error?: string }> {
  const transporter = getTransporter()
  const notifyTo = process.env.CONTACT_NOTIFY_EMAIL

  if (!transporter || !notifyTo) {
    console.warn('[email] SMTP 或 CONTACT_NOTIFY_EMAIL 未設定，略過寄送通知信')
    return { sent: false, error: 'SMTP not configured' }
  }

  const siteName = process.env.SITE_NAME || '雙語實驗學校'
  const adminUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/admin/contacts`

  const html = `
    <div style="font-family: -apple-system, 'PingFang TC', 'Microsoft JhengHei', sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
      <div style="background: #4F46E5; padding: 24px; border-radius: 8px 8px 0 0;">
        <h2 style="color: #fff; margin: 0; font-size: 18px;">📬 ${siteName} — 新的聯絡表單通知</h2>
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 80px;">姓名</td><td style="padding: 8px 0;">${escapeHtml(input.name)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0;">${escapeHtml(input.email)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">主旨</td><td style="padding: 8px 0;">${escapeHtml(input.subject)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">內容</td><td style="padding: 8px 0; white-space: pre-wrap;">${escapeHtml(input.message)}</td></tr>
        </table>
        <a href="${adminUrl}" style="display: inline-block; margin-top: 20px; background: #4F46E5; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-size: 14px;">
          前往後台查看 / 回覆
        </a>
        <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">此為系統自動通知信，請勿直接回覆此信箱。</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"${siteName} 官網通知" <${process.env.SMTP_USER}>`,
      to: notifyTo,
      replyTo: input.email,
      subject: `【新訊息】${input.subject} — 來自 ${input.name}`,
      html,
    })
    return { sent: true }
  } catch (error) {
    console.error('[email] 寄送通知信失敗:', error)
    return { sent: false, error: (error as Error).message }
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
