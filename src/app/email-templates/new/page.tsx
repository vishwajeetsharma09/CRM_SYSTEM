'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, Plus, X } from 'lucide-react'
import { createEmailTemplate } from '@/lib/actions'

export default function NewEmailTemplatePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    body: '',
    category: 'general' as 'follow_up' | 'proposal' | 'meeting' | 'general' | 'custom',
    is_active: true
  })
  const [variables, setVariables] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const form = new FormData()
      form.append('name', formData.name)
      form.append('subject', formData.subject)
      form.append('body', formData.body)
      form.append('category', formData.category)
      form.append('variables', JSON.stringify(variables))
      form.append('is_active', formData.is_active.toString())

      await createEmailTemplate(form)
      router.push('/email-templates')
    } catch (error) {
      console.error('Error creating email template:', error)
    } finally {
      setSaving(false)
    }
  }

  const addVariable = () => {
    const newVar = prompt('Enter variable name (e.g., customer_name):')
    if (newVar && !variables.includes(`{${newVar}}`)) {
      setVariables([...variables, `{${newVar}}`])
    }
  }

  const removeVariable = (variable: string) => {
    setVariables(variables.filter(v => v !== variable))
  }

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body') as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newText = formData.body.substring(0, start) + variable + formData.body.substring(end)
      setFormData({ ...formData, body: newText })
      
      // Set cursor position after the inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  const getPreviewContent = () => {
    let previewBody = formData.body
    let previewSubject = formData.subject

    // Replace variables with sample data
    const sampleData = {
      '{customer_name}': 'John Smith',
      '{company_name}': 'Acme Corp',
      '{lead_name}': 'Alice Brown',
      '{body}': 'This is a sample message body that would be customized for each email.',
      '{your_name}': 'Sales Team',
      '{due_date}': 'Next Monday',
      '{meeting_time}': '2:00 PM'
    }

    Object.entries(sampleData).forEach(([variable, value]) => {
      previewBody = previewBody.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
      previewSubject = previewSubject.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
    })

    return { subject: previewSubject, body: previewBody }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/email-templates"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Email Templates
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Email Template</h1>
          <p className="text-gray-600">Add a new email template to your CRM system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Template Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Initial Follow-up"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="follow_up">Follow Up</option>
                <option value="proposal">Proposal</option>
                <option value="meeting">Meeting</option>
                <option value="general">General</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject *
              </label>
              <input
                type="text"
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Following up on our conversation"
              />
            </div>

            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
                Email Body *
              </label>
              <textarea
                id="body"
                rows={12}
                required
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Enter your email template here. Use variables like {customer_name} for personalization."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template Variables
              </label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={addVariable}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Variable
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <div key={variable} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md">
                      <span className="text-sm font-mono">{variable}</span>
                      <button
                        type="button"
                        onClick={() => removeVariable(variable)}
                        className="text-gray-500 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Click on a variable above to insert it into your email body, or add new ones.
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Template is active
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/email-templates"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Creating...' : 'Create Template'}
              </button>
            </div>
          </form>
        </div>

        {/* Template Preview */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Template Preview</h3>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
              >
                <Eye className="w-4 h-4 mr-1" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>

            {showPreview && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                  <div className="p-2 bg-gray-50 rounded border text-sm">
                    {getPreviewContent().subject || 'No subject'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body:</label>
                  <div className="p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {getPreviewContent().body || 'No body content'}
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Available Variables:</h4>
              <div className="flex flex-wrap gap-2">
                {variables.map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => insertVariable(variable)}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 font-mono"
                  >
                    {variable}
                  </button>
                ))}
                {variables.length === 0 && (
                  <p className="text-sm text-blue-700">No variables added yet. Add variables to personalize your template.</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Template Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Use variables like <code className="bg-gray-100 px-1 rounded">{'{customer_name}'}</code> for personalization</li>
              <li>• Keep subject lines clear and compelling</li>
              <li>• Use line breaks (<code className="bg-gray-100 px-1 rounded">\n</code>) for formatting</li>
              <li>• Test your template with the preview feature</li>
              <li>• Common variables: <code className="bg-gray-100 px-1 rounded">{'{company_name}'}</code>, <code className="bg-gray-100 px-1 rounded">{'{your_name}'}</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
