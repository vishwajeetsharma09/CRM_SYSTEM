# Environment Setup for CRM System

## Create `.env.local` file in your project root:

```bash
# JWT Secret for authentication (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production-make-it-long-and-random-64-characters

# Supabase Configuration (update with your actual values)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Development settings
NODE_ENV=development
```

## How to create the file:

1. **Windows**: Create a new file called `.env.local` in your project root
2. **Copy the content above** into the file
3. **Save the file**
4. **Restart your development server** (`npm run dev`)

## Demo Accounts Available:

- **Admin**: `demo@crm.com` / `demo` (Full access)
- **Manager**: `manager@demo.com` / `demo` (Limited access, no delete)
- **Sales Rep**: `sales@demo.com` / `demo` (Basic access, no delete)

## After Database Setup:

- **Admin**: `admin@crm.com` / `admin123`
- **Manager**: `manager@crm.com` / `admin123`  
- **Sales Rep**: `sales@crm.com` / `admin123`

## Note:
- Demo accounts work without database setup
- Real accounts require the security schema to be installed
- Always change default passwords in production
