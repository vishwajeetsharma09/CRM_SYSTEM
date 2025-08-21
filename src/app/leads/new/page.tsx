import { LeadForm } from '@/components/LeadForm'

export default function NewLeadPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
        <p className="text-gray-600">Create a new lead in your pipeline</p>
      </div>
      
      <LeadForm />
    </div>
  )
}
