import { NextRequest, NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        await connectDB();

        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const tokenData = getTokenData(token);
        if (!tokenData?.tenantId || tokenData.role !== 'business_owner') {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { isActive } = body;

        if (typeof isActive !== 'boolean') {
            return NextResponse.json(
                { message: 'Invalid status value' },
                { status: 400 }
            );
        }

        const user = await User.findOneAndUpdate(
            {
                _id: id,
                tenantId: tokenData.tenantId,
            },
            { isActive },
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { message: 'Employee not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Employee status updated successfully',
            user,
        });

    } catch (error) {
        console.error('Update employee status error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
