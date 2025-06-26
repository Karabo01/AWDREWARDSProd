import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Visit from '@/models/Visit';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';
import { getTokenData } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
        if (!tokenData?.tenantId) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }
        const tenantId = tokenData.tenantId;

        const body = await request.json();
        const { customerId, amount, points, notes } = body;

        // Validate required fields
        if (!customerId || amount === undefined) {
            return NextResponse.json(
                { message: 'Customer and amount are required' },
                { status: 400 }
            );
        }

        // Validate customer exists
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return NextResponse.json(
                { message: 'Customer not found' },
                { status: 404 }
            );
        }

        // Start a session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Create visit
            const visit = await Visit.create([{
                tenantId: Array.isArray(customer.tenantId) ? customer.tenantId : [customer.tenantId],
                customerId,
                amount,
                points: points || Math.floor(amount),
                notes,
                visitDate: new Date(),
            }], { session });

            // Update customer pointsByTenant for this tenant
            const pointsToAdd = points || Math.floor(amount);
            const update = {
                $inc: {
                    [`pointsByTenant.${tenantId}`]: pointsToAdd
                }
            };
            const updatedCustomer = await Customer.findByIdAndUpdate(
                customerId,
                update,
                { session, new: true }
            );

            // Create transaction record
            await Transaction.create([{
                tenantId: tenantId,
                customerId,
                type: 'POINTS_EARNED',
                points: pointsToAdd,
                description: `Earned points from visit - R${amount.toFixed(2)} spent`,
                balance: updatedCustomer?.pointsByTenant?.get
                    ? updatedCustomer.pointsByTenant.get(tenantId) || 0
                    : (updatedCustomer?.pointsByTenant?.[tenantId] || 0)
            }], { session });

            await session.commitTransaction();

            return NextResponse.json({
                message: 'Visit logged successfully',
                visit: visit[0]
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Log visit error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
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
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const customerId = searchParams.get('customerId');
        if (!customerId) {
            return NextResponse.json({ visits: [] });
        }

        // Find visits for this customer and tenant
        const visits = await Visit.find({
            customerId,
            tenantId: { $in: [tokenData.tenantId] }
        }).sort({ visitDate: -1 });

        return NextResponse.json({ visits });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}