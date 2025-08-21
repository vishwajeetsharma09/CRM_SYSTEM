import { Suspense } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ActivityList } from '@/components/ActivityList'

export default function ActivitiesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-600">Track customer interactions and tasks</p>
        </div>
        <Link
          href="/activities/new"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Link>
      </div>
      
      <Suspense fallback={<div>Loading activities...</div>}>
        <ActivityList />
      </Suspense>
    </div>
  )
}
