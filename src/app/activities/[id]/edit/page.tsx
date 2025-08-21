'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Activity, Customer, Lead } from '@/lib/supabase'
import { getActivity, updateActivity, getCustomers, getLeads } from '@/lib/actions'

export default function EditActivityPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activity, setActivity] = useState<Activity | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    subject: '',
    body: '',
    type: 'call' as 'call' | 'email' | 'meeting' | 'note',
    due_at: '',
    customer_id: '',
    lead_id: ''
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [activityData, customersData, leadsData] = await Promise.all([
          getActivity(params.id),
          getCustomers(),
          getLeads()
        ])
        
        if (activityData) {
          setActivity(activityData)
          setFormData({
            subject: activityData.subject,
            body: activityData.body || '',
            type: activityData.type,
            due_at: activityData.due_at ? new Date(activityData.due_at).toISOString().slice(0, 16) : '',
            customer_id: activityData.customer_id || '',
            lead_id: activityData.lead_id || ''
          })
        }
        
        setCustomers(customersData)
        setLeads(leadsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const form = new FormData()
      form.append('subject', formData.subject)
      form.append('body', formData.body)
      form.append('type', formData.type)
      form.append('due_at', formData.due_at)
      form.append('customer_id', formData.customer_id)
      form.append('lead_id', formData.lead_id)

      await updateActivity(params.id, form)
      router.push('/activities')
    } catch (error) {
      console.error('Error updating activity:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading activity...</p>
        </div>
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Activity not found</p>
          <Link href="/activities" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Back to Activities
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/activities"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Activities
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Activity</h1>
          <p className="text-gray-600">Update activity information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
            </select>
          </div>

          <div>
            <label htmlFor="due_at" className="block text-sm font-medium text-gray-700 mb-2">
              Due Date
            </label>
            <input
              type="datetime-local"
              id="due_at"
              value={formData.due_at}
              onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              id="customer_id"
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value, lead_id: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.company || 'No Company'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="lead_id" className="block text-sm font-medium text-gray-700 mb-2">
              Lead
            </label>
            <select
              id="lead_id"
              value={formData.lead_id}
              onChange={(e) => setFormData({ ...formData, lead_id: e.target.value, customer_id: '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} - {lead.stage}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="body"
            rows={4}
            value={formData.body}
            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/activities"
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
