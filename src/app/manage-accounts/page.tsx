import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ManageAccountsPanel from "@/components/views/ManageAccountsPanel";

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

export default function ManageAccountsPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <ManageAccountsPanel />
        </ProtectedRoute>
    );
}

