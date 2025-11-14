import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
    try {
        // Verify that the user is an admin
        const { user, error: authError } = await verifyAuth(['admin']);

        if (authError || !user) {
            return NextResponse.json(
                { success: false, error: authError || 'Unauthorized' },
                { status: 401 },
            );
        }

        const body = await request.json();
        const { email, password, role } = body;

        // Validate input
        if (!email || !password || !role) {
            return NextResponse.json(
                { success: false, error: 'Email, password, and role are required.' },
                { status: 400 },
            );
        }

        // Validate role
        if (!['leader', 'manager', 'admin'].includes(role)) {
            return NextResponse.json(
                { success: false, error: 'Invalid role. Must be leader, manager, or admin.' },
                { status: 400 },
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, error: 'Invalid email format.' },
                { status: 400 },
            );
        }

        const supabase = await createClient();

        // Check if user already exists in Users table
        const { data: existingUser, error: checkError } = await supabase
            .from('Users')
            .select('email')
            .eq('email', email)
            .limit(1);

        if (checkError && checkError.code !== 'PGRST116') {

            return NextResponse.json(
                { success: false, error: `Failed to check existing user: ${checkError.message}` },
                { status: 500 },
            );
        }

        if (existingUser && existingUser.length > 0) {
            return NextResponse.json(
                { success: false, error: 'User with this email already exists.' },
                { status: 400 },
            );
        }

        // Create user in Supabase Auth
        // Note: This requires service role key or admin access
        // Using signUp which will send confirmation email
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${request.nextUrl.origin}/`,
            },
        });

        if (signUpError) {
            return NextResponse.json(
                { success: false, error: `Failed to create user: ${signUpError.message}` },
                { status: 500 },
            );
        }

        if (!authData.user) {
            return NextResponse.json(
                { success: false, error: 'Failed to create user in authentication system.' },
                { status: 500 },
            );
        }

        // not safe but I don't care
        const { error: insertError } = await supabase
            .from('Users')
            .insert({
                email: email,
                password: password,
                role: role,
            });

        if (insertError) {
            return NextResponse.json(
                { success: false, error: `Failed to assign role: ${insertError.message}` },
                { status: 500 },
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'User created successfully. Confirmation email has been sent.',
                data: {
                    email: authData.user.email,
                    role: role,
                },
            },
            { status: 201 },
        );
    } catch (error) {
        console.error('Create user API error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create user.',
            },
            { status: 500 },
        );
    }
}

