'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  createSalaryThunk,
  updateSalaryThunk,
  fetchSalaryByIdThunk,
  fetchSalariesThunk
} from '@/redux/salary/salaryThunks';
import {
  selectCurrentSalary,
  selectSalaryCreating,
  selectSalaryUpdating,
  selectSalaryError,
  selectSalaryValidationErrors,
  selectSalaryLoading,
  clearError,
  clearValidationErrors,
  clearCurrentSalary
} from '@/redux/salary/salarySlice';
import FormCardSkeleton from '@/components/form-card-skeleton';


const SalaryForm = ({ salaryId, mode = 'edit' }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  
  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create' || salaryId === 'new';
  
  // Redux state
  const currentSalary = useSelector(selectCurrentSalary);
  const isLoading = useSelector(selectSalaryLoading);
  const error = useSelector(selectSalaryError);
  const validationErrors = useSelector(selectSalaryValidationErrors);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    employmentType: '',
    minSalary: '',
    maxSalary: '',
    loanAmount: '',
    minCibilScore: '',
    maxCibilScore: '',
    interestRate: '',
    emiOptions: ''
  });

  // Fetch salary data on mount OR clear for new creation
  useEffect(() => {
    if (salaryId && salaryId !== 'new') {
      dispatch(fetchSalaryByIdThunk({ salaryId })).catch(err => {
        console.error('Failed to fetch salary:', err);
        toast.error('Failed to load salary data');
      });
    } else if (isCreateMode) {
      // Clear any existing salary data when creating new
      dispatch(clearCurrentSalary());
    }
  }, [dispatch, salaryId, isCreateMode]);

  // Update form when salary data is loaded - ONLY for non-create modes
  useEffect(() => {
    if (currentSalary && !isCreateMode) {
      setFormData({
        employmentType: currentSalary.employmentType || '',
        minSalary: currentSalary.minSalary || '',
        maxSalary: currentSalary.maxSalary || '',
        loanAmount: currentSalary.loanAmount || '',
        minCibilScore: currentSalary.minCibilScore || '',
        maxCibilScore: currentSalary.maxCibilScore || '',
        interestRate: currentSalary.interestRate || '',
        emiOptions: currentSalary.emiOptions || ''
      });
    }
  }, [currentSalary, isCreateMode]);

  // Clear errors when component mounts
  useEffect(() => {
    dispatch(clearError());
    dispatch(clearValidationErrors());
  }, [dispatch]);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatCibilRange = (minScore, maxScore) => {
    return maxScore ? `${minScore} - ${maxScore}` : `${minScore}`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Basic validation
      if (!formData.employmentType) {
        toast.error('Employment type is required');
        setIsSubmitting(false);
        return;
      }
      
      const submitData = {
        employmentType: formData.employmentType,
        minSalary: Number(formData.minSalary) || 0,
        maxSalary: formData.maxSalary ? Number(formData.maxSalary) : null,
        loanAmount: Number(formData.loanAmount) || 0,
        minCibilScore: Number(formData.minCibilScore) || 300,
        maxCibilScore: formData.maxCibilScore ? Number(formData.maxCibilScore) : null,
        interestRate: Number(formData.interestRate) || 0,
        emiOptions: formData.emiOptions
      };
      
      if (isCreateMode) {
        await dispatch(createSalaryThunk(submitData)).unwrap();
        toast.success('Salary configuration created successfully');
        // Refresh the salary list to show the new configuration immediately
        dispatch(fetchSalariesThunk({ forceRefresh: true }));
      } else {
        await dispatch(updateSalaryThunk({
          salaryId,
          salaryData: submitData
        })).unwrap();
        toast.success('Salary configuration updated successfully');
        // Refresh the salary list to show the updated configuration immediately
        dispatch(fetchSalariesThunk({ forceRefresh: true }));
      }
      
      router.push('/dashboard/salary');
    } catch (error) {
      console.error('Operation failed:', error);
      toast.error(error.message || `Failed to ${isCreateMode ? 'create' : 'update'} salary configuration`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading skeleton while fetching
  if (isLoading && salaryId !== 'new') {
    return <FormCardSkeleton />;
  }

  const getHeaderTitle = () => {
    if (isCreateMode) return 'Create Salary Configuration';
    if (isViewMode) return 'Salary Configuration Details';
    return 'Edit Salary Configuration';
  };

  const getHeaderDescription = () => {
    if (isCreateMode) return 'Create a new salary configuration for loan eligibility';
    if (isViewMode) return 'View salary configuration details';
    return 'Update salary configuration for loan eligibility';
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={getHeaderTitle()}
        description={getHeaderDescription()}
        backUrl="/dashboard/salary"
      />
      
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form Card */}
      <Card className="mx-auto w-full">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
              {/* Employment Type */}
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type *</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) => handleInputChange('employmentType', value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="self-employed">Self-Employed</SelectItem>
                  </SelectContent>
                </Select>
                {validationErrors.employmentType && (
                  <p className="text-sm text-destructive">{validationErrors.employmentType}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Salary Range */}
                <div className="space-y-2">
                  <Label htmlFor="minSalary">Minimum Salary *</Label>
                  <Input
                    id="minSalary"
                    type="number"
                    placeholder="Enter minimum salary"
                    value={formData.minSalary}
                    onChange={(e) => handleInputChange('minSalary', e.target.value)}
                    disabled={isViewMode}
                  />
                  {validationErrors.minSalary && (
                    <p className="text-sm text-destructive">{validationErrors.minSalary}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSalary">Maximum Salary</Label>
                  <Input
                    id="maxSalary"
                    type="number"
                    placeholder="Enter maximum salary (optional)"
                    value={formData.maxSalary}
                    onChange={(e) => handleInputChange('maxSalary', e.target.value)}
                    disabled={isViewMode}
                  />
                  {validationErrors.maxSalary && (
                    <p className="text-sm text-destructive">{validationErrors.maxSalary}</p>
                  )}
                </div>
              </div>

              {/* Loan Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="loanAmount">Loan Amount *</Label>
                  <Input
                    id="loanAmount"
                    type="number"
                    placeholder="Enter loan amount"
                    value={formData.loanAmount}
                    onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                    disabled={isViewMode}
                  />
                  {validationErrors.loanAmount && (
                    <p className="text-sm text-destructive">{validationErrors.loanAmount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%) *</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.01"
                    placeholder="Enter interest rate"
                    value={formData.interestRate}
                    onChange={(e) => handleInputChange('interestRate', e.target.value)}
                    disabled={isViewMode}
                  />
                  {validationErrors.interestRate && (
                    <p className="text-sm text-destructive">{validationErrors.interestRate}</p>
                  )}
                </div>
              </div>

              {/* CIBIL Score Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minCibilScore">Minimum CIBIL Score *</Label>
                  <Input
                    id="minCibilScore"
                    type="number"
                    placeholder="Enter minimum CIBIL score"
                    value={formData.minCibilScore}
                    onChange={(e) => handleInputChange('minCibilScore', e.target.value)}
                    disabled={isViewMode}
                  />
                  {validationErrors.minCibilScore && (
                    <p className="text-sm text-destructive">{validationErrors.minCibilScore}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxCibilScore">Maximum CIBIL Score</Label>
                  <Input
                    id="maxCibilScore"
                    type="number"
                    placeholder="Enter maximum CIBIL score (optional)"
                    value={formData.maxCibilScore}
                    onChange={(e) => handleInputChange('maxCibilScore', e.target.value)}
                    disabled={isViewMode}
                  />
                  {validationErrors.maxCibilScore && (
                    <p className="text-sm text-destructive">{validationErrors.maxCibilScore}</p>
                  )}
                </div>
              </div>

              {/* EMI Options */}
              <div className="space-y-2">
                <Label htmlFor="emiOptions">EMI Options *</Label>
                <Input
                  id="emiOptions"
                  placeholder="Enter EMI options (e.g., '12,24,36,48,60 months')"
                  value={formData.emiOptions}
                  onChange={(e) => handleInputChange('emiOptions', e.target.value)}
                  disabled={isViewMode}
                />
                {validationErrors.emiOptions && (
                  <p className="text-sm text-destructive">{validationErrors.emiOptions}</p>
                )}
              </div>

              {/* Summary Section (for view mode) */}
              {isViewMode && currentSalary && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Salary Range</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(currentSalary.minSalary)} - {currentSalary.maxSalary ? formatCurrency(currentSalary.maxSalary) : 'No Limit'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Loan Amount</p>
                      <p className="text-lg font-semibold">{formatCurrency(currentSalary.loanAmount)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">CIBIL Score Range</p>
                      <p className="text-lg font-semibold">{formatCibilRange(currentSalary.minCibilScore, currentSalary.maxCibilScore)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => router.push('/dashboard/salary')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {isViewMode ? 'Back' : 'Cancel'}
                </Button>
                
                {!isViewMode && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    {isCreateMode ? 'Create Configuration' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalaryForm;