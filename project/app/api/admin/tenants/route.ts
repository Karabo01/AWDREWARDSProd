import { NextRequest, NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import User from '@/models/User';
import Customer from '@/models/Customer';

export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const tokenData = getTokenData(token);

        // Only AWDTECH admin can access
        if (
            !tokenData ||
            tokenData.tenantId !== '6863a3d5e70598847b0f4507'
        ) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        // Aggregate all tenants with employee and customer counts
        const tenants = await Tenant.aggregate([
            {
                $lookup: {
                    from: 'users',
                    let: { tenantId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$tenantId', '$$tenantId'] }
                            }
                        },
                        {
                            $count: 'count'
                        }
                    ],
                    as: 'employeeCount'
                }
            },
            {
                $lookup: {
                    from: 'customers',
                    let: { tenantId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $in: ['$$tenantId', '$tenantId'] }
                            }
                        },
                        {
                            $count: 'count'
                        }
                    ],
                    as: 'customerCount'
                }
            },
            {
                $addFields: {
                    employeeCount: { $ifNull: [{ $arrayElemAt: ['$employeeCount.count', 0] }, 0] },
                    customerCount: { $ifNull: [{ $arrayElemAt: ['$customerCount.count', 0] }, 0] }
                }
            }
        ]);

        // Calculate total revenue (based on all tenants)
        const totalRevenue = tenants.reduce((sum, tenant) => {
            const planRate = tenant.subscriptionPlan === 'premium' ? 1200 : 799;
            return sum + planRate;
        }, 0);

        // Count all tenants
        const totalTenants = await Tenant.countDocuments({});

        return NextResponse.json({
            tenants,
            totalRevenue,
            totalTenants
        });

    } catch (error) {
        console.error('Admin tenants fetch error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
