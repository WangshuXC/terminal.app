import { IconChevronRight } from '@tabler/icons-react'

interface PathBreadcrumbProps {
  path: string
  onNavigate: (path: string) => void
}

export function PathBreadcrumb({ path, onNavigate }: PathBreadcrumbProps) {
  const pathParts = path.split('/').filter(Boolean)

  // 构建路径段
  const breadcrumbs = [
    { name: '/', path: '/' },
    ...pathParts.map((part, index) => {
      const fullPath = '/' + pathParts.slice(0, index + 1).join('/')
      return { name: part, path: fullPath }
    })
  ]

  return (
    <div className="flex items-center gap-1 border-b border-neutral-200 bg-neutral-50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800">
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.path} className="flex items-center gap-1">
          {index > 0 && <IconChevronRight size={12} className="text-neutral-400" />}
          <button
            onClick={() => onNavigate(crumb.path)}
            className="rounded px-2 py-1 text-sm text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            {crumb.name}
          </button>
        </div>
      ))}
    </div>
  )
}
