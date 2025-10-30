'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: ('leader' | 'manager' | 'admin')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/');
            } else if (!allowedRoles.includes(user.role)) {
                // Redirect based on user's role if they don't have access
                if (user.role === 'leader') {
                    router.push('/group-leader');
                } else if (user.role === 'manager' || user.role === 'admin') {
                    router.push('/dashboard');
                }
            }
        }
    }, [user, loading, allowedRoles, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return null;
    }

    return <>{children}</>;
}

