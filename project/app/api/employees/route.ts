import { NextRequest, NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const tokenData = getTokenData(token);
        
        if (!tokenData?.tenantId || tokenData.role !== 'business_owner') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { username, email, password, position, department, employeeId } = body;

        // Validate required fields
        if (!username || !email || !password || !position || !department || !employeeId) {
            return NextResponse.json(
                { message: 'All fields are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { username },
                { email },
                { employeeId, tenantId: tokenData.tenantId }
            ]
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'Employee with this username, email, or ID already exists' },
                { status: 400 }
            );
        }

        // Hash password and create user
        const hashedPassword = await hashPassword(password);
        
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            employeeId,
            position,
            department,
            tenantId: tokenData.tenantId,
            role: 'employee'
        });

        const userResponse = { ...user.toObject() };
        delete userResponse.password;

        return NextResponse.json({
            message: 'Employee added successfully',
            user: userResponse
        });

    } catch (error) {
        console.error('Create employee error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const tokenData = getTokenData(token);
        
        if (!tokenData?.tenantId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const employees = await User.find({
            tenantId: tokenData.tenantId,
            role: 'employee'
        }).select('-password');

        return NextResponse.json({ employees });
    } catch (error) {
        console.error('Fetch employees error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
