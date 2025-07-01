import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Reward from '@/models/Reward';
import { getTokenData } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        // Get token from authorization header
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
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');

        // Only return rewards for the current tenant
        const query: any = { tenantId: tokenData.tenantId };
        if (status) query.status = status;

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
        
        // Get token from authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const tokenData = getTokenData(token);
        
        if (!tokenData || !tokenData.tenantId) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        // Validate required fields
        if (!body.name || !body.description || typeof body.pointsRequired !== 'number') {
            return NextResponse.json(
                { message: 'Name, description, and pointsRequired are required' },
                { status: 400 }
            );
        }

        // Always set tenantId from token, never trust client
        const reward = await Reward.create({
            name: body.name,
            description: body.description,
            pointsRequired: body.pointsRequired,
            tenantId: tokenData.tenantId,
            // Optionally allow status and redemptionCount, or use defaults
        });

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