import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api/auth';
import { AttendanceService, EmployeeInput } from '@/lib/services/attendanceService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
            console.error('Authentication failed:', authError);
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log(`Fetching employees for user: ${user.email} (role: ${user.role})`);


        AttendanceService.cleanupExpiredEmployees().catch(err => {
            console.error('Background cleanup failed:', err);
        });


        const result = await AttendanceService.getEmployees();

        console.log('getEmployees result:', {
            success: result.success,
            dataLength: result.data?.length,
            error: result.error
        });

        if (result.success) {
            return NextResponse.json(result, { status: 200 });
        } else {
            console.error('Failed to fetch employees:', result.error);
            return NextResponse.json(
                {
                    success: false,
                    error: result.error || 'Failed to fetch employees',
                    data: []
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API Route error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
                data: []
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/employees
 * Create a new employee
 * Requires: leader or admin role
 */
export async function POST(request: NextRequest) {
    try {

        const { user, error: authError } = await verifyAuth(['leader', 'admin']);

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        if (!body.token_no || !body.name) {
            return NextResponse.json(
                { error: 'Token number and name are required' },
                { status: 400 }
            );
        }

        const employeeData: EmployeeInput = {
            token_no: body.token_no,
            name: body.name,
            group: body.group || null,
            desig: body.desig || body.designation || null,
            role: body.role || null,
            employment_start_date: body.employment_start_date || null,
            employment_end_date: body.employment_end_date || null,
        };

        const result = await AttendanceService.createEmployee(employeeData);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Employee created successfully',
                data: result.data,
            }, { status: 201 });
        } else {
            const statusCode = result.error?.includes('already exists') ? 409 : 500;
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to create employee',
            }, { status: statusCode });
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
 * PUT /api/employees
 * Update an existing employee
 * Requires: leader or admin role
 */
export async function PUT(request: NextRequest) {
    try {
        // Verify authentication - only leaders and admins can update employees
        const { user, error: authError } = await verifyAuth(['leader', 'admin']);

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();

        if (!body.token_no) {
            return NextResponse.json(
                { error: 'Token number is required' },
                { status: 400 }
            );
        }

        const updates: Partial<EmployeeInput> = {};
        if (body.name !== undefined) updates.name = body.name;
        if (body.group !== undefined) updates.group = body.group;
        if (body.desig !== undefined) updates.desig = body.desig;
        if (body.designation !== undefined) updates.desig = body.designation;
        if (body.role !== undefined) updates.role = body.role;
        if (body.new_token_no !== undefined) updates.token_no = body.new_token_no;
        if (body.employment_start_date !== undefined) updates.employment_start_date = body.employment_start_date || null;
        if (body.employment_end_date !== undefined) updates.employment_end_date = body.employment_end_date || null;

        const result = await AttendanceService.updateEmployee(body.token_no, updates);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Employee updated successfully',
                data: result.data,
            }, { status: 200 });
        } else {
            const statusCode = result.error?.includes('not found') ? 404 :
                result.error?.includes('already exists') ? 409 : 500;
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to update employee',
            }, { status: statusCode });
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
 * DELETE /api/employees
 * Delete an employee
 * Requires: leader or admin role
 */
export async function DELETE(request: NextRequest) {
    try {
        // Verify authentication - only leaders and admins can delete employees
        const { user, error: authError } = await verifyAuth(['leader', 'admin']);

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get token_no from query params
        const { searchParams } = new URL(request.url);
        const token_no = searchParams.get('token_no');

        if (!token_no) {
            return NextResponse.json(
                { error: 'Token number is required' },
                { status: 400 }
            );
        }

        const result = await AttendanceService.deleteEmployee(token_no);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Employee deleted successfully',
            }, { status: 200 });
        } else {
            const statusCode = result.error?.includes('not found') ? 404 : 500;
            return NextResponse.json({
                success: false,
                error: result.error || 'Failed to delete employee',
            }, { status: statusCode });
        }
    } catch (error) {
        console.error('API Route error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

