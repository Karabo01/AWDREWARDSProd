'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ICustomer } from '@/models/Customer';

interface VisitFormData {
    customerId: string;
    amount: number;
    points?: number;
    notes?: string;
}

export default function LogVisitPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [formData, setFormData] = useState<VisitFormData>({
        customerId: '',
        amount: 0,
        points: undefined,
        notes: '',
    });

    useEffect(() => {
        // Fetch customers for dropdown
        const fetchCustomers = async () => {
            try {
                const response = await fetch('/api/customers');
                const data = await response.json();
                if (response.ok) {
                    setCustomers(data.customers);
                }
            } catch (error) {
                console.error('Failed to fetch customers:', error);
            }
        };

        fetchCustomers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Visit logged successfully',
                });
                router.push('/dashboard/visits');
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Something went wrong',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An error occurred while logging the visit',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Log Customer Visit</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="customer">Customer</Label>
                            <Select
                                value={formData.customerId}
                                onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((customer) => (
                                        <SelectItem key={customer._id} value={customer._id}>
                                            {customer.firstName} {customer.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount ($)</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.amount}
                                onChange={(e) => setFormData({ 
                                    ...formData, 
                                    amount: parseFloat(e.target.value),
                                    points: Math.floor(parseFloat(e.target.value))
                                })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="points">Points (Optional)</Label>
                            <Input
                                id="points"
                                type="number"
                                min="0"
                                value={formData.points}
                                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Logging Visit...' : 'Log Visit'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}