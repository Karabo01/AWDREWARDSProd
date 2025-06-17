'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, DollarSign, Mail, Phone, MapPin, Palette, Plus, AlertCircle } from 'lucide-react';
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
    const router = useRouter();

    useEffect(() => {
        fetchSettings();
        fetchEmployees();
    }, []);

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
                }, 2000); // Redirect after 2 seconds
                return;
            }
            setUserRole(payload.role);
        } catch (error) {
            router.push('/auth/login');
        }
    }, [router]);

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

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Settings updated successfully',
                });
            } else {
                throw new Error('Failed to update settings');
            }
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
                        <TabsTrigger value="rewards">Rewards Program</TabsTrigger>
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

                    <TabsContent value="rewards">
                        <Card>
                            <CardHeader>
                                <CardTitle>Rewards Program Settings</CardTitle>
                                <CardDescription>
                                    Configure your rewards program parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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