# CRM System Setup Guide

## Quick Start

This CRM system is built with Next.js 14, Supabase, and modern web technologies. Follow these steps to get it running:

### 1. Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- Git (optional)

### 2. Project Setup
```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env.local
```

### 3. Supabase Configuration
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Update `.env.local` with your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Database Setup
1. Go to your Supabase project SQL Editor
2. Copy and paste the entire contents of `supabase-schema.sql`
3. Run the SQL to create tables and sample data

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Overview

### Dashboard
- **KPIs**: Total customers, active leads, deals won, pipeline value
- **Charts**: Lead stage distribution, pipeline overview
- **Recent Activities**: Latest customer interactions

### Customer Management
- **CRUD Operations**: Create, read, update, delete customers
- **Search & Filter**: By name, email, company, status
- **Status Tracking**: Active/inactive customer management

### Lead Management
- **Pipeline Stages**: New → Contacted → Qualified → Proposal → Won/Lost
- **Lead Details**: Contact info, source, expected value, probability
- **Customer Association**: Link leads to existing customers

### Pipeline View
- **Kanban Board**: Visual drag & drop interface
- **Real-time Updates**: Stage changes sync with database
- **Lead Information**: Quick view of key lead details

### Activity Tracking
- **Activity Types**: Calls, emails, meetings, notes
- **Due Date Management**: Set and track task deadlines
- **Entity Linking**: Associate activities with customers or leads

## Technical Architecture

### Frontend
- **Next.js 14**: App Router, React Server Components
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Modern icon library

### Backend
- **Server Actions**: No separate API routes needed
- **Supabase**: PostgreSQL database with real-time capabilities
- **Type Safety**: Shared types between frontend and backend

### Key Components
- **DashboardStats**: KPI metrics display
- **PipelineBoard**: Drag & drop Kanban implementation
- **CustomerList/LeadList**: Data tables with search/filter
- **ActivityList**: Timeline view of interactions

## Database Schema

### Tables
- **customers**: Customer information and status
- **leads**: Sales leads with stages and values  
- **activities**: Customer interactions and tasks

### Views
- **pipeline**: Lead overview for dashboard

### Sample Data
The schema includes sample customers, leads, and activities to get you started.

## Customization

### Adding New Fields
1. Update the database schema in `supabase-schema.sql`
2. Modify types in `src/lib/supabase.ts`
3. Update forms and displays in components
4. Add server actions in `src/lib/actions.ts`

### Styling
- Uses Tailwind CSS with custom design system
- Follows shadcn/ui patterns
- Responsive design for mobile and desktop

### Business Logic
- All database operations in `src/lib/actions.ts`
- Server-side validation and error handling
- Real-time updates with Supabase

## Troubleshooting

### Common Issues
1. **Build Errors**: Check TypeScript types and imports
2. **Database Connection**: Verify Supabase credentials
3. **Missing Data**: Ensure schema SQL was run successfully
4. **Permission Errors**: Check file permissions on Windows

### Development Tips
- Use `npm run dev` for development
- Check browser console for client-side errors
- Monitor terminal for server-side errors
- Use Supabase dashboard to verify data

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Netlify, Railway, DigitalOcean App Platform
- Any platform supporting Next.js

## Support

For issues:
1. Check the README.md for detailed documentation
2. Review the code structure and components
3. Verify Supabase configuration
4. Check browser console and terminal logs

## Next Steps

Potential enhancements:
- User authentication and roles
- Advanced reporting and analytics
- Email integration
- Mobile app
- API endpoints for external integrations
- Advanced search and filtering
- Bulk operations
- Data import/export

---

**Happy CRM-ing! 🚀**
