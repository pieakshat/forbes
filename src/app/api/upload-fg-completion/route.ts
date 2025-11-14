import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api/auth';
import { FGCompletionService } from '@/lib/services/fgCompletionService';

export async function POST(request: NextRequest) {
    try {

        const { user, error: authError } = await verifyAuth(['manager', 'admin']);

        if (authError || !user) {
            return NextResponse.json(
                { error: authError || 'Unauthorized' },
                { status: 401 }
            );
        }

        // Step 2: Extract file from form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const fileBuffer = await file.arrayBuffer();

        const result = await FGCompletionService.uploadCSV(
            fileBuffer,
            file.name,
            user.email
        );

        // Step 5: Return appropriate HTTP response
        if (result.success) {
            return NextResponse.json(result, { status: 200 });
        } else {
            // Determine status code based on error type
            const statusCode =
                result.error?.includes('size') ||
                    result.error?.includes('type') ||
                    result.error?.includes('parse') ||
                    result.error?.includes('Missing required') ||
                    result.error?.includes('No valid data')
                    ? 400 // Bad Request
                    : 500; // Internal Server Error

            return NextResponse.json(result, { status: statusCode });
        }

    } catch (error) {
        console.error('API Route error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Internal server error during file upload',
                message: 'Internal server error during file upload',
                recordsUploaded: 0,
                recordsTotal: 0,
                skipped: 0,
            },
            { status: 500 }
        );
    }
}

