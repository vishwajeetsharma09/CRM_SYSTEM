import { ActivityForm } from '@/components/ActivityForm'

export default function NewActivityPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Activity</h1>
        <p className="text-gray-600">Log a new customer interaction or task</p>
      </div>
      
      <ActivityForm />
    </div>
  )
}
