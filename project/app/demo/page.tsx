'use client';

import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { Users, Award, Gift, CreditCard, Crown } from 'lucide-react';
import { generateMockData } from '@/lib/mock-data';

export default function DemoPage() {
    const [data, setData] = useState(generateMockData());

    // Refresh data every 30 seconds to simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setData(generateMockData());
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Demo Dashboard</h1>
                <div className="text-sm text-gray-500">
                    Auto-refreshes every 30 seconds
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Customers"
                    value={data.totalCustomers}
                    icon={<Users className="h-8 w-8 text-blue-600" />}
                />
                <StatCard
                    title="Total Points"
                    value={data.totalPoints.toLocaleString()}
                    icon={<Award className="h-8 w-8 text-amber-600" />}
                />
                <StatCard
                    title="Available Rewards"
                    value={data.totalRewards}
                    icon={<Gift className="h-8 w-8 text-green-600" />}
                />
                <StatCard
                    title="Avg. Transaction"
                    value={`$${data.averageSpend.toFixed(2)}`}
                    icon={<CreditCard className="h-8 w-8 text-purple-600" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Daily Visits (Last 7 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.visitsByDay}>
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
                        <CardTitle>Points Issued (Last 6 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.pointsByMonth}>
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

            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <Crown className="h-6 w-6 text-amber-500" />
                        <CardTitle>Top Customers</CardTitle>
                    </div>
                    <CardDescription>
                        Customers with the most points and visits
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Visits</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.topCustomers.map((customer, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">
                                        {customer.name}
                                    </TableCell>
                                    <TableCell>{customer.points}</TableCell>
                                    <TableCell>{customer.visits}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
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