import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api/auth';
import { AttendanceService, AttendanceInput } from '@/lib/services/attendanceService';

/**
 * GET /api/attendance
 * Get attendance records
 * Query params: date, startDate, endDate, token_no
 * Requires: leader, manager, or admin role
 */
export async function GET(request: NextRequest) {
    try {
        // Verify authentication
        const { user, error: authError } = await verifyAuth();

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date') || undefined;
        const startDate = searchParams.get('startDate') || undefined;
        const endDate = searchParams.get('endDate') || undefined;
        const token_no = searchParams.get('token_no') || undefined;

        // Fetch attendance
        const result = await AttendanceService.getAttendance({
            date,
            startDate,
            endDate,
            token_no,
        });

        if (result.success) {
            return NextResponse.json(result, { status: 200 });
        } else {
            return NextResponse.json(
                { error: result.error || 'Failed to fetch attendance' },
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

/**
 * POST /api/attendance
 * Create or update attendance record(s)
 * Body: { records: AttendanceInput[] } for bulk, or AttendanceInput for single
 * Requires: leader, manager, or admin role
 */
export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const { user, error: authError } = await verifyAuth();

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get current user ID
        const { createClient } = await import('@/lib/supabase/server');
        const supabase = await createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const userId = authUser?.id;

        // Parse request body
        const body = await request.json();

        // Check if it's a bulk operation
        if (Array.isArray(body.records) && body.records.length > 0) {
            // Bulk upsert
            const result = await AttendanceService.bulkUpsertAttendance(
                body.records,
                userId
            );

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    message: `Successfully saved ${result.recordsUpdated} attendance records`,
                    recordsUpdated: result.recordsUpdated,
                    data: result.data,
                    errors: result.errors,
                }, { status: 200 });
            } else {
                return NextResponse.json({
                    success: false,
                    error: 'Failed to save attendance records',
                    recordsUpdated: result.recordsUpdated,
                    errors: result.errors,
                }, { status: 500 });
            }
        } else if (body.token_no && body.attendance_date && body.status) {
            // Single record
            const record: AttendanceInput = {
                token_no: body.token_no,
                attendance_date: body.attendance_date,
                status: body.status,
                notes: body.notes || null,
            };

            const result = await AttendanceService.upsertAttendance(record, userId);

            if (result.success) {
                return NextResponse.json({
                    success: true,
                    message: 'Attendance saved successfully',
                    data: result.data,
                }, { status: 200 });
            } else {
                const statusCode = result.error?.includes('not found') ||
                    result.error?.includes('Invalid')
                    ? 400
                    : 500;
                return NextResponse.json({
                    success: false,
                    error: result.error || 'Failed to save attendance',
                }, { status: statusCode });
            }
        } else {
            return NextResponse.json(
                { error: 'Invalid request body. Expected { records: [...] } or { token_no, attendance_date, status }' },
                { status: 400 }
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

