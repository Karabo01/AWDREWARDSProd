import { NextRequest, NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';

export async function PATCH(
    req: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    try {
        await connectDB();

        const authHeader = req.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const tokenData = getTokenData(token);

        if (!tokenData || tokenData.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { paymentStatus } = await req.json();
        if (!['pending', 'paid', 'overdue'].includes(paymentStatus)) {
            return NextResponse.json({ message: 'Invalid payment status' }, { status: 400 });
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(
            id,
            { paymentStatus },
            { new: true }
        );

        if (!updatedTenant) {
            return NextResponse.json(
                { message: 'Tenant not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Payment status updated successfully',
            tenant: updatedTenant
        });

    } catch (error) {
        console.error('Update tenant payment status error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
