import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Visit from '@/models/Visit';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        const body = await request.json();
        const { customerId, amount, points, notes } = body;

        // Validate required fields
        if (!customerId || !amount) {
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
                tenantId: customer.tenantId,
                customerId,
                amount,
                points: points || Math.floor(amount),
                notes,
                visitDate: new Date(),
            }], { session });

            // Update customer points
            const updatedCustomer = await Customer.findByIdAndUpdate(
                customerId,
                { $inc: { points: points || Math.floor(amount) } },
                { session, new: true }
            );

            // Create transaction record
            await Transaction.create([{
                tenantId: customer.tenantId,
                customerId,
                type: 'POINTS_EARNED',
                points: points || Math.floor(amount),
                visitId: visit[0]._id,
                description: `Earned points from visit - $${amount.toFixed(2)} spent`,
                balance: updatedCustomer!.points
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