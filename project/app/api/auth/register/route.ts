import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Tenant from '@/models/Tenant';
import { hashPassword, generateToken, validatePassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      username,
      email,
      password,
      businessName,
      businessType,
      address,
      phone,
      subscriptionPlan, // Add subscriptionPlan
    } = body;

    // Validate required fields
    if (!username || !email || !password || !businessName || !businessType || !address || !phone || !subscriptionPlan) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password complexity
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          message: 'Password does not meet complexity requirements',
          errors: passwordValidation.errors 
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this username or email already exists' },
        { status: 400 }
      );
    }

    // Create tenant first
    const tenant = new Tenant({
      name: businessName,
      businessType,
      address,
      phone,
      email,
      subscriptionPlan, // Save subscriptionPlan
    });

    await tenant.save();

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    
    const user = new User({
      username,
      email,
      password: hashedPassword,
      tenantId: tenant._id.toString(),
      role: 'business_owner',
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
    });

    return NextResponse.json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}