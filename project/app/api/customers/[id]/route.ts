import { NextRequest, NextResponse } from 'next/server';
import { getTokenData } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Customer from '@/models/Customer';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const customer = await Customer.findById(params.id);
        if (!customer) {
            return NextResponse.json(
                { message: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ customer });
    } catch (error) {
        console.error('Get customer error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { firstName, lastName, email, phone, address } = body;

        // Validate required fields
        if (!firstName || !lastName || !email) {
            return NextResponse.json(
                { message: 'First name, last name, and email are required' },
                { status: 400 }
            );
        }

        const customer = await Customer.findByIdAndUpdate(
            params.id,
            { firstName, lastName, email, phone, address },
            { new: true }
        );

        if (!customer) {
            return NextResponse.json(
                { message: 'Customer not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ 
            message: 'Customer updated successfully',
            customer 
        });
    } catch (error) {
        console.error('Update customer error:', error);
        return NextResponse.json(
            { message: 'Internal server error' },
            { status: 500 }
        );
    }
}
