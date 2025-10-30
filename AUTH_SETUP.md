# Authentication Setup Guide

This guide will help you set up authentication for the Forbes Progress Pulse application using Supabase.

## Prerequisites

- A Supabase account (https://supabase.com)
- A Supabase project with a users table

## Database Setup

### 1. Create the Users Table

In your Supabase SQL Editor, run the following SQL to create the users table:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  email VARCHAR PRIMARY KEY,
  password VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('leader', 'manager', 'admin'))
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (auth.uid() = auth.jwt() ->> 'email');

-- You can also create a service role policy for server-side operations
-- Note: This is a basic setup. Adjust policies based on your security requirements.
```

### 2. Insert Sample Users

```sql
-- Insert sample users (you'll need to hash passwords properly in production)
-- For now, you can create users through Supabase Auth UI

-- Example insert (replace with actual hashed passwords)
INSERT INTO users (email, password, role) VALUES
  ('leader@forbesmarshall.com', 'hashed_password_here', 'leader'),
  ('manager@forbesmarshall.com', 'hashed_password_here', 'manager'),
  ('admin@forbesmarshall.com', 'hashed_password_here', 'admin');
```

**Important**: In production, never store plain text passwords. Supabase handles password hashing through their Auth system.

## Supabase Configuration

### 1. Set Up Supabase Auth

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Enable **Email** as a provider
4. Configure email templates if needed

### 2. Create Users in Supabase Auth

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Create the user

### 3. Update the Users Table

After creating users in Supabase Auth, update your users table with their roles:

```sql
UPDATE users SET role = 'leader' WHERE email = 'leader@forbesmarshall.com';
UPDATE users SET role = 'manager' WHERE email = 'manager@forbesmarshall.com';
UPDATE users SET role = 'admin' WHERE email = 'admin@forbesmarshall.com';
```

## Environment Variables

### 1. Create `.env.local` file

Create a `.env.local` file in the root of your project:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Get Your Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the **anon public** key and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Installation

Install the required dependencies (already in package.json):

```bash
npm install
# or
pnpm install
# or
yarn install
```

## Running the Application

```bash
npm run dev
```

## Role-Based Access Control

The application implements role-based access control with the following permissions:

- **Leader**: Can access `/group-leader` page
- **Manager**: Can access `/dashboard` page
- **Admin**: Can access `/dashboard` page

### How It Works

1. User logs in with email and password
2. Authentication is handled by Supabase Auth
3. User role is fetched from the `users` table
4. User is redirected based on their role:
   - Leaders → Group Leader Panel
   - Managers & Admins → Dashboard
5. Protected routes check user authentication and role before rendering

## File Structure

```
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   └── server.ts       # Server Supabase client
│   └── auth.ts             # Auth helper functions
├── contexts/
│   └── AuthContext.tsx     # Authentication context provider
├── components/
│   └── auth/
│       ├── LoginPage.tsx   # Login page component
│       └── ProtectedRoute.tsx  # Route protection component
└── app/
    ├── middleware.ts       # Next.js middleware for auth
    ├── providers.tsx       # App providers including Auth
    ├── page.tsx            # Login page route
    ├── dashboard/
    │   └── page.tsx        # Protected dashboard route
    └── group-leader/
        └── page.tsx        # Protected group leader route
```

## Testing Authentication

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to Login Page

Open http://localhost:3000

### 3. Login with Credentials

Use the email and password of users you created in Supabase Auth.

### 4. Verify Redirect

- Leaders will be redirected to the Group Leader Panel
- Managers and Admins will be redirected to the Dashboard

### 5. Test Protected Routes

- Try accessing `/dashboard` as a leader (should redirect to `/group-leader`)
- Try accessing `/group-leader` as a manager (should redirect to `/dashboard`)

## Troubleshooting

### Issue: "Supabase client not configured"

**Solution**: Make sure your `.env.local` file exists and contains the correct Supabase credentials.

### Issue: "Unable to fetch user role"

**Solution**: Ensure the user exists in the `users` table and has a valid role assigned.

### Issue: User authenticated but can't access pages

**Solution**: Check that the user's role in the database matches one of the allowed roles: 'leader', 'manager', or 'admin'.

### Issue: Session not persisting

**Solution**: Make sure you have cookies enabled in your browser and the middleware is properly configured.

## Security Considerations

1. **Password Storage**: Passwords are hashed by Supabase Auth and never stored in plain text
2. **Row Level Security**: Enable RLS policies on your database tables for additional security
3. **Environment Variables**: Never commit `.env.local` to version control
4. **Secure Cookies**: Supabase SSR handles secure cookie management
5. **Role Validation**: Always validate user roles on both client and server side

## Next Steps

1. Set up additional RLS policies as needed
2. Implement password reset functionality
3. Add user profile management
4. Configure email verification
5. Add audit logging for security events

## Support

For issues or questions:
- Supabase Documentation: https://supabase.com/docs
- Next.js Documentation: https://nextjs.org/docs
- Project Issues: Open an issue in the project repository

