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
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    // Helper function to detect mobile devices
    const isMobileDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    // Handle camera permission check
    const handleCameraPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            // Camera access granted
            stream.getTracks().forEach(track => track.stop()); // Stop the stream
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            toast.error('Please allow camera access to scan QR codes.');
            return false;
        }
    };

    // Handle QR button click with permission check
    const handleQrButtonClick = async () => {
        const hasPermission = await handleCameraPermission();
        if (hasPermission) {
            setShowQrDialog(true);
        }
    };

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
        // Set back camera as default for mobile devices
        if (isMobileDevice()) {
            setFacingMode('environment');
        }

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
    const handleQrScan = async (result: any) => {
        if (result && result.text) {
            try {
                const data = JSON.parse(result.text);

                // Handle reward redemption QR (new format: name, rewardId, tenantId, action)
                if (
                    data.action === 'REDEEM_REWARD' &&
                    data.name &&
                    data.rewardId &&
                    data.tenantId
                ) {
                    // Split name into first and last (best effort)
                    const [firstName, ...rest] = data.name.trim().split(' ');
                    const lastName = rest.join(' ');

                    // Try to find customer by name and tenantId
                    let customer = customers.find(
                        c =>
                            c.firstName.trim().toLowerCase() === (firstName || '').toLowerCase() &&
                            c.lastName.trim().toLowerCase() === (lastName || '').toLowerCase() &&
                            (Array.isArray(c.tenantId)
                                ? c.tenantId.includes(data.tenantId)
                                : c.tenantId === data.tenantId)
                    );
                    let reward = rewards.find(r => String(r._id) === data.rewardId);

                    // If not found, fetch from API
                    if (!customer) {
                        try {
                            const token = localStorage.getItem('token');
                            // Search customers by firstName and lastName
                            const params = new URLSearchParams({
                                search: firstName,
                                limit: '10'
                            });
                            const res = await fetch(`/api/customers?${params}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (res.ok) {
                                const respData = await res.json();
                                customer = (respData.customers || []).find(
                                    (c: any) =>
                                        c.firstName.trim().toLowerCase() === (firstName || '').toLowerCase() &&
                                        c.lastName.trim().toLowerCase() === (lastName || '').toLowerCase() &&
                                        (Array.isArray(c.tenantId)
                                            ? c.tenantId.includes(data.tenantId)
                                            : c.tenantId === data.tenantId)
                                );
                            }
                        } catch {}
                    }
                    if (!reward) {
                        try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`/api/rewards/${data.rewardId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            if (res.ok) {
                                reward = await res.json();
                            }
                        } catch {}
                    }

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
                    return;
                }

                // Handle points earning QR (show info, but not redeem here)
                if (data.name && data.phone && data.tenantId) {
                    toast.success(`Customer: ${data.name} (${data.phone})\nTenant: ${data.tenantId}`);
                    setShowQrDialog(false);
                    // Optionally, you could redirect or prefill a form for points earning
                    return;
                }

                toast.error('Invalid QR code format');
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
                setSelectedCustomer(null); // <-- Add this line to clear the selected customer
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
                    <Button variant="outline" onClick={handleQrButtonClick}>
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
                                onError={(error) => {
                                    console.error('QR Scanner error:', error);
                                    toast.error('Camera error. Please check camera permissions.');
                                }}
                                onScan={handleQrScan}
                                style={{ width: '100%', height: '100%' }}
                                constraints={{
                                    video: {
                                        facingMode: facingMode,
                                        width: { ideal: 1280 },
                                        height: { ideal: 720 },
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
                            >
                                {facingMode === 'environment' ? 'Front Camera' : 'Back Camera'}
                            </Button>
                            <Button variant="outline" onClick={() => setShowQrDialog(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}