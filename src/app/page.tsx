import { Suspense } from 'react'
import { DashboardStats } from '@/components/DashboardStats'
import { DashboardCharts } from '@/components/DashboardCharts'
import { RecentActivities } from '@/components/RecentActivities'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your CRM performance</p>
      </div>
      
      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div>Loading charts...</div>}>
          <DashboardCharts />
        </Suspense>
        
        <Suspense fallback={<div>Loading activities...</div>}>
          <RecentActivities />
        </Suspense>
      </div>
    </div>
  )
}
