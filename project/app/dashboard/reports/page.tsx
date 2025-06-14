'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Users, Award, CreditCard, TrendingUp, Gift } from 'lucide-react';

interface DashboardData {
    totalCustomers: number;
    totalPoints: number;
    totalRewards: number;
    averageSpend: number;
    visitsByDay: Array<{ date: string; visits: number }>;
    pointsByMonth: Array<{ month: string; points: number }>;
}

export default function ReportsPage() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/auth/login');
                return;
            }

            const response = await fetch('/api/reports/dashboard', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const jsonData = await response.json();
            if (response.ok) {
                setData({
                    totalCustomers: jsonData.totalCustomers || 0,
                    totalPoints: jsonData.totalPoints || 0,
                    totalRewards: jsonData.totalRewards || 0,
                    averageSpend: jsonData.revenue ? jsonData.revenue / jsonData.totalVisits : 0,
                    visitsByDay: jsonData.visitsByDay || [],
                    pointsByMonth: jsonData.pointsByMonth || []
                });
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-96">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold mb-8">Reports & Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Customers"
                    value={data?.totalCustomers || 0}
                    icon={<Users className="h-8 w-8 text-blue-600" />}
                />
                <StatCard
                    title="Total Points Issued"
                    value={data?.totalPoints || 0}
                    icon={<Award className="h-8 w-8 text-amber-600" />}
                />
                <StatCard
                    title="Active Rewards"
                    value={data?.totalRewards || 0}
                    icon={<Gift className="h-8 w-8 text-green-600" />}
                />
                <StatCard
                    title="Avg. Transaction"
                    value={`$${(data?.averageSpend || 0).toFixed(2)}`}
                    icon={<CreditCard className="h-8 w-8 text-purple-600" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Visits</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data?.visitsByDay || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line
                                        type="monotone"
                                        dataKey="visits"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Points Issued by Month</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.pointsByMonth || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar
                                        dataKey="points"
                                        fill="#2563eb"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
}

function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">{title}</p>
                        <h3 className="text-2xl font-bold mt-2">{value}</h3>
                    </div>
                    {icon}
                </div>
            </CardContent>
        </Card>
    );
}