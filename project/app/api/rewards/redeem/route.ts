import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Reward from '@/models/Reward';
import Transaction from '@/models/Transaction';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { customerId, rewardId } = body;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const [customer, reward] = await Promise.all([
                Customer.findById(customerId),
                Reward.findById(rewardId)
            ]);

            if (!customer || !reward) {
                throw new Error('Customer or reward not found');
            }

            if (customer.points < reward.pointsRequired) {
                throw new Error('Insufficient points');
            }

            // Update customer points
            const updatedCustomer = await Customer.findByIdAndUpdate(
                customerId,
                { $inc: { points: -reward.pointsRequired } },
                { session, new: true }
            );

            // Increment reward redemption count
            await Reward.findByIdAndUpdate(
                rewardId,
                { $inc: { redemptionCount: 1 } },
                { session }
            );

            // Create transaction record
            await Transaction.create([{
                tenantId: customer.tenantId, // Always pass the array
                customerId,
                type: 'REWARD_REDEEMED',
                points: -reward.pointsRequired,
                rewardId,
                description: `Redeemed reward: ${reward.name}`,
                balance: updatedCustomer!.points
            }], { session });

            await session.commitTransaction();

            return NextResponse.json({
                message: 'Reward redeemed successfully',
                remainingPoints: updatedCustomer!.points
            });
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    } catch (error) {
        console.error('Reward redemption error:', error);
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Failed to redeem reward' },
            { status: 400 }
        );
    }
}
