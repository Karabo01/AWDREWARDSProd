'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

// Password complexity rules (should match backend)
const passwordRules = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  forbidCommonPasswords: true,
};

function validatePassword(password: string) {
  const errors: string[] = [];
  if (password.length < passwordRules.minLength) {
    errors.push(`At least ${passwordRules.minLength} characters`);
  }
  if (passwordRules.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('An uppercase letter');
  }
  if (passwordRules.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('A lowercase letter');
  }
  if (passwordRules.requireNumbers && !/\d/.test(password)) {
    errors.push('A number');
  }
  if (passwordRules.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A special character');
  }
  if (passwordRules.forbidCommonPasswords) {
    const common = ['password', '123456', 'password123', 'admin', 'qwerty'];
    if (common.includes(password.toLowerCase())) {
      errors.push('Password is too common');
    }
  }
  return errors;
}

function ResetPasswordForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);

    const token = params.get('token') || '';
    const email = params.get('email') || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationErrors = validatePassword(password);
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            toast.error('Password does not meet requirements');
            return;
        }
        if (!password || password !== confirm) {
            setErrors(['Passwords do not match']);
            toast.error('Passwords do not match');
            return;
        }
        setErrors([]);
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
                    {errors.length > 0 && (
                        <ul className="text-red-600 text-sm list-disc pl-5 space-y-1">
                            {errors.map((err, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    )}
                    <div className="text-xs text-gray-500">
                        Password must contain:
                        <ul className="list-disc pl-5">
                            <li>At least 8 characters</li>
                            <li>An uppercase letter</li>
                            <li>A lowercase letter</li>
                            <li>A number</li>
                            <li>A special character</li>
                            <li>Not be a common password</li>
                        </ul>
                    </div>
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Suspense fallback={
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Reset Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center">Loading...</div>
                    </CardContent>
                </Card>
            }>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
