import { getPipelineData, getLeadStages } from '@/lib/actions'

export async function DashboardCharts() {
  const pipelineData = await getPipelineData()
  const leadStages = await getLeadStages()

  const stages = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'] as const
  const stageColors: Record<string, string> = {
    new: 'bg-blue-500',
    contacted: 'bg-yellow-500',
    qualified: 'bg-purple-500',
    proposal: 'bg-orange-500',
    won: 'bg-green-500',
    lost: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Pipeline Overview</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Leads by Stage</h4>
          <div className="space-y-2">
            {stages.map((stage) => {
              const count = leadStages[stage] || 0
              const percentage = leadStages.total > 0 ? (count / leadStages.total) * 100 : 0
              
              return (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${stageColors[stage as keyof typeof stageColors]} mr-2`} />
                    <span className="text-sm text-gray-600 capitalize">{stage}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{count}</span>
                    <span className="text-sm text-gray-500">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Pipeline Value</h4>
          <div className="text-2xl font-bold text-gray-900">
            ${pipelineData.totalValue.toLocaleString()}
          </div>
          <p className="text-sm text-gray-500">
            {pipelineData.totalLeads} active leads in pipeline
          </p>
        </div>
      </div>
    </div>
  )
}
