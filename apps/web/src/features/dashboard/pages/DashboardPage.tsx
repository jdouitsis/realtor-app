import { Header } from '@/components/common/Header'

import { DashboardContent } from '../components/DashboardContent'
import { Sidebar } from '../components/Sidebar'

export function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <DashboardContent />
        </main>
      </div>
    </div>
  )
}
