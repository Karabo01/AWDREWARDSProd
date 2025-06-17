"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Gift, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserData {
  username: string;
  email: string;
  role: 'admin' | 'business_owner' | 'employee';
}

export function MainNav() {
  const pathname = usePathname();
  const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('token');
  const isAuthPage = pathname?.startsWith('/auth');
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            username: payload.username,
            email: payload.email,
            role: payload.role
          });
        } catch (error) {
          console.error('Error decoding token:', error);
        }
      }
    }
  }, [isLoggedIn]);

  if (isAuthPage) return null;

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Gift className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
              AWD Rewards
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user?.username || 'User'}</span>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  {user?.role === 'business_owner' && (
                    <Link href="/dashboard/settings">
                      <Button variant="ghost">Settings</Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/';
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
