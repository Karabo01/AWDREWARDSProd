import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reward from '@/models/Reward';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');

        const query = status ? { status } : {};

        const rewards = await Reward.find(query)
            .sort({ pointsRequired: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await Reward.countDocuments(query);

        return NextResponse.json({
            rewards,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Fetch rewards error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const reward = await Reward.create(body);

        return NextResponse.json({
            message: 'Reward created successfully',
            reward
        });
    } catch (error) {
        console.error('Create reward error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}