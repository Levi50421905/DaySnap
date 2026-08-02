import { BottomNav } from '@/components/layout/BottomNav'
import { Navbar } from '@/components/layout/Navbar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E8E6E1]">
      <Navbar />
      <main className="pb-20 md:pb-0 md:pl-56">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}