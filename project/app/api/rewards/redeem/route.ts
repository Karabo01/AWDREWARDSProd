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

            // Find the correct tenantId for this redemption
            // If customer.tenantId is array, use the tenantId that matches the reward's tenantId
            let tenantId = '';
            if (Array.isArray(customer.tenantId)) {
                // Try to match reward.tenantId (string) to one in customer.tenantId array
                if (reward.tenantId && customer.tenantId.includes(reward.tenantId)) {
                    tenantId = reward.tenantId;
                } else {
                    // fallback to first tenantId
                    tenantId = customer.tenantId[0];
                }
            } else {
                tenantId = customer.tenantId;
            }

            // Get current points for this tenant
            let currentPoints = 0;
            if (customer.pointsByTenant) {
                if (typeof customer.pointsByTenant.get === 'function') {
                    currentPoints = customer.pointsByTenant.get(tenantId) || 0;
                } else {
                    currentPoints = customer.pointsByTenant[tenantId] || 0;
                }
            }

            if (currentPoints < reward.pointsRequired) {
                throw new Error('Insufficient points');
            }

            // Deduct points for this tenant
            let updatedCustomer;
            if (typeof customer.pointsByTenant.get === 'function') {
                // Map type
                customer.pointsByTenant.set(tenantId, currentPoints - reward.pointsRequired);
                updatedCustomer = await customer.save({ session });
            } else {
                // Plain object
                updatedCustomer = await Customer.findByIdAndUpdate(
                    customerId,
                    { $inc: { [`pointsByTenant.${tenantId}`]: -reward.pointsRequired } },
                    { session, new: true }
                );
            }

            // Increment reward redemption count
            await Reward.findByIdAndUpdate(
                rewardId,
                { $inc: { redemptionCount: 1 } },
                { session }
            );

            // Get new balance after deduction
            let newBalance = 0;
            if (updatedCustomer && updatedCustomer.pointsByTenant) {
                if (typeof updatedCustomer.pointsByTenant.get === 'function') {
                    newBalance = updatedCustomer.pointsByTenant.get(tenantId) || 0;
                } else {
                    newBalance = updatedCustomer.pointsByTenant[tenantId] || 0;
                }
            }

            // Create transaction record
            await Transaction.create([{
                tenantId: tenantId,
                customerId,
                type: 'REWARD_REDEEMED',
                points: -reward.pointsRequired,
                rewardId,
                description: `Redeemed reward: ${reward.name}`,
                balance: newBalance
            }], { session });

            await session.commitTransaction();

            return NextResponse.json({
                message: 'Reward redeemed successfully',
                remainingPoints: newBalance
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
