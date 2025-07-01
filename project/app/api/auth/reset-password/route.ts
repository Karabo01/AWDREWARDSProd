import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { email, token, password } = await request.json();

        if (!email || !token || !password) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            email,
            resetPasswordToken: resetTokenHash,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return NextResponse.json({ message: 'Invalid or expired reset token' }, { status: 400 });
        }

        user.password = await hashPassword(password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.passwordChanged = true;
        await user.save();

        return NextResponse.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
