'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { CreditCard, Eye, Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';

const paymentStatusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' }
];

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || colors.default;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function PaymentsTable({ applications = [], loading = false }) {
  const searchParams = useSearchParams();
  const applicationIdFromUrl = searchParams.get('applicationId');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Flatten all payments from all applications
  const allPayments = applications.flatMap(app => 
    (app.payments || []).map(payment => ({
      ...payment,
      date: payment.createdAt || payment.date,
      applicationId: app.id,
      applicantName: app.fullName,
      loanAmount: app.loanAmount,
      applicationStatus: app.applicationStatus
    }))
  );

  // Filter payments
  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = searchTerm === '' ||
      payment.applicantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id?.toString().includes(searchTerm) ||
      payment.applicationId?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    // Filter by applicationId from URL if present
    const matchesApplication = !applicationIdFromUrl || 
      payment.applicationId.toString() === applicationIdFromUrl;
    
    return matchesSearch && matchesStatus && matchesApplication;
  });

  // Calculate totals
  const totals = {
    total: filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
    completed: filteredPayments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (p.amount || 0), 0),
    pending: filteredPayments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0),
    failed: filteredPayments.filter(p => p.status === 'failed').reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-[250px] bg-muted animate-pulse rounded" />
            <div className="h-8 w-[120px] bg-muted animate-pulse rounded" />
          </div>
          <div className="h-8 w-[120px] bg-muted animate-pulse rounded" />
        </div>
        <div className="rounded-md border">
          <div className="h-[400px] animate-pulse bg-muted/50" />
        </div>
      </div>
    );
  }

  // Get application name for filtered view
  const filteredApplication = applicationIdFromUrl ? 
    applications.find(app => app.id.toString() === applicationIdFromUrl) : null;

  return (
    <div className="space-y-4">
      {/* Application Filter Header */}
      {applicationIdFromUrl && filteredApplication && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="text-sm font-medium text-green-900">
                Payments for: {filteredApplication.fullName}
              </h3>
              <p className="text-xs text-green-700">
                Application ID: {applicationIdFromUrl} • Loan Amount: {formatCurrency(filteredApplication.loanAmount)}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Total Payments</div>
          <div className="text-2xl font-bold">{formatCurrency(totals.total)}</div>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Completed</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.completed)}</div>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.pending)}</div>
        </div>
        <div className="bg-card rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Failed</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totals.failed)}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-8 w-[250px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {paymentStatusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(searchTerm || statusFilter !== 'all') && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="h-8 px-2 lg:px-3"
            >
              Reset
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-muted-foreground">
            {filteredPayments.length} payments found
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Applicant</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center space-y-2">
                    <CreditCard className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No payments found</h3>
                    <p className="text-muted-foreground">
                      {allPayments.length === 0
                        ? "No payments have been recorded yet."
                        : "No payments match your current filters."
                      }
                    </p>

                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={`${payment.applicationId}-${payment.id}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">#{payment.id}</div>
                        <div className="text-sm text-muted-foreground">
                          App: {payment.applicationId}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{payment.applicantName}</div>
                    <div className="text-sm text-muted-foreground">
                      Loan: {formatCurrency(payment.loanAmount)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold">{formatCurrency(payment.amount)}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusColor(payment.status)} border-0 capitalize`}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(payment.date)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer */}
      {filteredPayments.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
          <div>
            Showing {filteredPayments.length} of {allPayments.length} payments
          </div>
          <div className="flex items-center space-x-4">
            <div>Completed: {filteredPayments.filter(p => p.status === 'completed').length}</div>
            <div>Pending: {filteredPayments.filter(p => p.status === 'pending').length}</div>
            <div>Failed: {filteredPayments.filter(p => p.status === 'failed').length}</div>
          </div>
        </div>
      )}
    </div>
  );
}