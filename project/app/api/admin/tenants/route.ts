import { NextRequest, NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import Customer from '@/models/Customer';
import User from '@/models/User';

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

        // Fetch all tenants
        const tenants = await Tenant.find({}).lean();

        // For each tenant, fetch employee and customer counts
        const tenantsWithCounts = await Promise.all(
            tenants.map(async (tenant: any) => {
                // Employees: users with tenantId and role 'employee'
                const employeeCount = await User.countDocuments({
                    tenantId: tenant._id.toString(),
                    role: 'employee'
                });
                // Customers: customers where tenantId array contains this tenant's id
                const customerCount = await Customer.countDocuments({
                    tenantId: tenant._id.toString()
                });
                return {
                    ...tenant,
                    employeeCount,
                    customerCount
                };
            })
        );

        // Calculate total revenue (based on all tenants)
        const totalRevenue = tenantsWithCounts.reduce((sum, tenant) => {
            const planRate = tenant.subscriptionPlan === 'premium' ? 1200 : 799;
            return sum + planRate;
        }, 0);

        // Count all tenants
        const totalTenants = tenantsWithCounts.length;

        return NextResponse.json({
            tenants: tenantsWithCounts,
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
         