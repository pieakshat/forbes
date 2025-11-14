import { createClient } from '../supabase/server';

export interface Employee {
    token_no: string;
    name: string;
    group: string | null;
    desig: string | null;
    role: string | null;
    created_at: string;
}

export interface EmployeeInput {
    token_no: string;
    name: string;
    group?: string | null;
    desig?: string | null;
    role?: string | null;
}

export interface AttendanceRecord {
    id: number;
    token_no: string;
    attendance_date: string;
    status: 'present' | 'absent' | 'leave' | 'half_day' | 'holiday' | 'remote';
    group: string | null;
    check_in: string | null;
    check_out: string | null;
    device_info: string | null;
    location: string | null;
    notes: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export interface AttendanceInput {
    token_no: string;
    attendance_date: string;
    status: 'present' | 'absent' | 'leave' | 'half_day' | 'holiday' | 'remote';
    group?: string | null;
    notes?: string | null;
}

/**
 * Service class for handling employee and attendance operations
 * All business logic is server-side only
 */
export class AttendanceService {
    /**
     * Get all employees
     */
    static async getEmployees(): Promise<{
        success: boolean;
        data?: Employee[];
        error?: string;
    }> {
        try {
            const supabase = await createClient();

            console.log('Fetching employees from database...');

            // First, let's test if we can access the table at all
            const { data: testData, error: testError } = await supabase
                .from('employees')
                .select('*')
                .limit(1);

            if (testError) {
                console.error('Test query error:', testError);
                console.error('Error code:', testError.code);
                console.error('Error message:', testError.message);
                console.error('Error details:', testError.details);
                console.error('Error hint:', testError.hint);

                // Check if it's an RLS issue
                if (testError.code === '42501' || testError.message?.includes('permission denied') || testError.message?.includes('policy')) {
                    return {
                        success: false,
                        error: 'Permission denied. Please check RLS (Row Level Security) policies on the employees table. The table may be protected by security policies.',
                    };
                }

                return {
                    success: false,
                    error: `Failed to fetch employees: ${testError.message} (Code: ${testError.code})`,
                };
            }

            // Now fetch all employees with explicit column selection
            const { data, error } = await supabase
                .from('employees')
                .select('token_no, name, group, desig, role, created_at')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching employees:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                return {
                    success: false,
                    error: `Failed to fetch employees: ${error.message}`,
                };
            }

            console.log(`Successfully fetched ${data?.length || 0} employees from database`);
            if (data && data.length > 0) {
                console.log('Sample employee:', JSON.stringify(data[0], null, 2));
            } else {
                console.log('No employees found in database. Table exists but is empty.');
            }

            return { success: true, data: data || [] };
        } catch (error) {
            console.error('AttendanceService getEmployees error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Get attendance records for a specific date or date range
     */
    static async getAttendance(params?: {
        date?: string;
        startDate?: string;
        endDate?: string;
        token_no?: string;
    }): Promise<{
        success: boolean;
        data?: AttendanceRecord[];
        error?: string;
    }> {
        try {
            const supabase = await createClient();

            let query = supabase
                .from('attendance')
                .select('*')
                .order('attendance_date', { ascending: false })
                .order('token_no', { ascending: true });

            if (params?.date) {
                query = query.eq('attendance_date', params.date);
            } else if (params?.startDate && params?.endDate) {
                query = query
                    .gte('attendance_date', params.startDate)
                    .lte('attendance_date', params.endDate);
            }

            if (params?.token_no) {
                query = query.eq('token_no', params.token_no);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching attendance:', error);
                return {
                    success: false,
                    error: `Failed to fetch attendance: ${error.message}`,
                };
            }

            return { success: true, data: data || [] };
        } catch (error) {
            console.error('AttendanceService getAttendance error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Create or update attendance record
     * Uses upsert to handle duplicate key constraint
     */
    static async upsertAttendance(
        record: AttendanceInput,
        userId?: string
    ): Promise<{
        success: boolean;
        data?: AttendanceRecord;
        error?: string;
    }> {
        try {
            const supabase = await createClient();

            // Validate status
            const validStatuses = ['present', 'absent', 'leave', 'half_day', 'holiday', 'remote'];
            if (!validStatuses.includes(record.status)) {
                return {
                    success: false,
                    error: `Invalid status: ${record.status}. Must be one of: ${validStatuses.join(', ')}`,
                };
            }

            // Validate date format
            if (!record.attendance_date || !/^\d{4}-\d{2}-\d{2}$/.test(record.attendance_date)) {
                return {
                    success: false,
                    error: 'Invalid date format. Expected YYYY-MM-DD',
                };
            }

            // Verify employee exists
            const { data: employee, error: employeeError } = await supabase
                .from('employees')
                .select('token_no')
                .eq('token_no', record.token_no)
                .single();

            if (employeeError || !employee) {
                return {
                    success: false,
                    error: `Employee with token number ${record.token_no} not found`,
                };
            }

            // Prepare data for upsert
            const attendanceData: any = {
                token_no: record.token_no,
                attendance_date: record.attendance_date,
                status: record.status,
                updated_at: new Date().toISOString(),
            };

            if (record.group !== undefined) {
                attendanceData.group = record.group;
            }

            if (record.notes !== undefined) {
                attendanceData.notes = record.notes;
            }

            if (userId) {
                attendanceData.created_by = userId;
            }

            // Upsert (insert or update on conflict)
            const { data, error } = await supabase
                .from('attendance')
                .upsert(attendanceData, {
                    onConflict: 'token_no,attendance_date',
                })
                .select()
                .single();

            if (error) {
                console.error('Error upserting attendance:', error);
                return {
                    success: false,
                    error: `Failed to save attendance: ${error.message}`,
                };
            }

            return { success: true, data };
        } catch (error) {
            console.error('AttendanceService upsertAttendance error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Bulk upsert attendance records
     */
    static async bulkUpsertAttendance(
        records: AttendanceInput[],
        userId?: string
    ): Promise<{
        success: boolean;
        data?: AttendanceRecord[];
        recordsUpdated: number;
        errors?: string[];
    }> {
        try {
            const results: AttendanceRecord[] = [];
            const errors: string[] = [];

            // Process in batches to avoid overwhelming the database
            const BATCH_SIZE = 50;
            for (let i = 0; i < records.length; i += BATCH_SIZE) {
                const batch = records.slice(i, i + BATCH_SIZE);

                const batchPromises = batch.map(record =>
                    this.upsertAttendance(record, userId)
                );

                const batchResults = await Promise.allSettled(batchPromises);

                batchResults.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value.success && result.value.data) {
                        results.push(result.value.data);
                    } else {
                        const error = result.status === 'fulfilled'
                            ? result.value.error || 'Unknown error'
                            : result.reason?.message || 'Unknown error';
                        errors.push(`Token ${batch[index].token_no}: ${error}`);
                    }
                });

                // Small delay between batches
                if (i + BATCH_SIZE < records.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            return {
                success: errors.length === 0,
                data: results,
                recordsUpdated: results.length,
                errors: errors.length > 0 ? errors : undefined,
            };
        } catch (error) {
            console.error('AttendanceService bulkUpsertAttendance error:', error);
            return {
                success: false,
                recordsUpdated: 0,
                errors: [error instanceof Error ? error.message : 'Unknown error'],
            };
        }
    }

    /**
     * Create a new employee
     */
    static async createEmployee(
        employee: EmployeeInput
    ): Promise<{
        success: boolean;
        data?: Employee;
        error?: string;
    }> {
        try {
            const supabase = await createClient();

            // Validate required fields
            if (!employee.token_no || !employee.name) {
                return {
                    success: false,
                    error: 'Token number and name are required',
                };
            }

            // Check if employee with same token_no already exists
            const { data: existing, error: checkError } = await supabase
                .from('employees')
                .select('token_no')
                .eq('token_no', employee.token_no)
                .single();

            if (existing) {
                return {
                    success: false,
                    error: `Employee with token number ${employee.token_no} already exists`,
                };
            }

            // Sanitize input
            const employeeData = {
                token_no: employee.token_no.trim(),
                name: employee.name.trim(),
                group: employee.group?.trim() || null,
                desig: employee.desig?.trim() || null,
                role: employee.role?.trim() || null,
            };

            // Insert employee
            const { data, error } = await supabase
                .from('employees')
                .insert(employeeData)
                .select()
                .single();

            if (error) {
                console.error('Error creating employee:', error);
                return {
                    success: false,
                    error: `Failed to create employee: ${error.message}`,
                };
            }

            return { success: true, data };
        } catch (error) {
            console.error('AttendanceService createEmployee error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Update an existing employee
     */
    static async updateEmployee(
        token_no: string,
        updates: Partial<EmployeeInput>
    ): Promise<{
        success: boolean;
        data?: Employee;
        error?: string;
    }> {
        try {
            const supabase = await createClient();

            // Check if employee exists
            const { data: existing, error: checkError } = await supabase
                .from('employees')
                .select('token_no')
                .eq('token_no', token_no)
                .single();

            if (checkError || !existing) {
                return {
                    success: false,
                    error: `Employee with token number ${token_no} not found`,
                };
            }

            // Prepare update data
            const updateData: any = {};

            if (updates.name !== undefined) {
                updateData.name = updates.name.trim();
            }
            if (updates.group !== undefined) {
                updateData.group = updates.group?.trim() || null;
            }
            if (updates.desig !== undefined) {
                updateData.desig = updates.desig?.trim() || null;
            }
            if (updates.role !== undefined) {
                updateData.role = updates.role?.trim() || null;
            }

            // If token_no is being updated, check if new token_no already exists
            if (updates.token_no && updates.token_no !== token_no) {
                const { data: duplicate } = await supabase
                    .from('employees')
                    .select('token_no')
                    .eq('token_no', updates.token_no.trim())
                    .single();

                if (duplicate) {
                    return {
                        success: false,
                        error: `Employee with token number ${updates.token_no} already exists`,
                    };
                }
                updateData.token_no = updates.token_no.trim();
            }

            // Update employee
            const { data, error } = await supabase
                .from('employees')
                .update(updateData)
                .eq('token_no', token_no)
                .select()
                .single();

            if (error) {
                console.error('Error updating employee:', error);
                return {
                    success: false,
                    error: `Failed to update employee: ${error.message}`,
                };
            }

            return { success: true, data };
        } catch (error) {
            console.error('AttendanceService updateEmployee error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Delete an employee
     */
    static async deleteEmployee(
        token_no: string
    ): Promise<{
        success: boolean;
        error?: string;
    }> {
        try {
            const supabase = await createClient();

            // Check if employee exists
            const { data: existing, error: checkError } = await supabase
                .from('employees')
                .select('token_no')
                .eq('token_no', token_no)
                .single();

            if (checkError || !existing) {
                return {
                    success: false,
                    error: `Employee with token number ${token_no} not found`,
                };
            }

            // Delete employee (CASCADE will handle related attendance records)
            const { error } = await supabase
                .from('employees')
                .delete()
                .eq('token_no', token_no);

            if (error) {
                console.error('Error deleting employee:', error);
                return {
                    success: false,
                    error: `Failed to delete employee: ${error.message}`,
                };
            }

            return { success: true };
        } catch (error) {
            console.error('AttendanceService deleteEmployee error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }
}

