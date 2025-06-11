import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Connect to MongoDB first
        await connectDB();

        const body = await request.json();
        const { username, password } = body;

        // Validate required fields
        if (!username || !password) {
            return NextResponse.json(
                { message: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Find user by username or email
        const user = await User.findOne({
            $or: [{ username }, { email: username }],
            isActive: true,
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Generate JWT token
        const token = generateToken({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            tenantId: user.tenantId,
            role: user.role,
        });

        return NextResponse.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}