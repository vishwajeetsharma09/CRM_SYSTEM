'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Phone, Mail, Calendar, FileText, Edit, Trash2 } from 'lucide-react'
import { Activity } from '@/lib/supabase'
import { formatDateTime } from '@/lib/utils'
import { getActivities } from '@/lib/actions'

const activityIcons = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
}

export function ActivityList() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchActivities() {
      try {
        const data = await getActivities()
        setActivities(data)
      } catch (error) {
        console.error('Error fetching activities:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchActivities()
  }, [])

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.body?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = typeFilter === 'all' || activity.type === typeFilter
    
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-gray-200">
        {filteredActivities.map((activity) => {
          const Icon = activityIcons[activity.type as keyof typeof activityIcons]
          
          return (
            <div key={activity.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      {activity.subject}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        activity.type === 'call' ? 'bg-blue-100 text-blue-800' :
                        activity.type === 'email' ? 'bg-green-100 text-green-800' :
                        activity.type === 'meeting' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.type}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(activity.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  {activity.body && (
                    <p className="mt-2 text-sm text-gray-600">
                      {activity.body}
                    </p>
                  )}
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {activity.due_at && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Due: {formatDateTime(activity.due_at)}
                        </div>
                      )}
                      {activity.completed_at && (
                        <div className="flex items-center text-green-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          Completed: {formatDateTime(activity.completed_at)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        href={`/activities/${activity.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No activities found</p>
          </div>
        )}
      </div>
    </div>
  )
}
