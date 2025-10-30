import GroupLeaderPanel from "@/components/views/GroupLeaderPanel";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Force dynamic rendering since this page uses auth context
export const dynamic = 'force-dynamic';

export default function GroupLeaderPage() {
    return (
        <ProtectedRoute allowedRoles={['leader']}>
            <GroupLeaderPanel />
        </ProtectedRoute>
    );
}
