'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { Lead, Customer } from '@/lib/supabase'
import { getLead, updateLead, getCustomers } from '@/lib/actions'

export default function EditLeadPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    source: '',
    stage: 'new' as 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost',
    expected_value: '',
    probability: '',
    notes: '',
    customer_id: ''
  })

  useEffect(() => {
    async function fetchData() {
      try {
        const [leadData, customersData] = await Promise.all([
          getLead(params.id),
          getCustomers()
        ])
        
        if (leadData) {
          setLead(leadData)
          setFormData({
            name: leadData.name,
            email: leadData.email || '',
            phone: leadData.phone || '',
            source: leadData.source || '',
            stage: leadData.stage,
            expected_value: leadData.expected_value?.toString() || '',
            probability: leadData.probability?.toString() || '',
            notes: leadData.notes || '',
            customer_id: leadData.customer_id || ''
          })
        }
        
        setCustomers(customersData)
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
      form.append('name', formData.name)
      form.append('email', formData.email)
      form.append('phone', formData.phone)
      form.append('source', formData.source)
      form.append('stage', formData.stage)
      form.append('expected_value', formData.expected_value)
      form.append('probability', formData.probability)
      form.append('notes', formData.notes)
      form.append('customer_id', formData.customer_id)

      await updateLead(params.id, form)
      router.push('/leads')
    } catch (error) {
      console.error('Error updating lead:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Loading lead...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Lead not found</p>
          <Link href="/leads" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
            Back to Leads
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/leads"
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
          <p className="text-gray-600">Update lead information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <input
              type="text"
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
              Stage
            </label>
            <select
              id="stage"
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>

          <div>
            <label htmlFor="expected_value" className="block text-sm font-medium text-gray-700 mb-2">
              Expected Value
            </label>
            <input
              type="number"
              id="expected_value"
              step="0.01"
              value={formData.expected_value}
              onChange={(e) => setFormData({ ...formData, expected_value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-2">
              Probability (%)
            </label>
            <input
              type="number"
              id="probability"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
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
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Link
            href="/leads"
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
