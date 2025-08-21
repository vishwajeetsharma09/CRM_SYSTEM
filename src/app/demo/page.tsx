import Link from 'next/link'
import { 
  Users, 
  Target, 
  Activity, 
  BarChart3, 
  LayoutDashboard,
  Plus,
  Search,
  Filter
} from 'lucide-react'

export default function DemoPage() {
  return (
    <div className="p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">CRM System Demo</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          A minimal CRM system built with Next.js, Supabase, and modern web technologies.
          No authentication required - everything runs locally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <LayoutDashboard className="w-8 h-8 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
          </div>
          <p className="text-gray-600 mb-4">
            View KPIs, pipeline metrics, and recent activities at a glance.
          </p>
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View Dashboard →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Users className="w-8 h-8 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Manage customer relationships with full CRUD operations and search.
          </p>
          <div className="space-y-2">
            <Link
              href="/customers"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              View Customers →
            </Link>
            <br />
            <Link
              href="/customers/new"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Customer
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Target className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Leads</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Track sales leads through the pipeline with stage management.
          </p>
          <div className="space-y-2">
            <Link
              href="/leads"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
            >
              View Leads →
            </Link>
            <br />
            <Link
              href="/leads/new"
              className="inline-flex items-center text-purple-600 hover:text-purple-700 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Lead
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-8 h-8 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Pipeline</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Visual Kanban board with drag & drop functionality for lead stages.
          </p>
          <Link
            href="/pipeline"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
          >
            View Pipeline →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Activity className="w-8 h-8 text-red-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Activities</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Log and track customer interactions, calls, meetings, and notes.
          </p>
          <div className="space-y-2">
            <Link
              href="/activities"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              View Activities →
            </Link>
            <br />
            <Link
              href="/activities/new"
              className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Activity
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Search className="w-8 h-8 text-indigo-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Features</h3>
          </div>
          <ul className="text-gray-600 space-y-2 mb-4">
            <li>• Real-time search and filtering</li>
            <li>• Drag & drop pipeline management</li>
            <li>• Responsive design</li>
            <li>• TypeScript support</li>
            <li>• Server Actions (no API routes)</li>
          </ul>
          <div className="text-sm text-gray-500">
            Built with Next.js 14, Supabase, Tailwind CSS
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Getting Started</h2>
        <div className="max-w-2xl mx-auto space-y-4 text-blue-800">
          <p>
            1. Set up your Supabase project and add credentials to <code className="bg-blue-100 px-2 py-1 rounded">.env.local</code>
          </p>
          <p>
            2. Run the SQL schema from <code className="bg-blue-100 px-2 py-1 rounded">supabase-schema.sql</code> in your Supabase SQL editor
          </p>
          <p>
            3. Start the development server with <code className="bg-blue-100 px-2 py-1 rounded">npm run dev</code>
          </p>
          <p>
            4. Explore the features using the navigation above!
          </p>
        </div>
      </div>
    </div>
  )
}
