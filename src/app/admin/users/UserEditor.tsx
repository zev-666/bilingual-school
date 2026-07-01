'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const ROLES = [
  { value: 'AUTHOR', label: '📝 Author（作者）— 可新增內容草稿' },
  { value: 'EDITOR', label: '✏️ Editor（編輯）— 可發布與管理文件' },
  { value: 'ADMIN', label: '🛡️ Admin（管理員）— 可管理使用者' },
  { value: 'SUPER_ADMIN', label: '👑 Super Admin（超級管理員）— 全部權限' },
]

const createSchema = z.object({
  name: z.string().min(1, '請輸入姓名'),
  email: z.string().email('請輸入正確的電子信箱'),
  password: z.string().min(8, '密碼至少 8 個字元'),
  role: z.enum(['AUTHOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']),
})

const editSchema = z.object({
  name: z.string().min(1, '請輸入姓名'),
  email: z.string().email('請輸入正確的電子信箱'),
  password: z.string().min(8, '密碼至少 8 個字元').optional().or(z.literal('')),
  role: z.enum(['AUTHOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN']),
})

type CreateData = z.infer<typeof createSchema>
type EditData = z.infer<typeof editSchema>

interface UserData {
  id?: string
  name?: string
  email?: string
  role?: string
}

interface Props {
  initialData?: UserData
  mode: 'create' | 'edit'
}

export default function UserEditor({ initialData, mode }: Props) {
  const router = useRouter()
  const schema = mode === 'create' ? createSchema : editSchema

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name ?? '',
      email: initialData?.email ?? '',
      password: '',
      role: (initialData?.role as CreateData['role']) ?? 'AUTHOR',
    },
  })

  async function onSubmit(data: CreateData) {
    try {
      const url = mode === 'create' ? '/api/users' : `/api/users/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'

      // Remove empty password on edit
      const body = { ...data }
      if (mode === 'edit' && !body.password) {
        delete (body as Partial<CreateData>).password
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? '儲存失敗')
      }

      router.push('/admin/users')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : '儲存失敗')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="card p-6">
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-gray-500">使用者資訊</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              姓名 <span className="text-red-500">*</span>
            </label>
            <input {...register('name')} className="input" placeholder="例：陳小明" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              電子信箱 <span className="text-red-500">*</span>
            </label>
            <input {...register('email')} type="email" className="input" placeholder="user@school.edu.tw" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              密碼{mode === 'create' && <span className="text-red-500"> *</span>}
              {mode === 'edit' && <span className="ml-1 text-xs font-normal text-gray-400">（留空則不更改）</span>}
            </label>
            <input
              {...register('password')}
              type="password"
              className="input"
              placeholder={mode === 'create' ? '至少 8 個字元' : '輸入新密碼以更改'}
              autoComplete="new-password"
            />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              角色 <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {ROLES.map((role) => (
                <label key={role.value} className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 hover:bg-gray-50">
                  <input
                    type="radio"
                    value={role.value}
                    {...register('role')}
                    className="text-primary-600"
                  />
                  <span className="text-sm text-gray-700">{role.label}</span>
                </label>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          取消
        </button>
        <button type="submit" disabled={isSubmitting} className="btn-primary disabled:opacity-50">
          {isSubmitting ? '儲存中...' : mode === 'create' ? '建立使用者' : '儲存變更'}
        </button>
      </div>
    </form>
  )
}
