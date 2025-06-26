'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Phone, Mail } from 'lucide-react';
import { ICustomer } from '@/models/Customer';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

export default function CustomersPage() {
    const router = useRouter();
    const params = useSearchParams();
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showRedeemDialog, setShowRedeemDialog] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<ICustomer | null>(null);
    const [selectedReward, setSelectedReward] = useState<string>('');
    const [rewards, setRewards] = useState<any[]>([]);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);

    const fetchCustomers = async (page: number, search: string = '') => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
            });

            const response = await fetch(`/api/customers?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();

            if (response.ok) {
                setCustomers(data.customers);
                setTotalPages(data.pagination.pages);
            } else {
                toast.error(data.message || 'Failed to fetch customers');
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            toast.error('Failed to load customers');
        } finally {
            setLoading(false);
        }
    };

    const fetchRewards = async () => {
        try {
            const response = await fetch('/api/rewards');
            const data = await response.json();
            setRewards(data.rewards);
        } catch (error) {
            console.error('Failed to fetch rewards:', error);
        }
    };

    useEffect(() => {
        // Get tenantId from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setTenantId(payload.tenantId);
            } catch {}
        }

        fetchCustomers(currentPage, searchTerm);
        fetchRewards();
    }, [currentPage, searchTerm, params.toString()]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    const handleRedeemReward = async () => {
        if (!selectedCustomer || !selectedReward) return;

        setIsRedeeming(true);
        try {
            const response = await fetch('/api/rewards/redeem', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: selectedCustomer._id,
                    rewardId: selectedReward
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Reward redeemed successfully');
                setShowRedeemDialog(false);
                fetchCustomers(currentPage, searchTerm); // Refresh customer list
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to redeem reward');
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Customers</CardTitle>
                    <Button
                        onClick={() => router.push('/dashboard/customers/add')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search customers..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No customers found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((customer) => (
                                        <TableRow key={String(customer._id)}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {customer.firstName} {customer.lastName}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        {customer.email}
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Phone className="mr-2 h-4 w-4" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {/* Show points for current tenant */}
                                                {tenantId && customer.pointsByTenant
                                                    ? customer.pointsByTenant[tenantId] || 0
                                                    : 0}
                                            </TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    customer.status === 'active' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {customer.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.push(`/dashboard/customers/${customer._id}`)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedCustomer(customer);
                                                            setShowRedeemDialog(true);
                                                        }}
                                                    >
                                                        Redeem
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center space-x-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="py-2 px-3 text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Redeem Reward</DialogTitle>
                        <DialogDescription>
                            {selectedCustomer && (
                                <p>
                                    Available Points: {tenantId && selectedCustomer.pointsByTenant
                                        ? selectedCustomer.pointsByTenant[tenantId] || 0
                                        : 0}
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Reward</Label>
                            <Select
                                value={selectedReward}
                                onValueChange={setSelectedReward}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a reward" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rewards.map((reward) => (
                                        <SelectItem
                                            key={String(reward._id)}
                                            value={String(reward._id)}
                                            disabled={Boolean(!!selectedCustomer && tenantId && reward.pointsRequired > (selectedCustomer.pointsByTenant?.[tenantId] || 0))}
                                        >
                                            {reward.name} ({reward.pointsRequired} points)
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowRedeemDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRedeemReward}
                                disabled={!selectedReward || isRedeeming}
                            >
                                {isRedeeming ? 'Redeeming...' : 'Redeem'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {selectedCustomer && (
                <div className="mt-6">
                    <Label>Points Balance</Label>
                    <p className="text-2xl font-bold">
                        {tenantId && selectedCustomer.pointsByTenant
                            ? selectedCustomer.pointsByTenant[tenantId] || 0
                            : 0}
                    </p>
                </div>
            )}
        </div>
    );
}