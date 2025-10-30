import { createClient } from './supabase/client';

export interface User {
    email: string;
    role: 'leader' | 'manager' | 'admin';
}

export async function signIn(email: string, password: string): Promise<{ user: User | null; error: string | null }> {
    const supabase = createClient();

    try {
        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            return { user: null, error: error.message };
        }

        if (!data.user) {
            return { user: null, error: 'Authentication failed' };
        }

        // Fetch role from Users table (case-sensitive)
        // Query after successful auth, so user session is active
        const { data: userDataArray, error: userError } = await supabase
            .from('Users')
            .select('role')
            .eq('email', email)
            .limit(1);

        console.log('Query result:', { userDataArray, userError, email, authUser: data.user.email });

        // Check if user exists in Users table
        if (userError) {
            console.error('Error fetching user role:', userError);
            // RLS policy issue - permission denied (error code 42501)
            if (userError.code === '42501' || userError.code === 'PGRST301' || userError.message?.includes('permission denied') || userError.message?.includes('policy')) {
                return {
                    user: null,
                    error: 'Permission denied. Please check RLS policies on Users table. Run the SQL in fix_rls_policy.sql file.'
                };
            }
            return { user: null, error: 'User role not found. Please contact administrator.' };
        }

        if (!userDataArray || userDataArray.length === 0) {
            console.error(`No user found in Users table for email: ${email}`);
            console.error('Make sure RLS policies allow reading from Users table');
            return {
                user: null,
                error: 'User account exists but role is not assigned. Please contact administrator to set your role.'
            };
        }

        const userData = userDataArray[0];
        const role = userData.role;

        if (!role || !['leader', 'manager', 'admin'].includes(role)) {
            return { user: null, error: 'User role not assigned. Please contact administrator.' };
        }

        const user: User = {
            email: data.user.email!,
            role: role as 'leader' | 'manager' | 'admin',
        };

        return { user, error: null };
    } catch (error) {
        return { user: null, error: 'An unexpected error occurred' };
    }
}

export async function signOut(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
    const supabase = createClient();

    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || !user.email) {
            return null;
        }

        // Fetch role from Users table (case-sensitive)
        const { data: userDataArray, error: userError } = await supabase
            .from('Users')
            .select('role')
            .eq('email', user.email);

        if (userError || !userDataArray || userDataArray.length === 0) {
            return null;
        }

        const userData = userDataArray[0];
        const role = userData.role;

        if (!role || !['leader', 'manager', 'admin'].includes(role)) {
            return null;
        }

        return {
            email: user.email,
            role: role as 'leader' | 'manager' | 'admin',
        };
    } catch (error) {
        return null;
    }
}


