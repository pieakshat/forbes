# How to Add Role to Users in Supabase

## Method 1: Adding Role When Creating Users in Supabase Dashboard

### Step 1: Create a User
1. Go to your Supabase project
2. Navigate to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Enter email and password
5. **Before clicking "Create user"**, expand the **User Metadata** section
6. Add a custom metadata field:
   - Key: `role`
   - Value: `leader`, `manager`, or `admin` (choose one)
7. Click **Create user**

### Step 2: Update Existing Users (via Dashboard)

1. Go to **Authentication** → **Users**
2. Find the user you want to update
3. Click on the user to view their details
4. Scroll down to **Raw User Meta Data** or **Raw App Meta Data**
5. Click **Edit**
6. Add or update the `role` field:

**For user_metadata** (for the user themselves to see):
```json
{
  "role": "leader"
}
```

**For app_metadata** (for application-level data, user can't change):
```json
{
  "role": "manager"
}
```

7. Click **Save**

## Method 2: Adding Role via SQL (Admin Only)

If you need to bulk update users, you can use the SQL Editor:

```sql
-- Update user metadata with role
UPDATE auth.users
SET 
  raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"leader"'
  )
WHERE email = 'leader@example.com';

-- Or for app metadata (more secure, user can't change it)
UPDATE auth.users
SET 
  raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    '"manager"'
  )
WHERE email = 'manager@example.com';
```

**Important**: Using `app_metadata` is more secure because users cannot modify it themselves, while they can modify `user_metadata`.

## Method 3: Programmatically Add Role During Sign Up

If you want to add a role when users sign up programmatically, you can modify the sign-up process (if needed in the future):

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      role: 'leader' // This will be stored in user_metadata
    }
  }
});
```

## Quick Setup for Testing

### Option A: Using the Dashboard (Easiest)

1. Create users in the Supabase Auth dashboard
2. For each user, add metadata:
   - Click on the user → Edit → Add to metadata
   - Key: `role`
   - Value: `leader`, `manager`, or `admin`

### Option B: Using SQL (Fastest for Multiple Users)

Run this in your Supabase SQL Editor to set up test users:

```sql
-- First, create users manually in the Auth section, then update their metadata

-- Set a user as leader (replace email with actual user email)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"leader"'
)
WHERE email = 'leader@test.com';

-- Set a user as manager
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"manager"'
)
WHERE email = 'manager@test.com';

-- Set a user as admin
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@test.com';
```

## Verification

After setting the role, you can verify it by checking the user in the Supabase dashboard:
1. Go to **Authentication** → **Users**
2. Click on a user
3. Check the **Raw User Meta Data** or **Raw App Meta Data** section
4. You should see:
```json
{
  "role": "leader"
}
```

## Important Notes

1. **No separate users table needed**: The role is now stored directly in the Supabase Auth user's metadata
2. **Metadata fields**:
   - `user_metadata`: User-editable metadata (can be changed by the user)
   - `app_metadata`: Application-only metadata (user cannot change)
3. **Recommended**: Use `app_metadata` for role to prevent users from changing their own role
4. **Security**: `app_metadata` is the more secure choice for roles

## Difference Between user_metadata and app_metadata

- **user_metadata**: 
  - User can view and modify
  - Use for preferences, display names, etc.
  - Stored in `raw_user_meta_data` field
  
- **app_metadata**:
  - User cannot modify (only your app can)
  - Use for roles, permissions, flags
  - Stored in `raw_app_meta_data` field
  - **Recommended for roles** ✅

## Troubleshooting

**Issue**: "User role not assigned" error
- **Solution**: Make sure you added the `role` field to the user's metadata
- Check that the role value is exactly one of: `leader`, `manager`, `admin` (lowercase)

**Issue**: Role changes not reflecting
- **Solution**: Sign out and sign back in
- Clear browser cache if needed

