'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, DollarSign, Mail, Phone, MapPin, Palette, Plus, AlertCircle, Award, Gift } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ISettings } from '@/models/Settings';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { IUser } from '@/models/User';
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Types } from 'mongoose';

interface IEmployee extends IUser {
    _id: Types.ObjectId | string;
    employeeId: string;
    username: string;
    email: string;
    position?: string;
    department?: string;
    isActive: boolean;
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Partial<ISettings>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [accessError, setAccessError] = useState<boolean>(false);
    const [rewards, setRewards] = useState<any[]>([]);
    const [loadingRewards, setLoadingRewards] = useState(true);
    const [pendingReward, setPendingReward] = useState({ name: '', description: '', pointsRequired: 0 });
    const router = useRouter();

    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/settings');
            const data = await response.json();
            if (response.ok) {
                setSettings(data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast({
                title: 'Error',
                description: 'Failed to load settings',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/employees', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setEmployees(data.employees);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load employees',
                variant: 'destructive',
            });
        } finally {
            setLoadingEmployees(false);
        }
    };

    const fetchRewards = useCallback(async () => {
        setLoadingRewards(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/rewards', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                setRewards(data.rewards);
            } else if (response.status === 401) {
                toast({
                    title: 'Session Expired',
                    description: 'Please log in again.',
                    variant: 'destructive',
                });
                router.push('/auth/login');
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Failed to load rewards',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load rewards',
                variant: 'destructive',
            });
        } finally {
            setLoadingRewards(false);
        }
    }, [router]);

    useEffect(() => {
        fetchSettings();
        fetchEmployees();
        fetchRewards();
    }, [fetchRewards]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/auth/login');
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.role !== 'business_owner') {
                setAccessError(true);
                toast({
                    title: "Access Denied",
                    description: "Only business owners can access settings",
                    variant: "destructive",
                });
                setTimeout(() => {
                    router.push('/dashboard');
                }, 2000);
                return;
            }
            setUserRole(payload.role);
        } catch (error) {
            router.push('/auth/login');
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                throw new Error('Failed to update settings');
            }

            toast({
                title: 'Success',
                description: 'Settings updated successfully',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update settings',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const handleAddReward = async () => {
        if (
            !pendingReward.name ||
            !pendingReward.description ||
            !pendingReward.pointsRequired ||
            pendingReward.pointsRequired <= 0
        ) {
            toast({
                title: 'Error',
                description: 'Please fill all reward fields',
                variant: 'destructive',
            });
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/rewards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(pendingReward),
            });
            const data = await response.json();
            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Reward created successfully',
                });
                setPendingReward({ name: '', description: '', pointsRequired: 0 });
                await fetchRewards();
            } else if (response.status === 401) {
                toast({
                    title: 'Session Expired',
                    description: 'Please log in again.',
                    variant: 'destructive',
                });
                router.push('/auth/login');
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Failed to create reward',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create reward',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteReward = async (rewardId: string) => {
        if (!window.confirm('Are you sure you want to delete this reward?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/rewards/${rewardId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Reward deleted successfully',
                });
                await fetchRewards();
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Failed to delete reward',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete reward',
                variant: 'destructive',
            });
        }
    };

    const handleStatusToggle = async (employeeId: string, isActive: boolean) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/employees/${employeeId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isActive }),
            });

            if (response.ok) {
                setEmployees(prevEmployees => 
                    prevEmployees.map(emp => 
                        emp._id.toString() === employeeId
                            ? { ...emp, isActive } as IEmployee
                            : emp
                    )
                );
                toast({
                    title: 'Success',
                    description: `Employee ${isActive ? 'activated' : 'deactivated'} successfully`,
                });
            } else {
                throw new Error('Failed to update status');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update employee status',
                variant: 'destructive',
            });
        }
    };

    if (accessError) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
                <Alert variant="destructive" className="max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        Sorry, only business owners can access the settings page. 
                        You will be redirected to the dashboard.
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    if (loading || !userRole || userRole !== 'business_owner') {
        return <div className="flex justify-center items-center h-96">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold mb-8">Settings</h1>

            <form onSubmit={handleSubmit}>
                <Tabs defaultValue="business" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="business">Business Info</TabsTrigger>
                        <TabsTrigger value="rewards-program">Rewards Program</TabsTrigger>
                        <TabsTrigger value="appearance">Appearance</TabsTrigger>
                        <TabsTrigger value="employees">Employees</TabsTrigger>
                    </TabsList>

                    <TabsContent value="business">
                        <Card>
                            <CardHeader>
                                <CardTitle>Business Information</CardTitle>
                                <CardDescription>
                                    Manage your business details and contact information
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="businessName">Business Name</Label>
                                    <div className="flex">
                                        <Building className="w-4 h-4 text-gray-500 mr-2 mt-3" />
                                        <Input
                                            id="businessName"
                                            value={settings.businessName || ''}
                                            onChange={(e) => setSettings({ ...settings, businessName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="flex">
                                        <Mail className="w-4 h-4 text-gray-500 mr-2 mt-3" />
                                        <Input
                                            id="email"
                                            type="email"
                                            value={settings.email || ''}
                                            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <div className="flex">
                                        <Phone className="w-4 h-4 text-gray-500 mr-2 mt-3" />
                                        <Input
                                            id="phone"
                                            value={settings.phone || ''}
                                            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <div className="flex">
                                        <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-3" />
                                        <Input
                                            id="address"
                                            value={settings.address || ''}
                                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rewards-program">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rewards Program Settings</CardTitle>
                                <CardDescription>
                                    Configure your rewards program parameters and manage rewards
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Rewards creation and list */}
                                <div>
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold">Rewards Management</h3>
                                            <p className="text-sm text-gray-500">
                                                Create and manage your customer rewards
                                            </p>
                                        </div>
                                    </div>
                                    {/* Add new reward inline */}
                                    <div className="mb-4 flex flex-col gap-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Reward Name"
                                                value={pendingReward.name}
                                                onChange={e => setPendingReward(r => ({ ...r, name: e.target.value }))}
                                            />
                                            <Input
                                                placeholder="Description"
                                                value={pendingReward.description}
                                                onChange={e => setPendingReward(r => ({ ...r, description: e.target.value }))}
                                            />
                                            <Input
                                                placeholder="Points Required"
                                                type="number"
                                                min="0"
                                                value={pendingReward.pointsRequired || ''}
                                                onChange={e => setPendingReward(r => ({ ...r, pointsRequired: parseInt(e.target.value) || 0 }))}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleAddReward}
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg">
                                        {!loadingRewards && (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Reward</TableHead>
                                                        <TableHead>Description</TableHead>
                                                        <TableHead>Points Required</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Redemptions</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {rewards.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center">
                                                                <div className="flex flex-col items-center py-8">
                                                                    <Gift className="h-12 w-12 text-gray-400 mb-4" />
                                                                    <p className="text-gray-500">No rewards available</p>
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        rewards.map((reward) => (
                                                            <TableRow key={String(reward._id)}>
                                                                <TableCell>
                                                                    <div className="flex items-center space-x-3">
                                                                        <Award className="h-5 w-5 text-blue-500" />
                                                                        <span className="font-medium">{reward.name}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>{reward.description}</TableCell>
                                                                <TableCell>{reward.pointsRequired} points</TableCell>
                                                                <TableCell>
                                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                        reward.status === 'active' 
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : 'bg-red-100 text-red-800'
                                                                    }`}>
                                                                        {reward.status}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell>{reward.redemptionCount}</TableCell>
                                                                <TableCell>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteReward(reward._id)}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        )}
                                        {loadingRewards && (
                                            <div className="py-8 text-center text-gray-500">Loading rewards...</div>
                                        )}
                                    </div>
                                </div>

                                {/* Rewards program settings */}
                                <div className="space-y-2">
                                    <Label htmlFor="pointsPerDollar">Points per Rand</Label>
                                    <div className="flex">
                                        <DollarSign className="w-4 h-4 text-gray-500 mr-2 mt-3" />
                                        <Input
                                            id="pointsPerDollar"
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={settings.pointsPerDollar || ''}
                                            onChange={(e) => setSettings({ ...settings, pointsPerDollar: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="minimumPurchase">Minimum Purchase Amount (R)</Label>
                                    <div className="flex">
                                        <Input
                                            id="minimumPurchase"
                                            type="number"
                                            min="0"
                                            value={settings.minimumPurchase || ''}
                                            onChange={(e) => setSettings({ ...settings, minimumPurchase: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="welcomeBonus">Welcome Bonus Points</Label>
                                    <div className="flex">
                                        <DollarSign className="w-4 h-4 text-gray-500 mr-2 mt-3" />
                                        <Input
                                            id="welcomeBonus"
                                            type="number"
                                            min="0"
                                            value={settings.welcomeBonus || ''}
                                            onChange={(e) => setSettings({ ...settings, welcomeBonus: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance">
                        <Card>
                            <CardHeader>
                                <CardTitle>Appearance Settings</CardTitle>
                                <CardDescription>
                                    Customize the look and feel of your rewards program
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="primaryColor">Primary Color</Label>
                                    <div className="flex">
                                        <Palette className="w-4 h-4 text-gray-500 mr-2 mt-3" />
                                        <Input
                                            id="primaryColor"
                                            type="color"
                                            value={settings.theme?.primaryColor || '#2563eb'}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                theme: {
                                                    primaryColor: e.target.value,
                                                    secondaryColor: settings.theme?.secondaryColor ?? '#f59e0b'
                                                }
                                            })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                                    <div className="flex">
                                        <Palette className="w-4 h-4 text-gray-500 mr-2 mt-3" />
                                        <Input
                                            id="secondaryColor"
                                            type="color"
                                            value={settings.theme?.secondaryColor || '#f59e0b'}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                theme: {
                                                    primaryColor: settings.theme?.primaryColor ?? '#2563eb',
                                                    secondaryColor: e.target.value
                                                }
                                            })}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="employees">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Employee Management</CardTitle>
                                        <CardDescription>
                                            Manage employee accounts and permissions
                                        </CardDescription>
                                    </div>
                                    <Button
                                        onClick={() => router.push('/dashboard/employees/add')}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Employee
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Employee ID</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Position</TableHead>
                                                <TableHead>Department</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {loadingEmployees ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center">
                                                        Loading employees...
                                                    </TableCell>
                                                </TableRow>
                                            ) : employees.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center">
                                                        No employees found
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                employees.map((employee) => (
                                                    <TableRow key={employee._id.toString()}>
                                                        <TableCell>{employee.employeeId}</TableCell>
                                                        <TableCell>{employee.username}</TableCell>
                                                        <TableCell>{employee.email}</TableCell>
                                                        <TableCell>{employee.position}</TableCell>
                                                        <TableCell>
                                                            <span className="capitalize">
                                                                {employee.department}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Switch
                                                                    checked={employee.isActive}
                                                                    onCheckedChange={(checked) => handleStatusToggle(String(employee._id), checked)}
                                                                />
                                                                <span className={`text-xs font-medium ${
                                                                    employee.isActive 
                                                                        ? 'text-green-600'
                                                                        : 'text-red-600'
                                                                }`}>
                                                                    {employee.isActive ? 'Active' : 'Inactive'}
                                                                </span>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end mt-6">
                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}