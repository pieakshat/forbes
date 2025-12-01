import { createClient } from '../supabase/server';
import {
    differenceInCalendarDays,
    format,
    subMilliseconds,
} from 'date-fns';
import type {
    DashboardChartPoint,
    DashboardMetricsResult,
    DashboardTableData,
} from '@/types/dashboard';

type AttendanceStatus =
    | 'present'
    | 'absent'
    | 'leave'
    | 'half_day'
    | 'holiday'

interface AttendanceRecordSlim {
    token_no: string;
    attendance_date: string;
    status: AttendanceStatus;
}

interface EmployeeSlim {
    token_no: string;
    group: string | null;
}

interface FGCompletionRecordSlim {
    ['Transaction Date']: string | null;
    ['Index factor']: number | null;
    ['Index Qty']: number | null;
    ['Class']?: string | null;
    ['Dept Code']?: string | null;
    ['Item Type']?: string | null;
    ['FG Under FG']?: string | null;
}

interface DayMetrics {
    date: string;
    manpower: number;
    absentees: number;
    absenteeismPercent: number;
    indexedCapacityAt100: number;
    indexedCapacityWithAbsence: number;
    indexedFgCompletionValue: number;
    indexedFgCompletionPercent: number;
    capacityUtilizationPercent: number;
}

const ABSENCE_WEIGHTS: Record<AttendanceStatus, number> = {
    present: 0,
    absent: 1,
    leave: 1,
    half_day: 0.5,
    holiday: 0,
};

const FG_GROUP_COLUMNS = ['Class', 'Dept Code', 'Item Type', 'FG Under FG'] as const;

function toDateKey(value: string | null): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        const normalized = value.replace(/T.+$/, '');
        return normalized || null;
    }
    return format(date, 'yyyy-MM-dd');
}

function formatHeaderDay(date: Date): string {
    return format(date, 'd-MMM');
}

function formatChartLabel(date: Date): string {
    return format(date, 'd-MMM');
}

function isGroupMatch(record: FGCompletionRecordSlim, group: string): boolean {
    const normalizedTarget = group.trim().toLowerCase();
    return FG_GROUP_COLUMNS.some((column) => {
        const value = record[column];
        if (!value || typeof value !== 'string') return false;
        return value.trim().toLowerCase() === normalizedTarget;
    });
}

function round(value: number, decimals = 2): number {
    if (!Number.isFinite(value)) return 0;
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}

