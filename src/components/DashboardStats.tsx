import { Users, Target, DollarSign, TrendingUp } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions'

export async function DashboardStats() {
  try {
    const stats = await getDashboardStats()
    
    // Ensure we have valid numbers
    const safeStats = {
      totalCustomers: Number(stats.totalCustomers) || 0,
      activeLeads: Number(stats.activeLeads) || 0,
      dealsWonThisMonth: Number(stats.dealsWonThisMonth) || 0,
      totalPipelineValue: Number(stats.totalPipelineValue) || 0
    }

    const statCards = [
      {
        name: 'Total Customers',
        value: safeStats.totalCustomers,
        icon: Users,
        change: '+12%',
        changeType: 'positive' as const,
      },
      {
        name: 'Active Leads',
        value: safeStats.activeLeads,
        icon: Target,
        change: '+5%',
        changeType: 'positive' as const,
      },
      {
        name: 'Deals Won This Month',
        value: safeStats.dealsWonThisMonth,
        icon: DollarSign,
        change: '+23%',
        changeType: 'positive' as const,
      },
      {
        name: 'Total Pipeline Value',
        value: safeStats.totalPipelineValue,
        icon: TrendingUp,
        change: '+8%',
        changeType: 'positive' as const,
      },
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow p-6 border border-gray-200"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stat.name.includes('Value') ? `$${stat.value.toLocaleString()}` : stat.value}
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-green-600">
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="text-center text-red-600">
            <p>Error loading dashboard data</p>
            <p className="text-sm text-gray-500">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    )
  }
}
