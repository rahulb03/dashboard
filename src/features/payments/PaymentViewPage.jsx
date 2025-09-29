'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import PageContainer from '@/components/layout/page-container';
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Calendar, 
  DollarSign,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { getPaymentById } from '@/constants/payments-data';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function PaymentViewPage() {
  const params = useParams();
  const router = useRouter();
  const [currentPayment, setCurrentPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  const paymentId = params.id;

  useEffect(() => {
    if (paymentId) {
      const payment = getPaymentById(paymentId);
      setCurrentPayment(payment);
      setLoading(false);
    }
  }, [paymentId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case 'FAILED':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'REFUNDED':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100"><RotateCcw className="w-3 h-3 mr-1" />Refunded</Badge>;
      case 'CREATED':
        return <Badge variant="outline"><RefreshCw className="w-3 h-3 mr-1" />Created</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    const typeColors = {
      'LOAN_FEE': 'bg-purple-100 text-purple-800 hover:bg-purple-100',
      'MEMBERSHIP': 'bg-blue-100 text-blue-800 hover:bg-blue-100',
      'DOCUMENT_FEE': 'bg-green-100 text-green-800 hover:bg-green-100'
    };
    
    return (
      <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800 hover:bg-gray-100'}>
        {type?.replace('_', ' ') || 'Unknown'}
      </Badge>
    );
  };

  const handleDelete = async () => {
    // Mock delete operation - in real app this would call API
    toast.success('Payment deleted successfully (mock operation)');
    router.push('/dashboard/payments');
  };

  const handleRefund = async () => {
    // Mock refund operation - in real app this would call API
    toast.success('Payment refunded successfully (mock operation)');
    // Update local state to show refunded
    if (currentPayment) {
      setCurrentPayment({
        ...currentPayment,
        status: 'REFUNDED',
        refunded: true,
        refundedAt: new Date().toISOString()
      });
    }
  };

  const canDelete = currentPayment?.status === 'FAILED' || currentPayment?.status === 'CREATED';
  const canRefund = currentPayment?.status === 'SUCCESS' && !currentPayment?.refunded;

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="h-[200px] bg-muted animate-pulse rounded-lg" />
              <div className="h-[300px] bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="h-[500px] bg-muted animate-pulse rounded-lg" />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!currentPayment) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-12">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Payment not found</h2>
          <p className="text-muted-foreground mb-4">The payment you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/payments')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Payments
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard/payments')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Payment Details</h1>
              <p className="text-muted-foreground">
                Payment ID: {currentPayment.id}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canRefund && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Refund
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Refund Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to refund this payment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRefund}>
                      Refund Payment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this payment? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Payment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Payment Overview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Status</span>
                  {getStatusBadge(currentPayment.status)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Type</span>
                  {getTypeBadge(currentPayment.type)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Amount</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{parseFloat(currentPayment.amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Cashfree Order ID</span>
                  <span className="font-mono text-sm">{currentPayment.cashfreeOrderId || 'N/A'}</span>
                </div>
                {currentPayment.refunded && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Refunded</span>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Yes
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentPayment.user && (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Name</span>
                      <span>{currentPayment.user.firstName} {currentPayment.user.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email</span>
                      <span>{currentPayment.user.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Mobile</span>
                      <span>{currentPayment.user.mobile || 'N/A'}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="font-medium">User ID</span>
                  <span className="font-mono text-sm">{currentPayment.userId}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment ID</label>
                  <p className="font-mono text-sm mt-1">{currentPayment.id}</p>
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cashfree Order ID</label>
                  <p className="font-mono text-sm mt-1">{currentPayment.cashfreeOrderId || 'Not available'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-lg font-semibold mt-1">₹{parseFloat(currentPayment.amount || 0).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Type</label>
                  <div className="mt-1">
                    {getTypeBadge(currentPayment.type)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(currentPayment.status)}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Created At
                    </label>
                    <p className="text-sm mt-1">
                      {currentPayment.createdAt 
                        ? new Date(currentPayment.createdAt).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'
                      }
                    </p>
                  </div>

                  {currentPayment.paidAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Paid At
                      </label>
                      <p className="text-sm mt-1">
                        {new Date(currentPayment.paidAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  {currentPayment.refundedAt && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground flex items-center">
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Refunded At
                      </label>
                      <p className="text-sm mt-1">
                        {new Date(currentPayment.refundedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                  <p className="text-sm mt-1">
                    {currentPayment.updatedAt 
                      ? new Date(currentPayment.updatedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}