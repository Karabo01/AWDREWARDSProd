'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, DollarSign, Mail, Phone, MapPin, Palette } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ISettings } from '@/models/Settings';

export default function SettingsPage() {
    const [settings, setSettings] = useState<Partial<ISettings>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

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

    if (loading) {
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
                                    <Label htmlFor="pointsPerDollar">Points per Dollar</Label>
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
                                    <Label htmlFor="minimumPurchase">Minimum Purchase Amount ($)</Label>
                                    <div className="flex">
                                        <DollarSign className="w-4 h-4 text-gray-500 mr-2 mt-3" />
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