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

        // Get total points across all customers
        const customersAggregate = await Customer.aggregate([
            {
                $group: {
                    _id: null,
                    totalPoints: { $sum: '$points' }
                }
            }
        ]);
        const totalPoints = customersAggregate[0]?.totalPoints || 0;

        // Get active rewards count
        const totalRewards = await Reward.countDocuments({ status: 'active' });

        // Calculate average transaction amount
        const visitsAggregate = await Visit.aggregate([
            {
                $group: {
                    _id: null,
                    averageSpend: { $avg: '$amount' }
                }
            }
        ]);
        const averageSpend = visitsAggregate[0]?.averageSpend || 0;

        // Get visits by day for the last 7 days
        const visitsByDay = await Visit.aggregate([
            {
                $match: {
                    visitDate: {
                        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$visitDate' } },
                    visits: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    visits: 1
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Get points by month for the last 6 months
        const pointsByMonth = await Visit.aggregate([
            {
                $match: {
                    visitDate: {
                        $gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
                    }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$visitDate' },
                        month: { $month: '$visitDate' }
                    },
                    points: { $sum: '$points' }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: {
                        $concat: [
                            { $toString: '$_id.year' },
                            '-',
                            {
                                $cond: {
                                    if: { $lt: ['$_id.month', 10] },
                                    then: { $concat: ['0', { $toString: '$_id.month' }] },
                                    else: { $toString: '$_id.month' }
                                }
                            }
                        ]
                    },
                    points: 1
                }
            },
            {
                $sort: { month: 1 }
            }
        ]);

        return NextResponse.json({
            totalCustomers,
            totalPoints,
            totalRewards,
            averageSpend,
            visitsByDay,
            pointsByMonth
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}