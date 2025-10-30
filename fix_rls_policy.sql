-- Fix RLS Policy for Users Table
-- Run this in your Supabase SQL Editor (one block at a time)

-- STEP 1: Drop any existing conflicting policies
DROP POLICY IF EXISTS "Users can view own data" ON "Users";
DROP POLICY IF EXISTS "Authenticated users can read own role" ON "Users";
DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON "Users";

-- STEP 2: Create a simple policy to allow authenticated users to read roles
-- This allows any authenticated user to read from the Users table
-- (Use this for now to get it working - you can make it more restrictive later)
CREATE POLICY "Allow authenticated users to read roles"
ON "Users"
FOR SELECT
TO authenticated
USING (true);

-- STEP 3: Verify the policy was created (optional check)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'Users';

-- ============================================
-- ALTERNATIVE: More Secure Policy (use after testing)
-- ============================================
-- If you want users to only read their OWN row, use this instead:
-- DROP POLICY IF EXISTS "Allow authenticated users to read roles" ON "Users";
-- CREATE POLICY "Authenticated users can read own role"
-- ON "Users"
-- FOR SELECT
-- TO authenticated
-- USING (
--   (SELECT email::text FROM auth.users WHERE id = auth.uid()) = "Users".email
-- );

-- After running STEP 1 and STEP 2, try signing in again!
-- No need to restart the app - just refresh the page and try logging in.

