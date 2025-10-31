import { createClient } from '../supabase/server';

export interface Employee {
    token_no: string;
    name: string;
    group: string | null;
    desig: string | null;
    role: string | null;
    created_at: string;
}

export interface AttendanceRecord {
    id: number;
    token_no: string;
    attendance_date: string;
    status: 'present' | 'absent' | 'leave' | 'half_day' | 'holiday' | 'remote';
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

            const { data, error } = await supabase
                .from('employees')
                .select('*')
                .order('name', { ascending: true });

            if (error) {
                console.error('Error fetching employees:', error);
                return {
                    success: false,
                    error: `Failed to fetch employees: ${error.message}`,
                };
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
}

