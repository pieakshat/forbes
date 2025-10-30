import Dashboard from "@/components/views/Dashboard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['manager', 'admin']}>
            <Dashboard />
        </ProtectedRoute>
    );
}
