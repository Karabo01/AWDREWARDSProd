"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Gift, 
  TrendingUp, 
  Plus, 
  MoreVertical,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  tenantId: string;
}

interface DashboardStats {
  totalCustomers: number;
  totalVisits: number;
  pointsRedeemed: number;
  revenue: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalVisits: 0,
    pointsRedeemed: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    // For now, we'll use mock data since we haven't implemented the full API yet
    // In a real implementation, you'd verify the token and fetch user data
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUser(payload);
      
      // Mock stats - in real implementation, fetch from API
      setStats({
        totalCustomers: 247,
        totalVisits: 1,
        pointsRedeemed: 3420,
        revenue: 15680,
      });
    } catch (error) {
      toast.error('Invalid session. Please log in again.');
      localStorage.removeItem('token');
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Gift className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Gift className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AWD Rewards</h1>
                <p className="text-sm text-gray-600">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.username}</p>
                <Badge variant="secondary" className="text-xs">
                  {user.role.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <Avatar>
                <AvatarFallback>
                  {user.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}!
          </h2>
          <p className="text-gray-600">
            Here&apos;s whats&apos;s happening with your rewards program today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVisits.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points Redeemed</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pointsRedeemed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +23% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to manage your rewards program
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => router.push('/dashboard/customers/add')}
                >
                  <Plus className="h-6 w-6" />
                  <span className="text-sm">Add Customer</span>
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => router.push('/dashboard/visits/log')}
                >
                  <Calendar className="h-6 w-6" />
                  <span className="text-sm">Log Visit</span>
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => router.push('/dashboard/customers')}
                >
                  <Users className="h-6 w-6" />
                  <span className="text-sm">View Customers</span>
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => router.push('/dashboard/reports')}
                >
                  <TrendingUp className="h-6 w-6" />
                  <span className="text-sm">Reports</span>
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <MoreVertical className="h-6 w-6" />
                  <span className="text-sm">Settings</span>
                </Button>
                
                <Button 
                  className="h-20 flex flex-col items-center justify-center space-y-2"
                  variant="outline"
                  onClick={() => router.push('/dashboard/rewards')}
                >
                  <Gift className="h-6 w-6" />
                  <span className="text-sm">Rewards</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest customer interactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      John Doe
                    </p>
                    <p className="text-sm text-gray-500">
                      Earned 10 points
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    2m ago
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Jane Smith
                    </p>
                    <p className="text-sm text-gray-500">
                      Redeemed reward
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    5m ago
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>MB</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      Mike Brown
                    </p>
                    <p className="text-sm text-gray-500">
                      New customer signup
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    10m ago
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Complete these steps to get the most out of AWD Rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">Add Customers</p>
                  <p className="text-xs text-green-700">Start building your customer base</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Gift className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Set Up Rewards</p>
                  <p className="text-xs text-blue-700">Configure your reward structure</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-900">Log First Visit</p>
                  <p className="text-xs text-amber-700">Record customer interactions</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">View Reports</p>
                  <p className="text-xs text-purple-700">Analyze program performance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}