# CRM System

A minimal CRM system built with Next.js, Supabase, and modern web technologies.

## Features

- **Dashboard**: KPIs, charts, and recent activities overview
- **Customers**: CRUD operations with search and filtering
- **Leads**: Sales pipeline management with stage tracking
- **Pipeline**: Kanban board with drag & drop functionality
- **Activities**: Track customer interactions and tasks
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Drag & Drop**: @hello-pangea/dnd
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

## Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd crm-system
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your project URL and anon key from the project settings
3. Copy `env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database

1. Go to your Supabase project SQL editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create tables and sample data

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The system uses three main tables:

- **customers**: Customer information and status
- **leads**: Sales leads with stages and values
- **activities**: Customer interactions and tasks

See `supabase-schema.sql` for the complete schema definition.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── customers/       # Customer management
│   ├── leads/          # Lead management
│   ├── activities/     # Activity tracking
│   ├── pipeline/       # Kanban board
│   └── globals.css     # Global styles
├── components/          # Reusable UI components
├── lib/                # Utilities and configurations
│   ├── actions.ts      # Server actions
│   ├── supabase.ts     # Supabase client
│   └── utils.ts        # Helper functions
```

## Key Components

- **DashboardStats**: Shows KPIs and metrics
- **PipelineBoard**: Drag & drop Kanban board
- **CustomerList**: Customer management with search
- **LeadList**: Lead management with filtering
- **ActivityList**: Activity tracking and management

## Features in Detail

### Dashboard
- Total customers count
- Active leads count
- Deals won this month
- Total pipeline value
- Lead stage distribution
- Recent activities

### Customer Management
- Create, read, update, delete customers
- Search by name, email, or company
- Filter by status (active/inactive)
- Customer details and notes

### Lead Management
- Full CRUD operations
- Stage progression tracking
- Expected value and probability
- Source attribution
- Customer association

### Pipeline View
- Visual Kanban board
- Drag & drop between stages
- Real-time stage updates
- Lead information display

### Activity Tracking
- Log calls, emails, meetings, and notes
- Due date management
- Completion tracking
- Customer/lead association

## Development

### Adding New Features

1. Create new pages in `src/app/`
2. Add components in `src/components/`
3. Create server actions in `src/lib/actions.ts`
4. Update types in `src/lib/supabase.ts`

### Styling

The project uses Tailwind CSS with a custom design system. Colors and components follow the shadcn/ui pattern.

### Database Operations

All database operations are handled through server actions in `src/lib/actions.ts`. The Supabase client is configured in `src/lib/supabase.ts`.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce and expected behavior

## Roadmap

- [ ] User authentication and roles
- [ ] Advanced reporting and analytics
- [ ] Email integration
- [ ] Mobile app
- [ ] API endpoints for external integrations
- [ ] Advanced search and filtering
- [ ] Bulk operations
- [ ] Data import/export
