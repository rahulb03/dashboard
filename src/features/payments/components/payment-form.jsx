'use client';

import { FormInput } from '@/components/forms/form-input';
import { FormSelect } from '@/components/forms/form-select';
import { FormTextarea } from '@/components/forms/form-textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { createPaymentConfigThunk, updatePaymentConfigThunk, fetchPaymentConfigByIdThunk, fetchPaymentConfigsThunk } from '@/redux/payments/paymentConfigThunks';
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
  const { currentPaymentConfig, paymentConfigs } = useSelector((state) => state.paymentConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [localPageTitle, setLocalPageTitle] = useState(pageTitle || 'Payment Configuration');
  const [availableTypes, setAvailableTypes] = useState([
    { label: 'Loan Fee', value: 'LOAN_FEE' },
    { label: 'Membership', value: 'MEMBERSHIP' },
    { label: 'Document Fee', value: 'DOCUMENT_FEE' }
  ]);
  
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isNewMode = !paymentId || paymentId === 'new';
  
  // Use initialData prop or fetch from Redux
  const paymentData = initialData || currentPaymentConfig;
  
  // Fetch all payment configs to check existing types
  useEffect(() => {
    dispatch(fetchPaymentConfigsThunk());
  }, [dispatch]);
  
  // Fetch payment data if paymentId is provided and not 'new'
  useEffect(() => {
    if (paymentId && paymentId !== 'new') {
      if (isViewMode) {
        setLocalPageTitle('View Payment Configuration');
      } else if (isEditMode) {
        setLocalPageTitle('Edit Payment Configuration');
      }
      dispatch(fetchPaymentConfigByIdThunk({ paymentConfigId: paymentId, forceRefresh: true }));
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
  
  // Reset form when payment data changes (fixes edit mode data loading)
  useEffect(() => {
    if (paymentData && !isNewMode) {
      form.reset({
        type: paymentData.type || '',
        amount: paymentData.amount || undefined,
        description: paymentData.description || '',
        isActive: paymentData.isActive ?? true,
        metadata: paymentData.metadata || {}
      });
    }
  }, [paymentData, isNewMode, form]);
  
  // Update available types based on existing configurations
  useEffect(() => {
    if (!paymentConfigs || paymentConfigs.length === 0) {
      // All types available if no configs exist
      setAvailableTypes([
        { label: 'Loan Fee', value: 'LOAN_FEE' },
        { label: 'Membership', value: 'MEMBERSHIP' },
        { label: 'Document Fee', value: 'DOCUMENT_FEE' }
      ]);
      return;
    }
    
    // Get existing types, excluding current config if editing
    const existingTypes = paymentConfigs
      .filter(config => !paymentData || config.id !== paymentData.id)
      .map(config => config.type);
    
    // Define all possible types
    const allTypes = [
      { label: 'Loan Fee', value: 'LOAN_FEE' },
      { label: 'Membership', value: 'MEMBERSHIP' },
      { label: 'Document Fee', value: 'DOCUMENT_FEE' }
    ];
    
    // Filter out types that already exist
    const available = allTypes.filter(type => !existingTypes.includes(type.value));
    
    // If editing, always include the current type
    if (paymentData && paymentData.type) {
      const currentType = allTypes.find(t => t.value === paymentData.type);
      if (currentType && !available.find(t => t.value === currentType.value)) {
        available.push(currentType);
      }
    }
    
    setAvailableTypes(available);
  }, [paymentConfigs, paymentData]);

  async function onSubmit(values) {
    setIsLoading(true);
    try {
      // Validate payment type uniqueness
      const existingTypes = paymentConfigs
        .filter(config => !paymentData || config.id !== paymentData.id)
        .map(config => config.type);
      
      if (existingTypes.includes(values.type)) {
        toast.error(`A payment configuration for ${values.type.replace('_', ' ')} already exists. Only one configuration per type is allowed.`);
        setIsLoading(false);
        return;
      }
      
      // Check if we're trying to create a 4th type
      if (isNewMode && existingTypes.length >= 3) {
        toast.error('Maximum of 3 payment types allowed. You cannot create more payment configurations.');
        setIsLoading(false);
        return;
      }
      
      if (paymentData && !isNewMode) {
        // Update existing payment configuration
        const result = await dispatch(updatePaymentConfigThunk({
          paymentConfigId: paymentData.id,
          paymentConfigData: values
        })).unwrap();
        toast.success('Payment configuration updated successfully!');
        // Refresh list to show updated data immediately - same as salary
        dispatch(fetchPaymentConfigsThunk({ forceRefresh: true }));
      } else {
        // Create new payment configuration
        const result = await dispatch(createPaymentConfigThunk(values)).unwrap();
        toast.success('Payment configuration created successfully!');
        // Refresh list to show new data immediately - same as salary
        dispatch(fetchPaymentConfigsThunk({ forceRefresh: true }));
      }
      router.push('/dashboard/payment-configurations');
    } catch (error) {
      toast.error(error.message || error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  const getHeaderTitle = () => {
    if (isNewMode) return 'Create Payment Configuration';
    if (isViewMode) return 'Payment Configuration Details';
    return 'Edit Payment Configuration';
  };

  const getHeaderDescription = () => {
    if (isNewMode) return 'Create a new payment configuration';
    if (isViewMode) return 'View payment configuration details';
    return 'Update payment configuration settings';
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={getHeaderTitle()}
        description={getHeaderDescription()}
        backUrl="/dashboard/payment-configurations"
      />
      
      <Card className="mx-auto w-full">
        <CardContent className="pt-6">
          {isNewMode && availableTypes.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> All three payment types (Loan Fee, Membership, and Document Fee) already exist. 
                You cannot create additional payment configurations. Please edit or delete an existing configuration if you need to make changes.
              </p>
            </div>
          )}
          <Form form={form} onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormSelect
                control={form.control}
                name="type"
                label="Payment Type"
                placeholder={availableTypes.length === 0 ? "No types available" : "Select payment type"}
                required={!isViewMode}
                disabled={isViewMode || availableTypes.length === 0}
                options={availableTypes}
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
              <Button 
                type="submit" 
                onClick={(e) => {
                  if (isLoading) e.preventDefault();
                }}
                className="relative"
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isLoading ? 'Saving...' : (paymentData && !isNewMode ? 'Update Payment Configuration' : 'Create Payment Configuration')}
              </Button>
            )}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}