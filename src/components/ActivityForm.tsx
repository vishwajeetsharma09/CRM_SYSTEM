'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createActivity, getCustomers, getLeads } from '@/lib/actions'
import { Customer, Lead } from '@/lib/supabase'

export function ActivityForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [selectedType, setSelectedType] = useState<'customer' | 'lead'>('customer')

  useEffect(() => {
    async function fetchData() {
      try {
        const [customersData, leadsData] = await Promise.all([
          getCustomers(),
          getLeads()
        ])
        setCustomers(customersData)
        setLeads(leadsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    
    fetchData()
  }, [])

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setError('')

    try {
      await createActivity(formData)
      router.push('/activities')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <form action={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Activity subject"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              id="type"
              name="type"
              required
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
              name="due_at"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="body"
            name="body"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Activity description..."
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="entity_type"
                value="customer"
                checked={selectedType === 'customer'}
                onChange={(e) => setSelectedType(e.target.value as 'customer' | 'lead')}
                className="mr-2"
              />
              Customer
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="entity_type"
                value="lead"
                checked={selectedType === 'lead'}
                onChange={(e) => setSelectedType(e.target.value as 'customer' | 'lead')}
                className="mr-2"
              />
              Lead
            </label>
          </div>
          
          {selectedType === 'customer' && (
            <div>
              <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <select
                id="customer_id"
                name="customer_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.company || 'No company'}
                  </option>
                ))}
              </select>
              <input type="hidden" name="lead_id" value="" />
            </div>
          )}
          
          {selectedType === 'lead' && (
            <div>
              <label htmlFor="lead_id" className="block text-sm font-medium text-gray-700 mb-2">
                Lead *
              </label>
              <select
                id="lead_id"
                name="lead_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select lead</option>
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} - {lead.stage} - {lead.expected_value ? `$${lead.expected_value}` : 'No value'}
                  </option>
                ))}
              </select>
              <input type="hidden" name="customer_id" value="" />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Activity'}
          </button>
        </div>
      </form>
    </div>
  )
}
