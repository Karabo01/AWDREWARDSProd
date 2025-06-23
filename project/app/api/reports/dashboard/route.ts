import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Visit from '@/models/Visit';
import Transaction from '@/models/Transaction';
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
        if (!tokenData?.tenantId || !tokenData?.userId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        // Get recent visits (last 5)
        const recentVisits = await Visit.aggregate([
            {
                $match: { tenantId: tokenData.tenantId }
            },
            { $sort: { visitDate: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $project: {
                    customerId: 1,
                    customerName: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] },
                    action: { $concat: ['Visited and earned ', { $toString: '$points' }, ' points'] },
                    points: '$points',
                    timestamp: '$visitDate'
                }
            }
        ]);

        // Get recent reward redemptions (last 5)
        const recentRedemptions = await Transaction.aggregate([
            {
                $match: {
                    tenantId: tokenData.tenantId,
                    type: 'REWARD_REDEEMED'
                }
            },
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'customers',
                    localField: 'customerId',
                    foreignField: '_id',
                    as: 'customer'
                }
            },
            { $unwind: '$customer' },
            {
                $project: {
                    customerId: 1,
                    customerName: { $concat: ['$customer.firstName', ' ', '$customer.lastName'] },
                    action: { $concat: ['Redeemed a reward (', { $ifNull: ['$rewardName', '$rewardId'] }, ')'] },
                    points: '$points',
                    timestamp: '$createdAt'
                }
            }
        ]);

        // Merge and sort by timestamp (desc), limit to 5
        const mergedActivity = [...recentVisits, ...recentRedemptions]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

        const [totalCustomers, visitsStats, dailyVisits, monthlyPoints] = await Promise.all([
            Customer.countDocuments({ 
                tenantId: tokenData.tenantId,
                status: 'active' 
            }),
            Visit.aggregate([
                {
                    $match: { tenantId: tokenData.tenantId }
                },
                {
                    $group: {
                        _id: null,
                        totalVisits: { $sum: 1 },
                        revenue: { $sum: '$amount' },
                        totalPoints: { $sum: '$points' }
                    }
                }
            ]),
            Visit.aggregate([
                {
                    $match: { 
                        tenantId: tokenData.tenantId,
                        visitDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$visitDate" } },
                        visits: { $sum: 1 }
                    }
                },
                {
                    $sort: { "_id": 1 }
                }
            ]),
            Visit.aggregate([
                {
                    $match: { 
                        tenantId: tokenData.tenantId,
                        visitDate: { $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$visitDate" } },
                        points: { $sum: '$points' }
                    }
                },
                {
                    $sort: { "_id": 1 }
                }
            ])
        ]);

        return NextResponse.json({
            totalCustomers,
            totalVisits: visitsStats[0]?.totalVisits || 0,
            totalPoints: visitsStats[0]?.totalPoints || 0,
            revenue: visitsStats[0]?.revenue || 0,
            visitsByDay: dailyVisits.map(day => ({
                date: day._id,
                visits: day.visits
            })),
            pointsByMonth: monthlyPoints.map(month => ({
                month: month._id,
                points: month.points
            })),
            recentActivity: mergedActivity,
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}