export class DashboardService {
    static async getGroupMetrics(params: {
        group: string;
        month: number;
        year: number;
    }): Promise<DashboardMetricsResult> {
        const { group } = params;
        let { month, year } = params;

        if (!group) {
            throw new Error('Group is required to compute dashboard metrics.');
        }

        if (!month || month < 1 || month > 12) {
            const now = new Date();
            month = now.getUTCMonth() + 1;
            year = now.getUTCFullYear();
        }

        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 1));
        const endOfMonth = subMilliseconds(endDate, 1);
        const daysInMonth =
            differenceInCalendarDays(endOfMonth, startDate) + 1;

        const startDateKey = format(startDate, 'yyyy-MM-dd');
        const endDateKey = format(endOfMonth, 'yyyy-MM-dd');

        const supabase = await createClient();

        const { data: employees, error: employeesError } = await supabase
            .from('employees')
            .select('token_no, group')
            .eq('group', group);

        if (employeesError) {
            throw new Error(
                `Failed to fetch employees for group ${group}: ${employeesError.message}`,
            );
        }

        const employeeList = (employees || []) as EmployeeSlim[];
        const tokenNos = employeeList.map((employee) => employee.token_no);

        const { data: attendanceData, error: attendanceError } = await supabase
            .from('attendance')
            .select('token_no, attendance_date, status')
            .eq('group', group)
            .gte('attendance_date', startDateKey)
            .lte('attendance_date', endDateKey);

        if (attendanceError) {
            throw new Error(`Failed to fetch attendance: ${attendanceError.message}`);
        }

        const attendanceRecords = (attendanceData || []) as AttendanceRecordSlim[];

        let manpowerPerDay = employeeList.length;
        if (manpowerPerDay === 0 && attendanceRecords.length > 0) {
            const uniqueTokens = new Set(attendanceRecords.map(r => r.token_no));
            manpowerPerDay = uniqueTokens.size;
            console.warn(
                `No employees found in employees table for group "${group}", ` +
                `but found ${manpowerPerDay} unique employees in attendance records. ` +
                `Using attendance data for manpower calculation.`
            );
        }

        if (attendanceRecords.length === 0) {
            console.warn(
                `No attendance records found for group "${group}" in date range ${startDateKey} to ${endDateKey}. ` +
                `Employees in group: ${employeeList.length}`
            );
        }

        const attendanceAbsenceMap = new Map<string, number>();
        for (const record of attendanceRecords) {
            const dateKey = record.attendance_date;
            const weight = ABSENCE_WEIGHTS[record.status] ?? 0;
            if (weight <= 0) continue;
            const uniqueKey = `${dateKey}_${record.token_no}`;
            const existing = attendanceAbsenceMap.get(uniqueKey) ?? 0;
            if (weight > existing) {
                attendanceAbsenceMap.set(uniqueKey, weight);
            }
        }

        const absenceByDate = new Map<string, number>();
        Array.from(attendanceAbsenceMap.entries()).forEach(([compositeKey, weight]) => {
            const [dateKey] = compositeKey.split('_');
            const current = absenceByDate.get(dateKey) ?? 0;
            absenceByDate.set(dateKey, current + weight);
        });

        const { data: fgDataRaw, error: fgError } = await supabase
            .from('FG_Completion')
            .select(
                '"Transaction Date","Index factor","Index Qty","Class","Dept Code","Item Type","FG Under FG"',
            )
            .gte('"Transaction Date"', startDateKey)
            .lte('"Transaction Date"', endDateKey);

        if (fgError) {
            throw new Error(`Failed to fetch FG completion data: ${fgError.message}`);
        }

        const fgData = (fgDataRaw || []) as FGCompletionRecordSlim[];
        const filteredFgData = fgData.filter((record) => isGroupMatch(record, group));

        if (fgData.length > 0 && filteredFgData.length === 0) {
            console.warn(
                `No FG completion records matched for group "${group}". ` +
                `Total FG records: ${fgData.length}. ` +
                `Sample FG record columns: Class="${fgData[0]?.['Class']}", ` +
                `Dept Code="${fgData[0]?.['Dept Code']}", ` +
                `Item Type="${fgData[0]?.['Item Type']}", ` +
                `FG Under FG="${fgData[0]?.['FG Under FG']}"`
            );
        }

        const fgByDate = new Map<
            string,
            { indexFactor: number; indexQty: number }
        >();

        for (const record of filteredFgData) {
            const dateKey = toDateKey(record['Transaction Date']);
            if (!dateKey) continue;
            const indexFactor = record['Index factor'] ?? 0;
            const indexQty = record['Index Qty'] ?? 0;

            const current = fgByDate.get(dateKey) ?? { indexFactor: 0, indexQty: 0 };
            current.indexFactor += indexFactor;
            current.indexQty += indexQty;
            fgByDate.set(dateKey, current);
        }

        const CAPACITY_FACTOR = 435 / 17;

        const dayMetrics: DayMetrics[] = [];
        let manpowerTotal = 0;
        let absenteeismTotal = 0;
        let indexCapacityTotal = 0;
        let indexCapacityAbsTotal = 0;
        let fgCompletionPercentTotal = 0;
        let capacityUtilizationPercentTotal = 0;

        for (let i = 0; i < daysInMonth; i += 1) {
            const currentDate = new Date(
                Date.UTC(year, month - 1, startDate.getUTCDate() + i),
            );
            const dateKey = format(currentDate, 'yyyy-MM-dd');
            const manpower = manpowerPerDay;
            const absentees = absenceByDate.get(dateKey) ?? 0;

            const absenteeismPercent =
                manpower > 0 ? (absentees / manpower) * 100 : 0;

            const indexedCapacityAt100 = manpower * CAPACITY_FACTOR;

            const fgEntry = fgByDate.get(dateKey) ?? { indexFactor: 0, indexQty: 0 };
            const indexedFgCompletionValue = fgEntry.indexQty;

            const indexedFgCompletionPercent =
                indexedCapacityAt100 > 0
                    ? (indexedFgCompletionValue / indexedCapacityAt100) * 100
                    : 0;

            const indexedCapacityWithAbsence =
                indexedCapacityAt100 * (1 - absenteeismPercent / 100);

            const capacityUtilizationPercent =
                indexedCapacityWithAbsence > 0
                    ? (indexedFgCompletionValue / indexedCapacityWithAbsence) * 100
                    : 0;

            dayMetrics.push({
                date: dateKey,
                manpower,
                absentees,
                absenteeismPercent: round(absenteeismPercent, 2),
                indexedCapacityAt100: round(indexedCapacityAt100, 2),
                indexedCapacityWithAbsence: round(indexedCapacityWithAbsence, 2),
                indexedFgCompletionValue: round(indexedFgCompletionValue, 2),
                indexedFgCompletionPercent: round(indexedFgCompletionPercent, 2),
                capacityUtilizationPercent: round(capacityUtilizationPercent, 2),
            });

            manpowerTotal += manpower;
            absenteeismTotal += absenteeismPercent;
            indexCapacityTotal += indexedCapacityAt100;
            indexCapacityAbsTotal += indexedCapacityWithAbsence;
            fgCompletionPercentTotal += indexedFgCompletionPercent;
            capacityUtilizationPercentTotal += capacityUtilizationPercent;
        }

        const daysCount = dayMetrics.length || 1;

        const manpowerAverage = manpowerTotal / daysCount;
        const absenteeismAverage = absenteeismTotal / daysCount;
        const indexCapacityAverage = indexCapacityTotal / daysCount;
        const indexCapacityAbsAverage = indexCapacityAbsTotal / daysCount;
        const fgCompletionAverage = fgCompletionPercentTotal / daysCount;
        const capacityUtilizationAverage =
            capacityUtilizationPercentTotal / daysCount;

        const headers: string[] = ['Total', 'Average'];
        const chartData: DashboardChartPoint[] = [];

        const manpowerValues: number[] = [
            round(manpowerTotal, 2),
            round(manpowerAverage, 2),
        ];
        const capacityAt100Values: number[] = [
            round(indexCapacityTotal, 2),
            round(indexCapacityAverage, 2),
        ];
        const capacityWithAbsValues: number[] = [
            round(indexCapacityAbsTotal, 2),
            round(indexCapacityAbsAverage, 2),
        ];
        const fgCompletionPercentValues: number[] = [
            round(fgCompletionAverage, 2),
            round(fgCompletionAverage, 2),
        ];
        const absenteeismPercentValues: number[] = [
            round(absenteeismAverage, 2),
            round(absenteeismAverage, 2),
        ];
        const capacityUtilizationValues: number[] = [
            round(capacityUtilizationAverage, 2),
            round(capacityUtilizationAverage, 2),
        ];

        dayMetrics.forEach((metrics) => {
            const currentDate = new Date(metrics.date);
            headers.push(formatHeaderDay(currentDate));

            manpowerValues.push(round(metrics.manpower, 2));
            capacityAt100Values.push(round(metrics.indexedCapacityAt100, 2));
            capacityWithAbsValues.push(round(metrics.indexedCapacityWithAbsence, 2));
            fgCompletionPercentValues.push(round(metrics.indexedFgCompletionPercent, 2));
            absenteeismPercentValues.push(round(metrics.absenteeismPercent, 2));
            capacityUtilizationValues.push(round(metrics.capacityUtilizationPercent, 2));

            chartData.push({
                name: formatChartLabel(currentDate),
                indexFGCompletion: round(metrics.indexedFgCompletionValue, 2),
                capacityAt100: round(metrics.indexedCapacityAt100, 2),
                capacityWithAbs: round(metrics.indexedCapacityWithAbsence, 2),
                percentage: round(metrics.capacityUtilizationPercent, 2),
            });
        });

        const table: DashboardTableData = {
            headers,
            rows: [
                {
                    label: 'Manpower',
                    values: manpowerValues,
                    total: round(manpowerTotal, 2),
                    average: round(manpowerAverage, 2),
                },
                {
                    label: 'Indexed Capacity (at 100%)',
                    values: capacityAt100Values,
                    total: round(indexCapacityTotal, 2),
                    average: round(indexCapacityAverage, 2),
                },
                {
                    label: 'Indexed Capacity (with Actual Absenteeism)',
                    values: capacityWithAbsValues,
                    total: round(indexCapacityAbsTotal, 2),
                    average: round(indexCapacityAbsAverage, 2),
                },
                {
                    label: 'Index - FG completion (%)',
                    values: fgCompletionPercentValues,
                    total: round(fgCompletionAverage, 2),
                    average: round(fgCompletionAverage, 2),
                },
                {
                    label: 'Absenteeism (%)',
                    values: absenteeismPercentValues,
                    total: round(absenteeismAverage, 2),
                    average: round(absenteeismAverage, 2),
                },
                {
                    label: '% Capacity Utilization with Absenteeism',
                    values: capacityUtilizationValues,
                    total: round(capacityUtilizationAverage, 2),
                    average: round(capacityUtilizationAverage, 2),
                },
            ],
        };

        return {
            table,
            chart: chartData,
            summary: {
                manpowerTotal: round(manpowerTotal, 2),
                manpowerAverage: round(manpowerAverage, 2),
                absenteeismAverage: round(absenteeismAverage, 2),
                indexedFgCompletionAverage: round(fgCompletionAverage, 2),
                capacityUtilizationAverage: round(capacityUtilizationAverage, 2),
            },
            meta: {
                month,
                year,
                label: format(startDate, 'MMMM yyyy'),
                days: daysInMonth,
            },
        };
    }

    static async getAllGroupsMetrics(params: {
        month: number;
        year: number;
    }): Promise<DashboardMetricsResult & { activeGroupsCount: number }> {
        let { month, year } = params;

        if (!month || month < 1 || month > 12) {
            const now = new Date();
            month = now.getUTCMonth() + 1;
            year = now.getUTCFullYear();
        }

        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 1));
        const endOfMonth = subMilliseconds(endDate, 1);
        const daysInMonth =
            differenceInCalendarDays(endOfMonth, startDate) + 1;

        const startDateKey = format(startDate, 'yyyy-MM-dd');
        const endDateKey = format(endOfMonth, 'yyyy-MM-dd');

        const supabase = await createClient();

        const { data: employees, error: employeesError } = await supabase
            .from('employees')
            .select('token_no, group')
            .not('group', 'is', null);

        if (employeesError) {
            throw new Error(
                `Failed to fetch employees: ${employeesError.message}`,
            );
        }

        const employeeList = (employees || []) as EmployeeSlim[];
        const tokenNos = employeeList.map((employee) => employee.token_no);

        const uniqueGroups = new Set(
            employeeList
                .map((emp) => emp.group)
                .filter((g): g is string => g !== null)
        );
        const activeGroupsCount = uniqueGroups.size;

        const manpowerPerDay = employeeList.length;

        const attendanceRecords: AttendanceRecordSlim[] = [];
        const attendanceChunkSize = 100;

        for (let i = 0; i < tokenNos.length; i += attendanceChunkSize) {
            const chunk = tokenNos.slice(i, i + attendanceChunkSize);
            const { data, error } = await supabase
                .from('attendance')
                .select('token_no, attendance_date, status')
                .in('token_no', chunk)
                .gte('attendance_date', startDateKey)
                .lte('attendance_date', endDateKey);

            if (error) {
                throw new Error(`Failed to fetch attendance: ${error.message}`);
            }

            if (data) {
                attendanceRecords.push(...(data as AttendanceRecordSlim[]));
            }
        }

        const attendanceAbsenceMap = new Map<string, number>();
        for (const record of attendanceRecords) {
            const dateKey = record.attendance_date;
            const weight = ABSENCE_WEIGHTS[record.status] ?? 0;
            if (weight <= 0) continue;
            const uniqueKey = `${dateKey}_${record.token_no}`;
            const existing = attendanceAbsenceMap.get(uniqueKey) ?? 0;
            if (weight > existing) {
                attendanceAbsenceMap.set(uniqueKey, weight);
            }
        }

        const absenceByDate = new Map<string, number>();
        Array.from(attendanceAbsenceMap.entries()).forEach(([compositeKey, weight]) => {
            const [dateKey] = compositeKey.split('_');
            const current = absenceByDate.get(dateKey) ?? 0;
            absenceByDate.set(dateKey, current + weight);
        });

        const { data: fgDataRaw, error: fgError } = await supabase
            .from('FG_Completion')
            .select(
                '"Transaction Date","Index factor","Index Qty","Class","Dept Code","Item Type","FG Under FG"',
            )
            .gte('"Transaction Date"', startDateKey)
            .lte('"Transaction Date"', endDateKey);

        if (fgError) {
            throw new Error(`Failed to fetch FG completion data: ${fgError.message}`);
        }

        const fgData = (fgDataRaw || []) as FGCompletionRecordSlim[];

        const fgByDate = new Map<
            string,
            { indexFactor: number; indexQty: number }
        >();

        for (const record of fgData) {
            const dateKey = toDateKey(record['Transaction Date']);
            if (!dateKey) continue;
            const indexFactor = record['Index factor'] ?? 0;
            const indexQty = record['Index Qty'] ?? 0;

            const current = fgByDate.get(dateKey) ?? { indexFactor: 0, indexQty: 0 };
            current.indexFactor += indexFactor;
            current.indexQty += indexQty;
            fgByDate.set(dateKey, current);
        }

        const CAPACITY_FACTOR = 435 / 17;

        const dayMetrics: DayMetrics[] = [];
        let manpowerTotal = 0;
        let absenteeismTotal = 0;
        let indexCapacityTotal = 0;
        let indexCapacityAbsTotal = 0;
        let fgCompletionPercentTotal = 0;
        let capacityUtilizationPercentTotal = 0;

        for (let i = 0; i < daysInMonth; i += 1) {
            const currentDate = new Date(
                Date.UTC(year, month - 1, startDate.getUTCDate() + i),
            );
            const dateKey = format(currentDate, 'yyyy-MM-dd');
            const manpower = manpowerPerDay;
            const absentees = absenceByDate.get(dateKey) ?? 0;

            // Absenteeism (%) = Absentees (Nos) / Manpower
            const absenteeismPercent =
                manpower > 0 ? (absentees / manpower) * 100 : 0;

            // Indexed Capacity (at 100%) = Manpower x (435/17)
            const indexedCapacityAt100 = manpower * CAPACITY_FACTOR;

            // Indexed-FG completion: Fetched from FG completion data
            const fgEntry = fgByDate.get(dateKey) ?? { indexFactor: 0, indexQty: 0 };
            const indexedFgCompletionValue = fgEntry.indexQty;

            // Index - FG completion (%) = (Indexed-FG completion / Indexed Capacity at 100%) x 100
            const indexedFgCompletionPercent =
                indexedCapacityAt100 > 0
                    ? (indexedFgCompletionValue / indexedCapacityAt100) * 100
                    : 0;

            // Indexed Capacity (with Actual Absenteeism) = [Indexed Capacity (at 100%)] x [1 - Absenteeism (%)]
            const indexedCapacityWithAbsence =
                indexedCapacityAt100 * (1 - absenteeismPercent / 100);

            // % Capacity Utilisation with Absenteeism = Index - FG completion / Indexed Capacity (with Actual Absenteeism)
            const capacityUtilizationPercent =
                indexedCapacityWithAbsence > 0
                    ? (indexedFgCompletionValue / indexedCapacityWithAbsence) * 100
                    : 0;

            dayMetrics.push({
                date: dateKey,
                manpower,
                absentees,
                absenteeismPercent: round(absenteeismPercent, 2),
                indexedCapacityAt100: round(indexedCapacityAt100, 2),
                indexedCapacityWithAbsence: round(indexedCapacityWithAbsence, 2),
                indexedFgCompletionValue: round(indexedFgCompletionValue, 2),
                indexedFgCompletionPercent: round(indexedFgCompletionPercent, 2),
                capacityUtilizationPercent: round(capacityUtilizationPercent, 2),
            });

            manpowerTotal += manpower;
            absenteeismTotal += absenteeismPercent;
            indexCapacityTotal += indexedCapacityAt100;
            indexCapacityAbsTotal += indexedCapacityWithAbsence;
            fgCompletionPercentTotal += indexedFgCompletionPercent;
            capacityUtilizationPercentTotal += capacityUtilizationPercent;
        }

        const daysCount = dayMetrics.length || 1;

        const manpowerAverage = manpowerTotal / daysCount;
        const absenteeismAverage = absenteeismTotal / daysCount;
        const indexCapacityAverage = indexCapacityTotal / daysCount;
        const indexCapacityAbsAverage = indexCapacityAbsTotal / daysCount;
        const fgCompletionAverage = fgCompletionPercentTotal / daysCount;
        const capacityUtilizationAverage =
            capacityUtilizationPercentTotal / daysCount;

        const headers: string[] = ['Total', 'Average'];
        const chartData: DashboardChartPoint[] = [];

        const manpowerValues: number[] = [
            round(manpowerTotal, 2),
            round(manpowerAverage, 2),
        ];
        const capacityAt100Values: number[] = [
            round(indexCapacityTotal, 2),
            round(indexCapacityAverage, 2),
        ];
        const capacityWithAbsValues: number[] = [
            round(indexCapacityAbsTotal, 2),
            round(indexCapacityAbsAverage, 2),
        ];
        const fgCompletionPercentValues: number[] = [
            round(fgCompletionAverage, 2),
            round(fgCompletionAverage, 2),
        ];
        const absenteeismPercentValues: number[] = [
            round(absenteeismAverage, 2),
            round(absenteeismAverage, 2),
        ];
        const capacityUtilizationValues: number[] = [
            round(capacityUtilizationAverage, 2),
            round(capacityUtilizationAverage, 2),
        ];

        dayMetrics.forEach((metrics) => {
            const currentDate = new Date(metrics.date);
            headers.push(formatHeaderDay(currentDate));

            manpowerValues.push(round(metrics.manpower, 2));
            capacityAt100Values.push(round(metrics.indexedCapacityAt100, 2));
            capacityWithAbsValues.push(round(metrics.indexedCapacityWithAbsence, 2));
            fgCompletionPercentValues.push(round(metrics.indexedFgCompletionPercent, 2));
            absenteeismPercentValues.push(round(metrics.absenteeismPercent, 2));
            capacityUtilizationValues.push(round(metrics.capacityUtilizationPercent, 2));

            chartData.push({
                name: formatChartLabel(currentDate),
                indexFGCompletion: round(metrics.indexedFgCompletionValue, 2),
                capacityAt100: round(metrics.indexedCapacityAt100, 2),
                capacityWithAbs: round(metrics.indexedCapacityWithAbsence, 2),
                percentage: round(metrics.capacityUtilizationPercent, 2),
            });
        });

        const table: DashboardTableData = {
            headers,
            rows: [
                {
                    label: 'Manpower',
                    values: manpowerValues,
                    total: round(manpowerTotal, 2),
                    average: round(manpowerAverage, 2),
                },
                {
                    label: 'Indexed Capacity (at 100%)',
                    values: capacityAt100Values,
                    total: round(indexCapacityTotal, 2),
                    average: round(indexCapacityAverage, 2),
                },
                {
                    label: 'Indexed Capacity (with Actual Absenteeism)',
                    values: capacityWithAbsValues,
                    total: round(indexCapacityAbsTotal, 2),
                    average: round(indexCapacityAbsAverage, 2),
                },
                {
                    label: 'Index - FG completion (%)',
                    values: fgCompletionPercentValues,
                    total: round(fgCompletionAverage, 2),
                    average: round(fgCompletionAverage, 2),
                },
                {
                    label: 'Absenteeism (%)',
                    values: absenteeismPercentValues,
                    total: round(absenteeismAverage, 2),
                    average: round(absenteeismAverage, 2),
                },
                {
                    label: '% Capacity Utilization with Absenteeism',
                    values: capacityUtilizationValues,
                    total: round(capacityUtilizationAverage, 2),
                    average: round(capacityUtilizationAverage, 2),
                },
            ],
        };

        return {
            table,
            chart: chartData,
            summary: {
                manpowerTotal: round(manpowerTotal, 2),
                manpowerAverage: round(manpowerAverage, 2),
                absenteeismAverage: round(absenteeismAverage, 2),
                indexedFgCompletionAverage: round(fgCompletionAverage, 2),
                capacityUtilizationAverage: round(capacityUtilizationAverage, 2),
            },
            meta: {
                month,
                year,
                label: format(startDate, 'MMMM yyyy'),
                days: daysInMonth,
            },
            activeGroupsCount,
        };
    }
}


