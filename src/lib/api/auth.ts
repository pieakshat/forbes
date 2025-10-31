import { createClient } from '../supabase/server';
import { User } from '../auth';

/**
 * Verify that the user is authenticated and has the required role
 */
export async function verifyAuth(allowedRoles?: ('manager' | 'admin')[]): Promise<{ user: User | null; error: string | null }> {
    try {
        const supabase = await createClient();

        // Get the authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser || !authUser.email) {
            return { user: null, error: 'Unauthorized: Authentication required' };
        }

        // Fetch role from Users table
        const { data: userDataArray, error: userError } = await supabase
            .from('Users')
            .select('role')
            .eq('email', authUser.email)
            .limit(1);

        if (userError || !userDataArray || userDataArray.length === 0) {
            return { user: null, error: 'Unauthorized: User role not found' };
        }

        const userRole = userDataArray[0].role as 'leader' | 'manager' | 'admin';
        const user: User = {
            email: authUser.email,
            role: userRole,
        };

        // Check if user has required role
        if (allowedRoles) {
            const hasAllowedRole = allowedRoles.some(role => role === userRole);
            if (!hasAllowedRole) {
                return { user: null, error: `Unauthorized: Requires role ${allowedRoles.join(' or ')}` };
            }
        }

        return { user, error: null };
    } catch (error) {
        console.error('Auth verification error:', error);
        return { user: null, error: 'Internal server error during authentication' };
    }
}

