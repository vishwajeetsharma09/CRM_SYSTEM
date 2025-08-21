import { CustomerForm } from '@/components/CustomerForm'

export default function NewCustomerPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
        <p className="text-gray-600">Create a new customer record</p>
      </div>
      
      <CustomerForm />
    </div>
  )
}
