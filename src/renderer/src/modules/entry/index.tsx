import { useState } from 'react'
import { Sidebar, SidebarBody, SidebarLink, SidebarPinButton } from '@/components/ui/Sidebar'
import { IconServer, IconFileText, IconSettings } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import HostsPage from './pages/HostsPage'
import LogsPage from './pages/LogsPage'
import SettingsPage from './pages/SettingsPage'

type PageType = 'hosts' | 'logs' | 'settings'

const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-sky-300"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-sky-300 dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold whitespace-pre text-sky-300 dark:text-white"
      >
        Terminix
      </motion.span>
    </a>
  )
}

const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-sky-300"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-sky-300 dark:bg-white" />
    </a>
  )
}

export default function EntryModule() {
  const [open, setOpen] = useState(false)
  const [activePage, setActivePage] = useState<PageType>('hosts')

  const links = [
    {
      label: 'Hosts',
      href: '#',
      icon: <IconServer className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      page: 'hosts' as PageType
    },
    {
      label: 'Logs',
      href: '#',
      icon: <IconFileText className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      page: 'logs' as PageType
    },
    {
      label: 'Settings',
      href: '#',
      icon: <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />,
      page: 'settings' as PageType
    }
  ]

  const renderPage = () => {
    switch (activePage) {
      case 'hosts':
        return <HostsPage />
      case 'logs':
        return <LogsPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <HostsPage />
    }
  }

  return (
    <div
      className={cn(
        'flex w-full flex-1 flex-col overflow-hidden bg-[#F5F5F5] md:flex-row dark:bg-neutral-800',
        'h-full'
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="pl-1">{open ? <Logo /> : <LogoIcon />}</div>
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink
                  key={idx}
                  link={link}
                  onClick={() => setActivePage(link.page)}
                  className={cn(
                    activePage === link.page && 'bg-neutral-200 dark:bg-neutral-700 rounded-md'
                  )}
                />
              ))}
            </div>
          </div>
          <SidebarPinButton className="mb-2" />
        </SidebarBody>
      </Sidebar>
      <main className="flex flex-1 rounded-tl-2xl bg-white dark:bg-neutral-900">
        {renderPage()}
      </main>
    </div>
  )
}
