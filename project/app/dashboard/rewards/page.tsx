'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { QrCode, Search, Gift } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import react-qr-scanner to avoid SSR issues
const QrReader = dynamic(() => import('react-qr-scanner'), { ssr: false });

export default function RewardsRedemptionPage() {
    const [search, setSearch] = useState('');
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
    const [showRedeemDialog, setShowRedeemDialog] = useState(false);
    const [rewards, setRewards] = useState<any[]>([]);
    const [selectedReward, setSelectedReward] = useState<string>('');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [showQrDialog, setShowQrDialog] = useState(false);
    const [tenantId, setTenantId] = useState<string | null>(null);

    // Fetch rewards for redemption
    const fetchRewards = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/rewards', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setRewards(data.rewards || []);
        } catch (error) {
            toast.error('Failed to fetch rewards');
        }
    };

    // Search customers
    const handleSearch = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams({
                search,
                limit: '10',
            });
            const response = await fetch(`/api/customers?${params}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const data = await response.json();
            setCustomers(data.customers || []);
        } catch (error) {
            toast.error('Failed to search customers');
        } finally {
            setLoading(false);
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
        fetchRewards();
    }, []);

    // QR scan handler
    const handleQrScan = (result: any) => {
        if (result && result.text) {
            try {
                const data = JSON.parse(result.text);
                if (data.customerId && data.rewardId) {
                    const customer = customers.find(c => String(c._id) === data.customerId);
                    const reward = rewards.find(r => String(r._id) === data.rewardId);
                    if (!customer) {
                        toast.error('Customer not found for this QR code');
                        setShowQrDialog(false);
                        return;
                    }
                    if (!reward) {
                        toast.error('Reward not found for this QR code');
                        setShowQrDialog(false);
                        return;
                    }
                    setSelectedCustomer(customer);
                    setSelectedReward(String(reward._id));
                    setShowRedeemDialog(true);
                    setShowQrDialog(false);
                } else {
                    toast.error('Invalid QR code format');
                }
            } catch {
                toast.error('Invalid QR code data');
            }
        }
    };

    // Redeem reward for customer
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
                setSelectedReward('');
            } else {
                toast.error(data.message || 'Failed to redeem reward');
            }
        } catch (error) {
            toast.error('Failed to redeem reward');
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Redeem Rewards</CardTitle>
                    <Button variant="outline" onClick={() => setShowQrDialog(true)}>
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2 mb-4">
                        <Input
                            placeholder="Search customer by name, email, or phone"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
                        />
                        <Button onClick={handleSearch} disabled={loading}>
                            <Search className="h-4 w-4 mr-1" />
                            Search
                        </Button>
                    </div>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Points</TableHead>
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
                                                {customer.firstName} {customer.lastName}
                                            </TableCell>
                                            <TableCell>{customer.email}</TableCell>
                                            <TableCell>{customer.phone}</TableCell>
                                            <TableCell>
                                                {tenantId && customer.pointsByTenant
                                                    ? customer.pointsByTenant[tenantId] || 0
                                                    : 0}
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setShowRedeemDialog(true);
                                                    }}
                                                >
                                                    Redeem
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Redeem Reward Dialog */}
            <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Redeem Reward</DialogTitle>
                        <DialogDescription>
                            {selectedCustomer && (
                                <p>
                                    {selectedCustomer.firstName} {selectedCustomer.lastName} <br />
                                    Points: {
                                        tenantId && selectedCustomer.pointsByTenant
                                            ? selectedCustomer.pointsByTenant[tenantId] || 0
                                            : 0
                                    }
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label>Select Reward</label>
                            <select
                                className="block w-full p-2 text-sm border rounded-md"
                                value={selectedReward}
                                onChange={e => setSelectedReward(e.target.value)}
                            >
                                <option value="">Choose a reward</option>
                                {rewards.map((reward) => (
                                    <option
                                        key={String(reward._id)}
                                        value={String(reward._id)}
                                        disabled={
                                            !!selectedCustomer &&
                                            !!tenantId &&
                                            reward.pointsRequired >
                                                ((selectedCustomer.pointsByTenant &&
                                                    selectedCustomer.pointsByTenant[tenantId]) || 0)
                                        }
                                    >
                                        {reward.name} ({reward.pointsRequired} points)
                                    </option>
                                ))}
                            </select>
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

            {/* QR Scanner Dialog */}
            <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Scan Customer QR Code</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center">
                        <div style={{ width: 280, height: 280 }}>
                            <QrReader
                                scanDelay={300}
                                onError={() => toast.error('Camera error')}
                                onScan={handleQrScan}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                        <Button className="mt-4" variant="outline" onClick={() => setShowQrDialog(false)}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}