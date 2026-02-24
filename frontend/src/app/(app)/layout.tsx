import Sidebar from '@/components/Sidebar'
import CommandChat from '@/components/CommandChat'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <CommandChat />
    </div>
  )
}
