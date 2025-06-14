import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Visit from '@/models/Visit';
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

        // Add tenantId to all queries
        const totalCustomers = await Customer.countDocuments({ 
            tenantId: tokenData.tenantId,
            status: 'active' 
        });

        const visitsStats = await Visit.aggregate([
            {
                $match: { tenantId: tokenData.tenantId }
            },
            {
                $group: {
                    _id: null,
                    totalVisits: { $sum: 1 },
                    revenue: { $sum: '$amount' },
                }
            }
        ]);

        const pointsStats = await Reward.aggregate([
            {
                $match: { tenantId: tokenData.tenantId }
            },
            {
                $group: {
                    _id: null,
                    pointsRedeemed: { $sum: '$redemptionCount' }
                }
            }
        ]);

        const recentActivity = await Visit.aggregate([
            {
                $match: { tenantId: tokenData.tenantId }
            },
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

        const recentRedemptions = await Reward.aggregate([
            {
                $match: { tenantId: tokenData.tenantId }
            },
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