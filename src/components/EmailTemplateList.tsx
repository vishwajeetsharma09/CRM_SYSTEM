'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Edit, Trash2, Eye, ToggleLeft, ToggleRight, Mail, Tag } from 'lucide-react'
import { EmailTemplate } from '@/lib/supabase'
import { getEmailTemplates, deleteEmailTemplate, toggleEmailTemplateStatus } from '@/lib/actions'

export function EmailTemplateList() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const data = await getEmailTemplates()
        setTemplates(data)
      } catch (error) {
        console.error('Error fetching email templates:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTemplates()
  }, [])

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.body.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && template.is_active) ||
                         (statusFilter === 'inactive' && !template.is_active)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleToggleStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      await toggleEmailTemplateStatus(templateId, !currentStatus)
      // Update local state
      setTemplates(templates.map(template => 
        template.id === templateId 
          ? { ...template, is_active: !currentStatus }
          : template
      ))
    } catch (error) {
      console.error('Error toggling template status:', error)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this email template?')) {
      try {
        await deleteEmailTemplate(templateId)
        setTemplates(templates.filter(template => template.id !== templateId))
      } catch (error) {
        console.error('Error deleting template:', error)
      }
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'follow_up': return 'bg-blue-100 text-blue-800'
      case 'proposal': return 'bg-green-100 text-green-800'
      case 'meeting': return 'bg-purple-100 text-purple-800'
      case 'general': return 'bg-gray-100 text-gray-800'
      case 'custom': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'follow_up': return <Mail className="w-4 h-4" />
      case 'proposal': return <Tag className="w-4 h-4" />
      case 'meeting': return <Mail className="w-4 h-4" />
      case 'general': return <Mail className="w-4 h-4" />
      case 'custom': return <Tag className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  const formatVariables = (variables: string[]) => {
    if (!variables || variables.length === 0) return 'No variables'
    return variables.map(v => v.replace(/[{}]/g, '')).join(', ')
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading email templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="follow_up">Follow Up</option>
              <option value="proposal">Proposal</option>
              <option value="meeting">Meeting</option>
              <option value="general">General</option>
              <option value="custom">Custom</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Template
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variables
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTemplates.map((template) => (
              <tr key={template.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{template.subject}</div>
                    <div className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {template.body.length > 100 ? `${template.body.substring(0, 100)}...` : template.body}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(template.category)}`}>
                    {getCategoryIcon(template.category)}
                    <span className="ml-1">{template.category.replace('_', ' ')}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatVariables(template.variables)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleStatus(template.id, template.is_active)}
                    className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      template.is_active 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {template.is_active ? (
                      <>
                        <ToggleRight className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/email-templates/${template.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/email-templates/${template.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No email templates found</p>
          </div>
        )}
      </div>
    </div>
  )
}
