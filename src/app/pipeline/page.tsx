import { Suspense } from 'react'
import { PipelineBoard } from '@/components/PipelineBoard'

export default function PipelinePage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
        <p className="text-gray-600">Visualize and manage your sales pipeline</p>
      </div>
      
      <Suspense fallback={<div>Loading pipeline...</div>}>
        <PipelineBoard />
      </Suspense>
    </div>
  )
}
