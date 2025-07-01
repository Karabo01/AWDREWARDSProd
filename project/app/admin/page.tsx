'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Users, Building2, CreditCard } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface TenantData {
    _id: string;
    name: string;
    businessType: string;
    isActive: boolean;
    paymentStatus: 'pending' | 'paid' | 'overdue';
    subscriptionPlan: 'basic' | 'premium';
    employeeCount: number;
    customerCount: number;
    email: string;
    phone: string;
}

interface TenantInfo {
    _id: string;
    name: string;
    businessType: string;
    address: string;
    phone: string;
    email: string;
    isActive: boolean;
    subscriptionPlan: string;
    paymentStatus: string;
    lastPaymentDate?: string;
}

export default function AdminDashboard() {
    const [tenants, setTenants] = useState<TenantData[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const [stats, setStats] = useState({
        totalTenants: 0,
        activeTenants: 0,
        totalRevenue: 0
    });
    const [accessError, setAccessError] = useState(false);
    const [tenantInfo, setTenantInfo] = useState<TenantInfo | null>(null);
    const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
    const [showTenantDialog, setShowTenantDialog] = useState(false);

    useEffect(() => {
        const verifyAdminAndFetchTenant = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setAccessError(true);
                setTimeout(() => router.push('/auth/login'), 2000);
                return;
            }

            let role: string | null = null;
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                role = payload.role;
                if (role !== 'admin') {
                    setAccessError(true);
                    setTimeout(() => router.push('/dashboard'), 2000);
                    return;
                }
            } catch {
                setAccessError(true);
                setTimeout(() => router.push('/auth/login'), 2000);
                return;
            }

            // Fetch tenant info from the database
            const tenantId = JSON.parse(atob(token.split('.')[1])).tenantId;
            if (tenantId) {
                try {
                    const res = await fetch(`/api/tenants/${tenantId}`, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setTenantInfo(data.tenant);
                    }
                } catch (error) {
                    // Ignore error, just don't show tenant info
                }
            }
        };

        verifyAdminAndFetchTenant();
        fetchTenants();
    }, [router]);

    const fetchTenants = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/admin/tenants', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();

            if (response.ok) {
                // Calculate total revenue only for paid tenants
                const totalRevenue = data.tenants
                  .filter((t: TenantData) => t.paymentStatus === 'paid')
                  .reduce((sum: number, t: TenantData) => {
                    return sum + (t.subscriptionPlan === 'premium' ? 1200 : 799);
                  }, 0);

                setTenants(data.tenants);
                setStats({
                    totalTenants: data.totalTenants,
                    activeTenants: data.tenants.filter((t: TenantData) => t.isActive).length,
                    totalRevenue
                });
            }
        } catch (error) {
            toast.error('Failed to fetch tenants');
        } finally {
            setLoading(false);
        }
    };

    const toggleTenantStatus = async (tenantId: string, isActive: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/tenants/${tenantId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive }),
            });

            if (response.ok) {
                await fetchTenants();
                toast.success('Tenant status updated successfully');
            } else {
                throw new Error('Failed to update tenant status');
            }
        } catch (error) {
            toast.error('Failed to update tenant status');
        }
    };

    const updatePaymentStatus = async (tenantId: string, status: 'pending' | 'paid' | 'overdue') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/tenants/${tenantId}/payment`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ paymentStatus: status }),
            });

            if (response.ok) {
                await fetchTenants();
                toast.success('Payment status updated successfully');
            } else {
                throw new Error('Failed to update payment status');
            }
        } catch (error) {
            toast.error('Failed to update payment status');
        }
    };

    // Add handler for updating subscription plan
    const updateSubscriptionPlan = async (tenantId: string, subscriptionPlan: 'basic' | 'premium' | 'custom') => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/admin/tenants/${tenantId}/plan`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ subscriptionPlan }),
            });

            if (response.ok) {
                await fetchTenants();
                toast.success('Subscription plan updated successfully');
            } else {
                throw new Error('Failed to update subscription plan');
            }
        } catch (error) {
            toast.error('Failed to update subscription plan');
        }
    };

    if (accessError) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        Only AWDTECH admin can access the admin dashboard. You will be redirected.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Show AWDTECH tenant info */}
            {tenantInfo && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>AWDTECH Tenant Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="font-semibold">Business Name:</div>
                                <div>{tenantInfo.name}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Business Type:</div>
                                <div>{tenantInfo.businessType}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Email:</div>
                                <div>{tenantInfo.email}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Phone:</div>
                                <div>{tenantInfo.phone}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Address:</div>
                                <div>{tenantInfo.address}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Subscription Plan:</div>
                                <div>{tenantInfo.subscriptionPlan}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Payment Status:</div>
                                <div>{tenantInfo.paymentStatus}</div>
                            </div>
                            <div>
                                <div className="font-semibold">Active:</div>
                                <div>{tenantInfo.isActive ? 'Yes' : 'No'}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Tenants</p>
                                <h3 className="text-2xl font-bold mt-2">{stats.totalTenants}</h3>
                            </div>
                            <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Active Tenants</p>
                                <h3 className="text-2xl font-bold mt-2">{stats.activeTenants}</h3>
                            </div>
                            <Users className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                                <h3 className="text-2xl font-bold mt-2">R{stats.totalRevenue}</h3>
                            </div>
                            <CreditCard className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tenant Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Business Name</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Employees</TableHead>
                                    <TableHead>Customers</TableHead>
                                    <TableHead>Payment Status</TableHead>
                                    <TableHead>Active Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenants.map((tenant) => (
                                    <TableRow key={tenant._id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{tenant.name}</div>
                                                <div className="text-sm text-gray-500">{tenant.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {/* Plan select for admin */}
                                            <select
                                                className="block w-full p-2 text-sm border rounded-md"
                                                value={tenant.subscriptionPlan}
                                                onChange={async (e) => {
                                                    await updateSubscriptionPlan(
                                                        tenant._id,
                                                        e.target.value as 'basic' | 'premium' | 'custom'
                                                    );
                                                }}
                                            >
                                                <option value="basic">Basic</option>
                                                <option value="premium">Premium</option>
                                                <option value="custom">Custom</option>
                                            </select>
                                        </TableCell>
                                        <TableCell>{tenant.employeeCount}</TableCell>
                                        <TableCell>{tenant.customerCount}</TableCell>
                                        <TableCell>
                                            <select
                                                className="block w-full p-2 text-sm border rounded-md"
                                                value={tenant.paymentStatus}
                                                onChange={async (e) => {
                                                    await updatePaymentStatus(
                                                        tenant._id,
                                                        e.target.value as 'pending' | 'paid' | 'overdue'
                                                    );
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="paid">Paid</option>
                                                <option value="overdue">Overdue</option>
                                            </select>
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={tenant.isActive}
                                                onCheckedChange={async (checked) => {
                                                    await toggleTenantStatus(tenant._id, checked);
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTenant(tenant);
                                                    setShowTenantDialog(true);
                                                }}
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Tenant Details Dialog */}
            <Dialog open={showTenantDialog} onOpenChange={setShowTenantDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Business Info</DialogTitle>
                        <DialogDescription>
                            {selectedTenant?.name}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTenant && (
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">Business Name: </span>
                                {selectedTenant.name}
                            </div>
                            <div>
                                <span className="font-semibold">Business Type: </span>
                                {selectedTenant.businessType}
                            </div>
                            <div>
                                <span className="font-semibold">Email: </span>
                                {selectedTenant.email}
                            </div>
                            <div>
                                <span className="font-semibold">Phone: </span>
                                {selectedTenant.phone}
                            </div>
                            <div>
                                <span className="font-semibold">Subscription Plan: </span>
                                {selectedTenant.subscriptionPlan}
                            </div>
                            <div>
                                <span className="font-semibold">Payment Status: </span>
                                {selectedTenant.paymentStatus}
                            </div>
                            <div>
                                <span className="font-semibold">Active: </span>
                                {selectedTenant.isActive ? 'Yes' : 'No'}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
