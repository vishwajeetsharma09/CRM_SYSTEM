import { Users, Target, DollarSign, TrendingUp } from 'lucide-react'
import { getDashboardStats } from '@/lib/actions'

export async function DashboardStats() {
  const stats = await getDashboardStats()

  const statCards = [
    {
      name: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Active Leads',
      value: stats.activeLeads,
      icon: Target,
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      name: 'Deals Won This Month',
      value: stats.dealsWonThisMonth,
      icon: DollarSign,
      change: '+23%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Pipeline Value',
      value: stats.totalPipelineValue,
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
}
