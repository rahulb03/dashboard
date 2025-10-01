'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { createPaymentConfigThunk, updatePaymentConfigThunk, fetchPaymentConfigByIdThunk } from '@/redux/payments/paymentConfigThunks';
import * as z from 'zod';

const formSchema = z.object({
  type: z.enum(['LOAN_FEE', 'MEMBERSHIP', 'DOCUMENT_FEE'], {
    required_error: 'Payment type is required',
  }),
  amount: z.number().positive({ message: 'Amount must be a positive number' }),
  description: z.string().min(1, { message: 'Description is required' }).max(500, { message: 'Description cannot exceed 500 characters' }),
  isActive: z.boolean().default(true),
  metadata: z.object({}).optional().nullable(),
});

export default function PaymentForm({ paymentId, mode, initialData, pageTitle }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentPaymentConfig } = useSelector((state) => state.paymentConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [localPageTitle, setLocalPageTitle] = useState(pageTitle || 'Payment Configuration');
  
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isNewMode = !paymentId || paymentId === 'new';
  
  // Use initialData prop or fetch from Redux
  const paymentData = initialData || currentPaymentConfig;
  
  // Fetch payment data if paymentId is provided and not 'new'
  useEffect(() => {
    if (paymentId && paymentId !== 'new') {
      if (isViewMode) {
        setLocalPageTitle('View Payment Configuration');
      } else if (isEditMode) {
        setLocalPageTitle('Edit Payment Configuration');
      }
      dispatch(fetchPaymentConfigByIdThunk({ paymentConfigId: paymentId }));
    } else if (isNewMode) {
      setLocalPageTitle('Create New Payment Configuration');
    }
  }, [dispatch, paymentId, isViewMode, isEditMode, isNewMode]);
  
  const defaultValues = {
    type: paymentData?.type || '',
    amount: paymentData?.amount || undefined,
    description: paymentData?.description || '',
    isActive: paymentData?.isActive ?? true,
    metadata: paymentData?.metadata || {}
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues
  });

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      if (paymentData && !isNewMode) {
        // Update existing payment configuration
        const result = await dispatch(updatePaymentConfigThunk({
          paymentConfigId: paymentData.id,
          paymentConfigData: values
        })).unwrap();
        toast.success('Payment configuration updated successfully!');
      } else {
        // Create new payment configuration
        const result = await dispatch(createPaymentConfigThunk(values)).unwrap();
        toast.success('Payment configuration created successfully!');
      }
      router.push('/dashboard/payment-configurations');
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Back button and edit toggle for view mode */}
      {isViewMode && (
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/payment')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Payments</span>
          </Button>
         
        </div>
      )}
      
      <Card className="mx-auto w-full">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            {isViewMode ? `Payment Details - ${paymentData?.type || 'Payment'}` : localPageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormSelect
                control={form.control}
                name="type"
                label="Payment Type"
                placeholder="Select payment type"
                required={!isViewMode}
                disabled={isViewMode}
                options={[
                  { label: 'Loan Fee', value: 'LOAN_FEE' },
                  { label: 'Membership', value: 'MEMBERSHIP' },
                  { label: 'Document Fee', value: 'DOCUMENT_FEE' }
                ]}
              />

              <FormInput
                control={form.control}
                name="amount"
                label="Amount"
                placeholder="Enter amount"
                required={!isViewMode}
                disabled={isViewMode}
                type="number"
                min={0}
                step="0.01"
              />

              <FormSelect
                control={form.control}
                name="isActive"
                label="Status"
                placeholder="Select status"
                required={!isViewMode}
                disabled={isViewMode}
                options={[
                  { label: 'Active', value: true },
                  { label: 'Inactive', value: false }
                ]}
              />
            </div>

            <FormTextarea
              control={form.control}
              name="description"
              label="Description"
              placeholder="Enter payment description"
              required={!isViewMode}
              disabled={isViewMode}
              config={{ maxLength: 500, showCharCount: !isViewMode, rows: 4 }}
            />

            {!isViewMode && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (paymentData && !isNewMode ? 'Update Payment Configuration' : 'Create Payment Configuration')}
              </Button>
            )}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}