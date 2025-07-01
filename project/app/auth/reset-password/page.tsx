'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
    const router = useRouter();
    const params = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const token = params.get('token') || '';
    const email = params.get('email') || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password !== confirm) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, password }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Password reset successful. Please log in.');
                router.push('/auth/login');
            } else {
                toast.error(data.message || 'Failed to reset password');
            }
        } catch {
            toast.error('Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="password"
                            placeholder="New password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
