import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { AuthType } from '@/store/hosts'
import { IconServer, IconUser, IconLock, IconKey } from '@tabler/icons-react'

export interface NewHostFormData {
  name: string
  address: string
  port: number
  authType: AuthType
  username: string
  password?: string
  privateKey?: string
}

interface NewHostFormProps {
  onSubmit: (data: NewHostFormData) => void
  isLoading?: boolean
}

// 卡片容器组件
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className
}) => (
  <div className={cn('rounded-2xl bg-white p-5 shadow-sm dark:bg-neutral-900', className)}>
    {children}
  </div>
)

// 带图标的输入框组件
const IconInput: React.FC<{
  icon: React.ReactNode
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: string
}> = ({ icon, placeholder, value, onChange, type = 'text' }) => (
  <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 transition-all focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-400/20 dark:border-neutral-700 dark:bg-neutral-800">
    <span className="text-neutral-400">{icon}</span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400 dark:text-neutral-200 dark:placeholder:text-neutral-500"
    />
  </div>
)

export const NewHostForm: React.FC<NewHostFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<NewHostFormData>({
    name: '',
    address: '',
    port: 22,
    authType: 'password',
    username: '',
    password: '',
    privateKey: ''
  })

  const isFormValid = useMemo(() => {
    const { address, username, authType, password, privateKey } = formData
    if (!address.trim() || !username.trim()) return false
    if (authType === 'password' && !password?.trim()) return false
    if (authType === 'privateKey' && !privateKey?.trim()) return false
    return true
  }, [formData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isFormValid) {
      // 如果没有填写 name，使用 address 作为 name
      const submitData = {
        ...formData,
        name: formData.name.trim() || formData.address
      }
      onSubmit(submitData)
    }
  }

  const updateField = <K extends keyof NewHostFormData>(field: K, value: NewHostFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {/* Address Card */}
        <Card>
          <h3 className="mb-4 text-base font-semibold text-neutral-800 dark:text-neutral-100">
            Address
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white">
              <IconServer size={24} />
            </div>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="IP or Hostname"
              className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-all placeholder:text-neutral-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            />
          </div>
        </Card>

        {/* General Card */}
        <Card>
          <h3 className="mb-4 text-base font-semibold text-neutral-800 dark:text-neutral-100">
            General
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Label"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700 outline-none transition-all placeholder:text-neutral-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            />
          </div>
        </Card>

        {/* SSH Port & Credentials Card */}
        <Card>
          {/* SSH Port */}
          <div className="mb-4 flex items-center gap-3 border-b border-neutral-100 pb-4 dark:border-neutral-800">
            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              SSH on
            </span>
            <input
              type="number"
              value={formData.port}
              onChange={(e) => updateField('port', parseInt(e.target.value) || 22)}
              min={1}
              max={65535}
              className="w-20 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-center text-sm text-neutral-700 outline-none transition-all focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
            />
            <span className="text-sm text-neutral-500">port</span>
          </div>

          {/* Credentials */}
          <h3 className="mb-4 text-base font-semibold text-neutral-800 dark:text-neutral-100">
            Credentials
          </h3>
          <div className="space-y-3">
            {/* Username */}
            <IconInput
              icon={<IconUser size={18} />}
              placeholder="Username"
              value={formData.username}
              onChange={(value) => updateField('username', value)}
            />

            {/* Password */}
            <IconInput
              icon={<IconLock size={18} />}
              placeholder="Password"
              value={formData.password || ''}
              onChange={(value) => updateField('password', value)}
              type="password"
            />

            {/* Private Key */}
            <div
              className={cn(
                'rounded-xl border bg-white px-4 py-3 transition-all dark:bg-neutral-800',
                formData.authType === 'privateKey'
                  ? 'border-sky-400 ring-2 ring-sky-400/20'
                  : 'border-neutral-200 dark:border-neutral-700'
              )}
            >
              <div
                className="flex cursor-pointer items-center gap-3"
                onClick={() =>
                  updateField(
                    'authType',
                    formData.authType === 'privateKey' ? 'password' : 'privateKey'
                  )
                }
              >
                <span className="text-neutral-400">
                  <IconKey size={18} />
                </span>
                <span className="text-sm text-neutral-400">Key</span>
              </div>
              {formData.authType === 'privateKey' && (
                <textarea
                  value={formData.privateKey}
                  onChange={(e) => updateField('privateKey', e.target.value)}
                  placeholder="Paste your private key here..."
                  rows={4}
                  className="mt-3 w-full resize-none bg-transparent font-mono text-xs text-neutral-700 outline-none placeholder:text-neutral-400 dark:text-neutral-200"
                />
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Footer - Connect Button */}
      <div className="bg-linear-to-t from-[#f0f2f5] via-[#f0f2f5] to-transparent px-4 pb-6 pt-4 dark:from-neutral-800 dark:via-neutral-800">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={cn(
            'w-full rounded-xl py-4 text-base font-medium transition-all',
            isFormValid && !isLoading
              ? 'bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.98]'
              : 'cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-700 dark:text-neutral-500'
          )}
        >
          {isLoading ? 'Connecting...' : 'Connect'}
        </button>
      </div>
    </form>
  )
}

export default NewHostForm
