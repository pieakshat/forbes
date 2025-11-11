import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api/auth';
import { DashboardService } from '@/lib/services/dashboardService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        const { user, error: authError } = await verifyAuth();

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 },
            );
        }

        const { searchParams } = new URL(request.url);
        const group = searchParams.get('group') || '';
        const monthParam = searchParams.get('month');
        const yearParam = searchParams.get('year');

        if (!group) {
            return NextResponse.json(
                { success: false, error: 'Group parameter is required.' },
                { status: 400 },
            );
        }

        const month = monthParam ? Number.parseInt(monthParam, 10) : undefined;
        const year = yearParam ? Number.parseInt(yearParam, 10) : undefined;

        const metrics = await DashboardService.getGroupMetrics({
            group,
            month: month ?? 0,
            year: year ?? 0,
        });

        return NextResponse.json(
            {
                success: true,
                data: metrics,
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('Dashboard metrics API error:', error);
        return NextResponse.json(
            {
                success: false,
                error:
                    error instanceof Error ? error.message : 'Failed to compute metrics.',
            },
            { status: 500 },
        );
    }
}


