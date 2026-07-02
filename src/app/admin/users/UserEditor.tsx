'use client'

// src/app/admin/users/UserEditor.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const ROLES = ['AUTHOR', 'EDITOR', 'ADMIN', 'SUPER_ADMIN'] as const
const ROLE_LABELS: Record<string, string> = {
  AUTHOR: '作者', EDITOR: '編輯', ADMIN: '管理員', SUPER_ADMIN: '超級管理員',
}

const createSchema = z.object({
  name:     z.string().min(1, '請填寫姓名'),
  email:    z.string().email('請輸入有效的 Email'),
  password: z.string().min(8, '密碼至少 8 碼').regex(
    /^(?=.*[A-Za-z])(?=.*\d)/,
    '密碼須包含英文字母及數字'
  ),
  role:     z.enum(ROLES),
  isActive: z.boolean(),
})

const editSchema = z.object({
  name:     z.string().min(1, '請填寫姓名'),
  email:    z.string().email('請輸入有效的 Email'),
  password: z.string().min(8, '密碼至少 8 碼').regex(
    /^(?=.*[A-Za-z])(?=.*\d)/,
    '密碼須包含英文字母及數字'
  ).optional().or(z.literal('')),
  role:     z.enum(ROLES),
  isActive: z.boolean(),
})

type CreateData = z.infer<typeof createSchema>
type EditData   = z.infer<typeof editSchema>

interface UserData {
  id?:       string
  name?:     string
  email?:    string
  password?: string
  role?:     'AUTHOR' | 'EDITOR' | 'ADMIN' | 'SUPER_ADMIN'
  isActive?: boolean
}

interface UserEditorProps {
  initialData?: UserData
  mode: 'create' | 'edit'
  currentUserRole?: string
}

export default function UserEditor({ initialData, mode, currentUserRole }: UserEditorProps) {
  const router = useRouter()
  const [error, setError]       = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const schema = mode === 'create' ? createSchema : editSchema
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<CreateData | EditData>({
      resolver: zodResolver(schema as z.ZodType<CreateData | EditData>),
      defaultValues: {
        name: '', email: '', password: '', role: 'AUTHOR', isActive: true,
        ...initialData,
      },
    })

  const isActive = watch('isActive')
  const canEditRole = currentUserRole === 'SUPER_ADMIN' || currentUserRole === 'ADMIN'

  const onSubmit = async (data: CreateData | EditData) => {
    setError(null)
    try {
      const url    = mode === 'create' ? '/api/users' : `/api/users/${initialData?.id}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      // Remove empty password on edit
      const payload = { ...data }
      if (mode === 'edit' && !payload.password) {
        delete (payload as Partial<EditData>).password
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? '操作失敗')
      router.push('/admin/users')
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '未知錯誤')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {mode === 'create' ? '新增使用者' : '編輯使用者'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-gray-800">基本資料</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名<span className="text-red-500">*</span>
              </label>
              <input {...register('name')} className="input" placeholder="王小明" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email<span className="text-red-500">*</span>
              </label>
              <input {...register('email')} type="email" className="input" placeholder="user@school.edu.tw" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              密碼
              {mode === 'create' && <span className="text-red-500">*</span>}
              {mode === 'edit'   && <span className="text-gray-400 text-xs ml-1">（留空則不變更）</span>}
            </label>
            <div className="relative">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder={mode === 'create' ? '至少 8 碼，需含英文及數字' : '留空不變更密碼'}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">角色</label>
            {canEditRole ? (
              <select {...register('role')} className="input w-48">
                {ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-2 w-fit">
                {ROLE_LABELS[(initialData?.role as string) ?? 'AUTHOR']}
                <span className="text-xs text-gray-400 ml-2">（需 ADMIN 以上權限才能變更）</span>
              </p>
            )}
          </div>

          {/* isActive toggle */}
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <div
              role="switch" aria-checked={isActive}
              onClick={() => setValue('isActive', !isActive)}
              className={cn(
                'relative w-10 h-6 rounded-full transition-colors',
                isActive ? 'bg-primary-600' : 'bg-gray-300'
              )}
            >
              <span className={cn(
                'absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform',
                isActive ? 'translate-x-4' : 'translate-x-0'
              )} />
            </div>
            <span className="text-sm font-medium text-gray-700">
              {isActive ? '帳號啟用中' : '帳號已停用'}
            </span>
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={isSubmitting} className="btn-primary gap-2">
            <Save size={16} />
            {isSubmitting ? '儲存中…' : '儲存'}
          </button>
          <Link href="/admin/users" className="btn-secondary">取消</Link>
        </div>
      </form>
    </div>
  )
}
