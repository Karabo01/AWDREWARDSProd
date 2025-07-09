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
import { QrCode } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface VisitFormData {
    customerId: string;
    amount: number;
    points?: number;
    notes?: string;
}

// Dynamically import react-qr-scanner to avoid SSR issues
const QrReader = dynamic(() => import('react-qr-scanner'), { ssr: false });

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
    const [showQrDialog, setShowQrDialog] = useState(false);
    const [user, setUser] = useState<{ username: string } | null>(null);
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
            toast({
                title: 'Camera Permission',
                description: 'Please allow camera access to scan QR codes.',
                variant: 'destructive',
            });
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

    useEffect(() => {
        // Set back camera as default for mobile devices
        if (isMobileDevice()) {
            setFacingMode('environment');
        }

        // Fetch customers for dropdown
        const fetchCustomers = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/customers', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setCustomers(data.customers);
                } else {
                    toast({
                        title: 'Error',
                        description: data.message || 'Failed to fetch customers',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                console.error('Failed to fetch customers:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load customers',
                    variant: 'destructive',
                });
            }
        };

        fetchCustomers();

        // Get logged in user info from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ username: payload.username });
                setFormData((prev) => ({
                    ...prev,
                    notes: payload.username // Set notes to username by default
                }));
            } catch {}
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Always set notes to username before submit
        const token = localStorage.getItem('token');
        let username = '';
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                username = payload.username;
            } catch {}
        }

        try {
            const response = await fetch('/api/visits', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, notes: username }),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Visit logged successfully',
                });
                router.push('/dashboard/customers'); // Changed from '/dashboard/visits' to '/dashboard/customers'
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

    // Handle QR scan result
    const handleQrScan = (result: any) => {
        if (result && result.text) {
            try {
                const data = JSON.parse(result.text);

                // Handle points earning QR
                if (data.name && data.phone && data.tenantId) {
                    // Find customer by phone (or name/tenantId if needed)
                    const found = customers.find(
                        c => c.phone === data.phone && c.tenantId.includes(data.tenantId)
                    );
                    if (found) {
                        setFormData((prev) => ({
                            ...prev,
                            customerId: String(found._id),
                        }));
                        toast({
                            title: 'QR Scan',
                            description: `Customer "${found.firstName} ${found.lastName}" selected.`,
                        });
                    } else {
                        toast({
                            title: 'QR Scan',
                            description: 'Customer not found for this QR code.',
                            variant: 'destructive',
                        });
                    }
                    setShowQrDialog(false);
                    return;
                }

                // Handle reward redemption QR (not for this page, but show info)
                if (data.action === 'REDEEM_REWARD' && data.userId && data.rewardId) {
                    toast({
                        title: 'QR Scan',
                        description: 'This QR code is for reward redemption, not points earning.',
                        variant: 'destructive',
                    });
                    setShowQrDialog(false);
                    return;
                }

                toast({
                    title: 'QR Scan',
                    description: 'Invalid QR code format.',
                    variant: 'destructive',
                });
            } catch {
                toast({
                    title: 'QR Scan',
                    description: 'Invalid QR code data.',
                    variant: 'destructive',
                });
            }
        }
    };

    return (
        <div className="container mx-auto p-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Log Customer Visit</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleQrButtonClick}
                        >
                            <QrCode className="mr-2 h-4 w-4" />
                            Scan QR
                        </Button>
                    </div>
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
                                        <SelectItem key={String(customer._id)} value={String(customer._id)}>
                                            {customer.firstName} {customer.lastName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (R)</Label>
                            <div className="flex">
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

                        {/* Replace Notes with Processed By */}
                        <div className="space-y-2">
                            <Label htmlFor="processedBy">Processed By</Label>
                            <Input
                                id="processedBy"
                                value={user?.username || ''}
                                readOnly
                                disabled
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
                                    toast({ 
                                        title: 'QR Error', 
                                        description: 'Camera error. Please check camera permissions.', 
                                        variant: 'destructive' 
                                    });
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