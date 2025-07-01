import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyPassword, generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
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
        }); // REMOVE .lean() here to keep user as a Mongoose document

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // Check if user is active (allow if isActive is undefined or true)
        if (user.isActive === false) {
            return NextResponse.json(
                { message: 'Account is deactivated. Please contact support.' },
                { status: 403 }
            );
        }

        // Fetch tenant and check isActive
        let tenantName = '';
        let tenantIsActive = true;
        try {
            const Tenant = (await import('@/models/Tenant')).default;
            // Always use string for tenantId
            const tenant = await Tenant.findById(user.tenantId);
            tenantName = tenant?.name || '';
            // If tenant.isActive is undefined, treat as active (true)
            tenantIsActive = tenant?.isActive !== false;
        } catch {}

        if (!tenantIsActive) {
            return NextResponse.json(
                { message: 'Your business account is deactivated. Please contact support.' },
                { status: 403 }
            );
        }

        // Verify password (use Mongoose doc, not lean/plain object)
        const isPasswordValid = await verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // AWDTECH admin check
        const isAwdtechAdmin = tenantName.trim().toLowerCase() === 'awdtech' && user.role === 'admin';

        // Generate JWT token
        const token = generateToken({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            tenantId: user.tenantId,
            tenantName,
            role: user.role,
            isAwdtechAdmin
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
                tenantName,
                isAwdtechAdmin
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