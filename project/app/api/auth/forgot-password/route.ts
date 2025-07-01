import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // For security, don't reveal if user exists
            return NextResponse.json({ message: 'If the email exists, a reset link will be sent.' });
        }

        // Generate reset token and expiry (1 hour)
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
        await user.save();

        // Prepare Nodemailer transport
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://awdrewards.co.za'}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

        await transporter.sendMail({
            from: '"AWD Rewards" <password-reset@awdrewards.co.za>',
            to: email,
            subject: 'AWD Rewards Password Reset',
            html: `
                <p>Hello,</p>
                <p>You requested a password reset for your AWD Rewards account.</p>
                <p><a href="${resetUrl}">Click here to reset your password</a></p>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });

        return NextResponse.json({ message: 'If the email exists, a reset link will be sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
   