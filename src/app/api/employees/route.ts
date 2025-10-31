import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api/auth';
import { AttendanceService } from '@/lib/services/attendanceService';

/**
 * GET /api/employees
 * Get all employees
 * Requires: leader, manager, or admin role
 */
export async function GET(request: NextRequest) {
    try {
        // Verify authentication - leaders, managers, and admins can access
        const { user, error: authError } = await verifyAuth();

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Fetch employees
        const result = await AttendanceService.getEmployees();

        if (result.success) {
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json(
                { error: result.error || 'Failed to fetch employees' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API Route error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

