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
import Visit from '@/models/Visit'; // (for type only, not used directly)
import Transaction from '@/models/Transaction'; // (for type only, not used directly)

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
    const [tenantId, setTenantId] = useState<string | null>(null);
    const [visitHistory, setVisitHistory] = useState<any[]>([]);
    const [rewardsHistory, setRewardsHistory] = useState<any[]>([]);
    const [loadingVisits, setLoadingVisits] = useState(true);
    const [loadingRewards, setLoadingRewards] = useState(true);

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

        // Get tenantId from token
        const token = localStorage.getItem('token');
        let tid = null;
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                tid = payload.tenantId;
                setTenantId(tid);
            } catch {}
        }

        // Fetch visit history
        const fetchVisits = async () => {
            if (!tid) return;
            setLoadingVisits(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/visits?customerId=${params.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setVisitHistory(data.visits || []);
            } catch {
                setVisitHistory([]);
            } finally {
                setLoadingVisits(false);
            }
        };

        // Fetch rewards history (transactions of type REWARD_REDEEMED)
        const fetchRewards = async () => {
            if (!tid) return;
            setLoadingRewards(true);
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/transactions?customerId=${params.id}&type=REWARD_REDEEMED`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setRewardsHistory(data.transactions || []);
            } catch {
                setRewardsHistory([]);
            } finally {
                setLoadingRewards(false);
            }
        };

        fetchVisits();
        fetchRewards();
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
                                            <p className="text-2xl font-bold">
                                                {tenantId && customer.pointsByTenant
                                                    ? customer.pointsByTenant[tenantId] || 0
                                                    : 0}
                                            </p>
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
                            {loadingVisits ? (
                                <p className="text-muted-foreground">Loading visit history...</p>
                            ) : visitHistory.length === 0 ? (
                                <p className="text-muted-foreground">No visits found</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr>
                                                <th className="px-2 py-1 text-left">Date</th>
                                                <th className="px-2 py-1 text-left">Amount</th>
                                                <th className="px-2 py-1 text-left">Points</th>
                                                <th className="px-2 py-1 text-left">Notes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visitHistory.map((visit) => (
                                                <tr key={visit._id}>
                                                    <td className="px-2 py-1">{new Date(visit.visitDate).toLocaleString()}</td>
                                                    <td className="px-2 py-1">R{visit.amount?.toFixed(2)}</td>
                                                    <td className="px-2 py-1">{visit.points}</td>
                                                    <td className="px-2 py-1">{visit.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="rewards">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rewards History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loadingRewards ? (
                                <p className="text-muted-foreground">Loading rewards history...</p>
                            ) : rewardsHistory.length === 0 ? (
                                <p className="text-muted-foreground">No rewards redeemed</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr>
                                                <th className="px-2 py-1 text-left">Date</th>
                                                <th className="px-2 py-1 text-left">Reward</th>
                                                <th className="px-2 py-1 text-left">Points Used</th>
                                                <th className="px-2 py-1 text-left">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rewardsHistory.map((tx) => (
                                                <tr key={tx._id}>
                                                    <td className="px-2 py-1">{new Date(tx.createdAt).toLocaleString()}</td>
                                                    <td className="px-2 py-1">{tx.rewardName || tx.rewardId || '-'}</td>
                                                    <td className="px-2 py-1">{tx.points}</td>
                                                    <td className="px-2 py-1">{tx.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
