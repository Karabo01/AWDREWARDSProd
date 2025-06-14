'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ICustomer } from '@/models/Customer';
import { toast } from 'sonner';

export default function CustomerPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [customer, setCustomer] = useState<ICustomer | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
    });

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/customers/${params.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();

                if (response.ok) {
                    setCustomer(data.customer);
                    setFormData({
                        firstName: data.customer.firstName,
                        lastName: data.customer.lastName,
                        email: data.customer.email,
                        phone: data.customer.phone || '',
                        address: data.customer.address || '',
                    });
                } else {
                    toast.error('Failed to load customer');
                }
            } catch (error) {
                toast.error('Error loading customer details');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCustomer();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/customers/${params.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Customer updated successfully');
                setCustomer({ ...customer, ...formData } as ICustomer);
                setIsEditing(false);
            } else {
                toast.error(data.message || 'Failed to update customer');
            }
        } catch (error) {
            toast.error('Error updating customer');
        }
    };

    if (isLoading) {
        return <div className="container mx-auto p-6">Loading...</div>;
    }

    if (!customer) {
        return <div className="container mx-auto p-6">Customer not found</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/customers')}
                >
                    Back to Customers
                </Button>
            </div>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="visits">Visit History</TabsTrigger>
                    <TabsTrigger value="rewards">Rewards History</TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Customer Details</CardTitle>
                            {!isEditing && (
                                <Button onClick={() => setIsEditing(true)}>
                                    Edit Details
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">First Name</Label>
                                            <Input
                                                id="firstName"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">Last Name</Label>
                                            <Input
                                                id="lastName"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="address">Address</Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsEditing(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">
                                            Save Changes
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Points Balance</Label>
                                            <p className="text-2xl font-bold">{customer.points}</p>
                                        </div>
                                        <div>
                                            <Label>Status</Label>
                                            <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                customer.status === 'active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {customer.status}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Name</Label>
                                            <p>{customer.firstName} {customer.lastName}</p>
                                        </div>
                                        <div>
                                            <Label>Email</Label>
                                            <p>{customer.email}</p>
                                        </div>
                                    </div>
                                    {customer.phone && (
                                        <div>
                                            <Label>Phone</Label>
                                            <p>{customer.phone}</p>
                                        </div>
                                    )}
                                    {customer.address && (
                                        <div>
                                            <Label>Address</Label>
                                            <p>{customer.address}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="visits">
                    <Card>
                        <CardHeader>
                            <CardTitle>Visit History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Visit history will be implemented later */}
                            <p className="text-muted-foreground">Visit history coming soon</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rewards">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rewards History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {/* Rewards history will be implemented later */}
                            <p className="text-muted-foreground">Rewards history coming soon</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
