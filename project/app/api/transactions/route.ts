import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import Reward from '@/models/Reward';
import { getTokenData } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId');
        const type = searchParams.get('type');

        if (!customerId) {
            return NextResponse.json({ transactions: [] });
        }

        const query: any = {
            customerId,
            tenantId: tokenData.tenantId
        };
        if (type) query.type = type;

        // Populate reward name if rewardId exists
        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .lean();

        // Attach reward name if possible
        for (const tx of transactions as (typeof transactions[0] & { rewardName?: string })[]) {
            if (tx.rewardId) {
                const reward = await Reward.findById(tx.rewardId).lean();
                if (reward && !Array.isArray(reward) && 'name' in reward) {
                    tx.rewardName = (reward as { name?: string }).name || '';
                } else {
                    tx.rewardName = '';
                }
            }
        }

        return NextResponse.json({ transactions });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
