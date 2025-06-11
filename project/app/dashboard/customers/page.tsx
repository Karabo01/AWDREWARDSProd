'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Phone, Mail } from 'lucide-react';
import { ICustomer } from '@/models/Customer';

export default function CustomersPage() {
    const router = useRouter();
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchCustomers = async (page: number, search: string = '') => {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
            });

            const response = await fetch(`/api/customers?${params}`);
            const data = await response.json();

            if (response.ok) {
                setCustomers(data.customers);
                setTotalPages(data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Customers</CardTitle>
                    <Button
                        onClick={() => router.push('/dashboard/customers/add')}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search customers..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                    </div>

                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Points</TableHead>
                                    <TableHead>Status</TableHead>
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
                                        <TableRow key={customer._id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {customer.firstName} {customer.lastName}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col space-y-1">
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Mail className="mr-2 h-4 w-4" />
                                                        {customer.email}
                                                    </div>
                                                    {customer.phone && (
                                                        <div className="flex items-center text-sm text-gray-500">
                                                            <Phone className="mr-2 h-4 w-4" />
                                                            {customer.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>{customer.points}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    customer.status === 'active' 
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {customer.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/dashboard/customers/${customer._id}`)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center space-x-2 mt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <span className="py-2 px-3 text-sm">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}