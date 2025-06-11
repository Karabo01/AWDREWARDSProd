import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        const settings = await Settings.findOne({});
        return NextResponse.json(settings || {});
    } catch (error) {
        console.error('Fetch settings error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        
        const settings = await Settings.findOneAndUpdate(
            { tenantId: body.tenantId },
            body,
            { new: true, upsert: true }
        );

        return NextResponse.json({
            message: 'Settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Update settings error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}