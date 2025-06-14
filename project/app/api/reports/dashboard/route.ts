import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Visit from '@/models/Visit';
import Reward from '@/models/Reward';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        // Get total customers
        const totalCustomers = await Customer.countDocuments({ status: 'active' });

        // Get total visits and revenue
        const visitsStats = await Visit.aggregate([
            {
                $group: {
                    _id: null,
                    totalVisits: { $sum: 1 },
                    revenue: { $sum: '$amount' },
                }
            }
        ]);

        // Get total points redeemed
        const pointsStats = await Reward.aggregate([
            {
                $group: {
                    _id: null,
                    pointsRedeemed: { $sum: '$redemptionCount' }
                }
            }
        ]);

        // Get recent activity
        const recentActivity = await Visit.aggregate([
            {
                $sort: { visitDate: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $unwind: '$customer'
            },
            {
                $project: {
                    customerId: 1,
                    customerName: {
                        $concat: ['$customer.firstName', ' ', '$customer.lastName']
                    },
                    action: 'Earned points',
                    points: 1,
                    timestamp: '$visitDate'
                }
            }
        ]);

        // Combine redemption activity
        const recentRedemptions = await Reward.aggregate([
            {
                $sort: { updatedAt: -1 }
            },
            {
                $limit: 5
            },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            {
                $unwind: '$customer'
            },
            {
                $project: {
                    customerId: 1,
                    customerName: {
                        $concat: ['$customer.firstName', ' ', '$customer.lastName']
                    },
                    action: 'Redeemed reward',
                    points: '$pointsRequired',
                    timestamp: '$updatedAt'
                }
            }
        ]);

        // Merge and sort all recent activity
        const allActivity = [...recentActivity, ...recentRedemptions]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

        return NextResponse.json({
            totalCustomers,
            totalVisits: visitsStats[0]?.totalVisits || 0,
            revenue: visitsStats[0]?.revenue || 0,
            pointsRedeemed: pointsStats[0]?.pointsRedeemed || 0,
            recentActivity: allActivity
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}