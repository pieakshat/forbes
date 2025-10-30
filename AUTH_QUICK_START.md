# Quick Start: Authentication Setup

## Overview

The application now has full authentication using Supabase with role-based access control.

## Roles

- **Leader**: Access to Group Leader Panel (`/group-leader`)
- **Manager**: Access to Dashboard (`/dashboard`)
- **Admin**: Access to Dashboard (`/dashboard`)

## Setup Steps

### 1. Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS users (
  email VARCHAR PRIMARY KEY,
  password VARCHAR NOT NULL,
  role VARCHAR NOT NULL CHECK (role IN ('leader', 'manager', 'admin'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 3. Create Users

1. Go to Supabase **Authentication** → **Users**
2. Create a user with email/password
3. Update the users table with the role:

```sql
INSERT INTO users (email, password, role) 
VALUES ('user@example.com', 'hashed_password', 'leader');
```

**Note**: In production, Supabase handles password hashing. The password column should be updated through Supabase Auth.

### 4. Run the Application

```bash
npm run dev
```

## File Structure

```
src/
├── lib/
│   ├── supabase/          # Supabase clients
│   └── auth.ts            # Auth helper functions
├── contexts/
│   └── AuthContext.tsx    # Auth state management
├── components/
│   └── auth/              # Login & Protected routes
└── app/
    ├── middleware.ts      # Next.js auth middleware
    └── providers.tsx      # App providers
```

## How It Works

1. User logs in with email and password
2. Supabase authenticates the user
3. User role is fetched from database
4. Automatic redirect based on role:
   - Leader → `/group-leader`
   - Manager/Admin → `/dashboard`
5. Protected routes enforce authentication and role-based access

## Features

- ✅ Secure authentication with Supabase
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Automatic redirects based on role
- ✅ Session persistence
- ✅ Logout functionality
- ✅ Loading states
- ✅ Error handling

For detailed setup instructions, see [AUTH_SETUP.md](./AUTH_SETUP.md)

