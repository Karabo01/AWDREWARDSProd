import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Reward from '@/models/Reward';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const body = await request.json();
        const { customerId, rewardId } = body;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find customer and reward
            const [customer, reward] = await Promise.all([
                Customer.findById(customerId),
                Reward.findById(rewardId)
            ]);

            if (!customer || !reward) {
                throw new Error('Customer or reward not found');
            }

            // Check if customer has enough points
            if (customer.points < reward.pointsRequired) {
                throw new Error('Insufficient points');
            }

            // Update customer points
            await Customer.findByIdAndUpdate(
                customerId,
                { $inc: { points: -reward.pointsRequired } },
                { session }
            );

            // Increment reward redemption count
            await Reward.findByIdAndUpdate(
                rewardId,
                { $inc: { redemptionCount: 1 } },
                { session }
            );

            await session.commitTransaction();

            return NextResponse.json({
                message: 'Reward redeemed successfully',
                remainingPoints: customer.points - reward.pointsRequired
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
