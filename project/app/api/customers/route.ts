import { NextRequest, NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        // Get token from authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.split(' ')[1];
        const tokenData = getTokenData(token);
        
        if (!tokenData || !tokenData.tenantId) {
            return NextResponse.json(
                { message: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            password,
            points = 0,
            status = 'active'
        } = body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone) {
            return NextResponse.json(
                { message: 'First name, last name, email, and phone are required' },
                { status: 400 }
            );
        }

        // Check if customer with email or phone already exists for this tenant
        const existingCustomer = await Customer.findOne({
            tenantId: tokenData.tenantId,
            $or: [{ email }, { phone }]
        });

        if (existingCustomer) {
            return NextResponse.json(
                { message: 'Customer with this email or phone number already exists' },
                { status: 400 }
            );
        }

        // Create new customer with tenant ID
        const customer = await Customer.create({
            tenantId: tokenData.tenantId,
            firstName,
            lastName,
            email,
            phone,
            address,
            points,
            status,
            password: password || '0000', // Default password if not provided
            passwordChanged: false,
            phoneConfirmed: false
        });

        // Remove password from response
        const customerResponse = customer.toObject();
        delete customerResponse.password;

        return NextResponse.json({
            message: 'Customer created successfully',
            customer: customerResponse
        });

    } catch (error) {
        console.error('Add customer error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        // Get token from authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const tokenData = getTokenData(token);
        if (!tokenData?.tenantId) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';

        // Add tenantId to query
        const query = {
            tenantId: tokenData.tenantId,
            ...(search ? {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            } : {})
        };

        const skip = (page - 1) * limit;
        const customers = await Customer.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Customer.countDocuments(query);

        return NextResponse.json({
            customers,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Fetch customers error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}