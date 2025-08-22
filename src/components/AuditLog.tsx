'use client'

import { useState, useEffect } from 'react'
import { AuditLog } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Clock, User, Edit, Plus, Trash } from 'lucide-react'

interface AuditLogProps {
  tableFilter?: string
  recordId?: string
  limit?: number
}

export function AuditLogComponent({ tableFilter, recordId, limit = 50 }: AuditLogProps) {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { hasPermission } = useAuth()

  useEffect(() => {
    if (!hasPermission('audit_logs', 'read')) {
      setError('You do not have permission to view audit logs')
      setLoading(false)
      return
    }

    fetchAuditLogs()
  }, [tableFilter, recordId, limit])

  const fetchAuditLogs = async () => {
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          users:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (tableFilter) {
        query = query.eq('table_name', tableFilter)
      }

      if (recordId) {
        query = query.eq('record_id', recordId)
      }

      const { data, error } = await query

      if (error) throw error

      setLogs(data || [])
    } catch (err) {
      console.error('Error fetching audit logs:', err)
      setError('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT':
        return <Plus className="h-4 w-4 text-green-500" />
      case 'UPDATE':
        return <Edit className="h-4 w-4 text-blue-500" />
      case 'DELETE':
        return <Trash className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatJsonData = (data: any) => {
    if (!data) return null
    return JSON.stringify(data, null, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading audit logs...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Audit Log</h3>
          <p className="text-sm text-gray-500">
            Track all changes made to your CRM data
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No audit logs found
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {log.table_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        Record ID: {log.record_id.substring(0, 8)}...
                      </span>
                    </div>

                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {log.users ? 
                          `${log.users.first_name} ${log.users.last_name} (${log.users.email})` :
                          'System'
                        }
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTimestamp(log.created_at)}
                      </div>
                      {log.ip_address && (
                        <span>IP: {log.ip_address}</span>
                      )}
                    </div>

                    {log.old_values && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                          View old values
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                          {formatJsonData(log.old_values)}
                        </pre>
                      </details>
                    )}

                    {log.new_values && (
                      <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
                          View new values
                        </summary>
                        <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                          {formatJsonData(log.new_values)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
