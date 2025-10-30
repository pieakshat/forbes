'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signIn as authSignIn, signOut as authSignOut, getCurrentUser } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();
    const { toast } = useToast();

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        // Handle route protection based on user role
        if (!loading && user) {
            if (pathname === '/') {
                // Redirect based on role
                if (user.role === 'leader') {
                    router.push('/group-leader');
                } else if (user.role === 'manager' || user.role === 'admin') {
                    router.push('/dashboard');
                }
            }
        } else if (!loading && !user && pathname !== '/') {
            // Redirect to login if not authenticated and not on login page
            router.push('/');
        }
    }, [loading, user, pathname, router]);

    const checkUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error('Error checking user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { user: signedInUser, error } = await authSignIn(email, password);

            if (error) {
                toast({
                    title: 'Authentication Failed',
                    description: error,
                    variant: 'destructive',
                });
                return;
            }

            if (!signedInUser) {
                toast({
                    title: 'Error',
                    description: 'Sign in failed. Please try again.',
                    variant: 'destructive',
                });
                return;
            }

            setUser(signedInUser);

            toast({
                title: 'Login Successful',
                description: `Welcome back! Redirecting to your dashboard...`,
            });

            // Redirect based on role
            if (signedInUser.role === 'leader') {
                router.push('/group-leader');
            } else if (signedInUser.role === 'manager' || signedInUser.role === 'admin') {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Sign in error:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const signOut = async () => {
        try {
            await authSignOut();
            setUser(null);
            router.push('/');
            toast({
                title: 'Logged Out',
                description: 'You have been successfully logged out',
            });
        } catch (error) {
            console.error('Sign out error:', error);
            toast({
                title: 'Error',
                description: 'Failed to log out',
                variant: 'destructive',
            });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

