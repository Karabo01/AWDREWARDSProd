'use client';

import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Plus, Gift, Award } from 'lucide-react';
import { IReward } from '@/models/Reward';
import { toast } from '@/hooks/use-toast';

export default function RewardsPage() {
    const [rewards, setRewards] = useState<IReward[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newReward, setNewReward] = useState({
        name: '',
        description: '',
        pointsRequired: 0,
    });

    const fetchRewards = async () => {
        try {
            const response = await fetch('/api/rewards');
            const data = await response.json();
            
            if (response.ok) {
                setRewards(data.rewards);
            }
        } catch (error) {
            console.error('Failed to fetch rewards:', error);
            toast({
                title: 'Error',
                description: 'Failed to load rewards',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRewards();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/rewards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newReward),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Reward created successfully',
                });
                setShowAddForm(false);
                setNewReward({ name: '', description: '', pointsRequired: 0 });
                fetchRewards();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create reward',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Rewards Program</h1>
                <Button onClick={() => setShowAddForm(!showAddForm)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Reward
                </Button>
            </div>

            {showAddForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Reward</CardTitle>
                        <CardDescription>Create a new reward for your customers</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name">Reward Name</label>
                                <Input
                                    id="name"
                                    value={newReward.name}
                                    onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="description">Description</label>
                                <Input
                                    id="description"
                                    value={newReward.description}
                                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="points">Points Required</label>
                                <Input
                                    id="points"
                                    type="number"
                                    min="0"
                                    value={newReward.pointsRequired}
                                    onChange={(e) => setNewReward({ ...newReward, pointsRequired: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-4">
                                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">Create Reward</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Available Rewards</CardTitle>
                    <CardDescription>Manage your reward offerings</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Reward</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Points Required</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Redemptions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            Loading rewards...
                                        </TableCell>
                                    </TableRow>
                                ) : rewards.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            <div className="flex flex-col items-center py-8">
                                                <Gift className="h-12 w-12 text-gray-400 mb-4" />
                                                <p className="text-gray-500">No rewards available</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    rewards.map((reward) => (
                                        <TableRow key={reward._id}>
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
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}