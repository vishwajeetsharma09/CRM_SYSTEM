# CRM Security Setup Guide

## 🛡️ Security Features Added

Your CRM system now includes comprehensive security features to protect your data and control access.

## 📋 Database Setup

### 1. Run Security Schema
Execute the security schema to add user management and audit logging:

```sql
-- Run this in your Supabase SQL editor or PostgreSQL client
-- File: security-schema.sql
```

### 2. Environment Variables
Add these to your `.env.local` file:

```env
# JWT Secret (CHANGE THIS!)
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Install Dependencies
Install the new security dependencies:

```bash
npm install bcryptjs jsonwebtoken @types/bcryptjs @types/jsonwebtoken
```

## 🔐 User Roles & Permissions

### Role Hierarchy
1. **Admin** - Full system access
   - All CRUD operations
   - User management
   - System administration
   - Audit log access

2. **Manager** - Management access
   - Create, Read, Update (no delete)
   - Team oversight
   - Reports access
   - No user management

3. **Sales Rep** - Standard access
   - Create, Read, Update own records
   - Basic reporting
   - No delete access
   - Limited data visibility

4. **Viewer** - Read-only access
   - View-only permissions
   - Basic reports
   - No data modifications

## 👥 Default Users

The system creates these default users:

| Email | Password | Role | Access |
|-------|----------|------|---------|
| admin@crm.com | admin123 | Admin | Full access |
| manager@crm.com | admin123 | Manager | Management |
| sales@crm.com | admin123 | Sales Rep | Standard |

**⚠️ IMPORTANT: Change these passwords immediately in production!**

## 🔒 Security Features

### Authentication
- **JWT-based authentication** with secure tokens
- **Password hashing** using bcrypt (12 rounds)
- **Session management** with database storage
- **Account lockout** after 5 failed attempts (15-minute lockout)

### Authorization
- **Role-based access control (RBAC)**
- **Permission-based route protection**
- **API endpoint security**
- **Resource-level permissions**

### Audit & Monitoring
- **Complete audit logging** of all data changes
- **User activity tracking**
- **IP address logging**
- **Failed login monitoring**

### Rate Limiting
- **API rate limiting** (100 requests per 15 minutes)
- **Configurable limits** per endpoint
- **IP-based tracking**

## 🚀 Getting Started

### 1. Login to Admin Panel
1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/login`
3. Login with admin credentials:
   - Email: `admin@crm.com`
   - Password: `admin123`

### 2. Access Administration
1. Click "Administration" in the sidebar (admin only)
2. Manage users, view audit logs, check security status
3. Create new users with appropriate roles

### 3. Test Different Roles
1. Create test users with different roles
2. Login as different users to see permission differences
3. Verify that users can only access allowed features

## 🔧 Configuration

### JWT Secret
Generate a secure JWT secret for production:

```bash
# Generate a random 64-character string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Rate Limiting
Modify rate limits in `src/lib/auth.ts`:

```typescript
// checkRateLimit(identifier, endpoint, limit, windowMinutes)
await checkRateLimit(clientIP, pathname, 100, 15) // 100 requests per 15 minutes
```

### Password Policy
Update password requirements in `src/lib/validation.ts`:

```typescript
newPassword: z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password requirements...')
```

## 📊 Monitoring

### Admin Dashboard
- View active/suspended users
- Monitor failed login attempts
- Check security feature status
- Review system metrics

### Audit Logs
- Track all data changes
- View user actions
- Monitor IP addresses
- Export audit trails

## 🚨 Security Best Practices

### Production Deployment
1. **Change default passwords** immediately
2. **Set secure JWT secret** (64+ characters)
3. **Enable HTTPS** for all traffic
4. **Configure CORS** properly
5. **Set up monitoring** for failed logins
6. **Regular security audits**

### User Management
1. **Principle of least privilege** - Give minimum required access
2. **Regular access reviews** - Remove unused accounts
3. **Strong password policy** - Enforce complexity requirements
4. **Account monitoring** - Watch for suspicious activity

### Data Protection
1. **Encrypt sensitive data** at rest and in transit
2. **Regular backups** with encryption
3. **Access logging** for compliance
4. **Data retention policies**

## 🔍 Troubleshooting

### Common Issues

**Login not working:**
- Check if security schema is installed
- Verify environment variables
- Check browser console for errors

**Permission denied:**
- Verify user role and permissions
- Check if user account is active
- Review permission assignments

**Rate limiting errors:**
- Check API call frequency
- Verify IP address tracking
- Adjust rate limits if needed

### Debug Mode
Enable debug logging in development:

```typescript
// In auth.ts, add console.log statements
console.log('Auth check:', { user, permissions })
```

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Review the audit logs for failed operations
3. Verify database schema installation
4. Test with different user roles

## 🎯 Next Steps

1. **Customize roles** for your organization
2. **Set up email notifications** for security events
3. **Implement backup strategies**
4. **Add two-factor authentication** (future enhancement)
5. **Set up monitoring alerts**

Your CRM system is now secure and ready for production use! 🎉
