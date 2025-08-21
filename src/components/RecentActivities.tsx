import { getRecentActivities } from '@/lib/actions'
import { formatDateTime } from '@/lib/utils'
import { Phone, Mail, Calendar, FileText } from 'lucide-react'

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
}

export async function RecentActivities() {
  const activities = await getRecentActivities()

  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activities</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type as keyof typeof activityIcons]
          
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.subject}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.body && activity.body.length > 100 
                    ? `${activity.body.substring(0, 100)}...` 
                    : activity.body}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-400 capitalize">
                    {activity.type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDateTime(activity.created_at)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        
        {activities.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent activities</p>
          </div>
        )}
      </div>
    </div>
  )
}
