import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reward from '@/models/Reward';
import { getTokenData } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await connectDB();

        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        const tokenData = getTokenData(token);
        if (!tokenData?.tenantId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const reward = await Reward.findOneAndDelete({
            _id: id,
            tenantId: tokenData.tenantId
        });

        if (!reward) {
            return NextResponse.json({ message: 'Reward not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Reward deleted successfully' });
    } catch (error) {
        return NextResponse.json(
            { message: 'Failed to delete reward' },
            { status: 500 }
        );
    }
}
