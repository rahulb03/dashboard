'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { 
  createLoanApplicationWithDocumentsThunk,
  updateLoanApplicationWithDocumentsThunk
} from '@/redux/Loan_Application/loanThunks';
import DocumentUpload from './document-upload';

export default function LoanApplicationFormClean({ initialData, pageTitle }) {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Document upload state
  const [documents, setDocuments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues = {
    fullName: initialData?.fullName || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    mobileNumber: initialData?.mobileNumber || '',
    email: initialData?.email || '',
    address: initialData?.address || '',
    panNumber: initialData?.panNumber || '',
    aadharNumber: initialData?.aadharNumber || '',
    dateOfBirth: initialData?.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
    employmentType: initialData?.employmentType || '',
    monthlySalary: initialData?.monthlySalary || '',
    loanAmount: initialData?.loanAmount || '',
    cibilScore: initialData?.cibilScore || ''
  };

  const form = useForm({
    defaultValues,
    mode: 'onChange'
  });

  // Reset form values when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const updatedValues = {
        fullName: initialData.fullName || '',
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        mobileNumber: initialData.mobileNumber || '',
        email: initialData.email || '',
        address: initialData.address || '',
        panNumber: initialData.panNumber || '',
        aadharNumber: initialData.aadharNumber || '',
        dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.split('T')[0] : '',
        employmentType: initialData.employmentType || '',
        monthlySalary: initialData.monthlySalary || '',
        loanAmount: initialData.loanAmount || '',
        cibilScore: initialData.cibilScore || ''
      };
      
      Object.keys(updatedValues).forEach(key => {
        form.setValue(key, updatedValues[key]);
      });
    }
  }, [initialData, form]);

  async function onSubmit(values) {
    let processingToast;
    try {
      setIsSubmitting(true);
      
      processingToast = toast.loading(
        initialData 
          ? `⏳ Updating ${values.fullName ? values.fullName + "'s" : 'the'} loan application...`
          : `⏳ Creating new loan application for ${values.fullName || 'applicant'}...`
      );
      
      // React Hook Form valueAsNumber already converts to numbers
      const submitData = { ...values };
      
      console.log('🔢 Raw values from form:', values);
      console.log('🔢 Data types from form:', {
        monthlySalary: typeof values.monthlySalary,
        cibilScore: typeof values.cibilScore,
        loanAmount: typeof values.loanAmount
      });
      
      
      // Clean up data - remove empty/undefined/NaN values
      Object.keys(submitData).forEach(key => {
        const value = submitData[key];
        
        // Remove empty strings, null, undefined, and NaN values
        if (value === '' || value === null || value === undefined || 
           (typeof value === 'number' && isNaN(value))) {
          delete submitData[key];
        }
      });
      
      console.log('🚀 Final submitData with proper types:', submitData);
      console.log('🔢 Final data types:', {
        monthlySalary: submitData.monthlySalary ? typeof submitData.monthlySalary : 'not included',
        cibilScore: submitData.cibilScore ? typeof submitData.cibilScore : 'not included', 
        loanAmount: submitData.loanAmount ? typeof submitData.loanAmount : 'not included'
      });
      
      const hasNewDocuments = documents && documents.length > 0;

      if (initialData) {
        // Always use with-documents endpoint for updates
        await dispatch(updateLoanApplicationWithDocumentsThunk({ 
          id: initialData.id,
          loanData: submitData,
          documents: documents,
          replaceExistingDocuments: false
        })).unwrap();
        
        toast.dismiss(processingToast);
        if (hasNewDocuments) {
          toast.success(
            `✅ Successfully updated ${submitData.fullName ? submitData.fullName + "'s" : 'the'} loan application and uploaded ${documents.length} document${documents.length !== 1 ? 's' : ''}.`
          );
        } else {
          toast.success(
            `✅ Successfully updated ${submitData.fullName ? submitData.fullName + "'s" : 'the'} loan application.`
          );
        }
        
        // Navigate back to list after update
        console.log('🔄 Navigating back to applications list after update in 1.5s...');
        setTimeout(() => {
          console.log('➡️ Executing navigation now');
          router.push('/dashboard/loans/applications');
        }, 1500);
      } else {
        // Always use with-documents endpoint for creation
        await dispatch(createLoanApplicationWithDocumentsThunk({ loanData: submitData, documents })).unwrap();
        toast.dismiss(processingToast);
        if (hasNewDocuments) {
          toast.success(`✨ Created loan application for ${submitData.fullName || 'applicant'} with ${documents.length} document${documents.length !== 1 ? 's' : ''} uploaded!`);
        } else {
          toast.success(`✨ Created loan application for ${submitData.fullName || 'applicant'} successfully!`);
        }
        
        // Navigate back to list after creation
        console.log('🔄 Navigating back to applications list in 1.5s...');
        setTimeout(() => {
          console.log('➡️ Executing navigation now');
          router.push('/dashboard/loans/applications');
        }, 1500);
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      
      if (processingToast) toast.dismiss(processingToast);
      toast.error(`Failed to ${initialData ? 'update' : 'create'} application: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="mx-auto w-full relative">
        <CardHeader>
          <CardTitle className="text-left text-2xl font-bold">
            {pageTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter full name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('fullName', { required: 'Full name is required' })}
                  />
                  {form.formState.errors.fullName && (
                    <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter first name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('firstName', { required: 'First name is required' })}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name *</label>
                  <input 
                    type="text" 
                    placeholder="Enter last name"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('lastName', { required: 'Last name is required' })}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number *</label>
                  <input 
                    type="tel" 
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('mobileNumber', { 
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[6-9][0-9]{9}$/,
                        message: 'Enter valid 10-digit mobile number starting with 6-9'
                      }
                    })}
                  />
                  {form.formState.errors.mobileNumber && (
                    <p className="text-sm text-red-500">{form.formState.errors.mobileNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <input 
                    type="email" 
                    placeholder="Enter email address"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter valid email address'
                      }
                    })}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Birth *</label>
                  <input 
                    type="date" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('dateOfBirth', { required: 'Date of birth is required' })}
                  />
                  {form.formState.errors.dateOfBirth && (
                    <p className="text-sm text-red-500">{form.formState.errors.dateOfBirth.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Address *</label>
                <textarea 
                  placeholder="Enter full address"
                  rows={3}
                  maxLength={500}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...form.register('address', { 
                    required: 'Address is required',
                    minLength: {
                      value: 10,
                      message: 'Please enter a complete address'
                    }
                  })}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
                )}
              </div>
            </div>

            {/* Documentation Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documentation</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">PAN Number *</label>
                  <input 
                    type="text" 
                    placeholder="Enter PAN number (ABCDE1234F)"
                    maxLength="10"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('panNumber', { 
                      required: 'PAN number is required',
                      pattern: {
                        value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
                        message: 'PAN format: ABCDE1234F'
                      }
                    })}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {form.formState.errors.panNumber && (
                    <p className="text-sm text-red-500">{form.formState.errors.panNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Aadhaar Number *</label>
                  <input 
                    type="tel" 
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength="12"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('aadharNumber', { 
                      required: 'Aadhaar number is required',
                      pattern: {
                        value: /^[2-9][0-9]{11}$/,
                        message: 'Enter valid 12-digit Aadhaar number'
                      }
                    })}
                  />
                  {form.formState.errors.aadharNumber && (
                    <p className="text-sm text-red-500">{form.formState.errors.aadharNumber.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Employment & Loan Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Employment & Loan Details</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employment Type *</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('employmentType', { required: 'Employment type is required' })}
                  >
                    <option value="">Select employment type</option>
                    <option value="salaried">Salaried</option>
                    <option value="self-employed">Self Employed</option>
                  </select>
                  {form.formState.errors.employmentType && (
                    <p className="text-sm text-red-500">{form.formState.errors.employmentType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Salary *</label>
                  <input 
                    type="number" 
                    placeholder="Enter monthly salary (min ₹10,000)"
                    min="10000"
                    step="1000"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('monthlySalary', { 
                      required: 'Monthly salary is required',
                      valueAsNumber: true,
                      min: {
                        value: 10000,
                        message: 'Monthly salary must be at least ₹10,000'
                      }
                    })}
                  />
                  {form.formState.errors.monthlySalary && (
                    <p className="text-sm text-red-500">{form.formState.errors.monthlySalary.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Loan Amount *</label>
                  <input 
                    type="number" 
                    placeholder="Enter loan amount"
                    min="10000"
                    step="1000"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('loanAmount', { 
                      required: 'Loan amount is required',
                      valueAsNumber: true,
                      min: {
                        value: 10000,
                        message: 'Loan amount must be at least ₹10,000'
                      }
                    })}
                  />
                  {form.formState.errors.loanAmount && (
                    <p className="text-sm text-red-500">{form.formState.errors.loanAmount.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">CIBIL Score (Optional)</label>
                  <input 
                    type="number" 
                    placeholder="Enter CIBIL score (300-900)"
                    min="300"
                    max="900"
                    step="1"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...form.register('cibilScore', {
                      valueAsNumber: true,
                      min: {
                        value: 300,
                        message: 'CIBIL score must be at least 300'
                      },
                      max: {
                        value: 900,
                        message: 'CIBIL score cannot exceed 900'
                      }
                    })}
                  />
                  {form.formState.errors.cibilScore && (
                    <p className="text-sm text-red-500">{form.formState.errors.cibilScore.message}</p>
                  )}
                </div>

              </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Documents</h3>
              <DocumentUpload
                documents={documents}
                onDocumentsChange={setDocuments}
                existingDocuments={initialData?.documents || []}
              />
            </div>

            {/* Application Status (only for edit mode) */}
            {initialData && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Application Information</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
                  <div>
                    <label className="text-sm font-medium">Application ID</label>
                    <p className="text-sm text-muted-foreground">#{initialData.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <p className="text-sm text-muted-foreground">{initialData.applicationStatus}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">CIBIL Score</label>
                    <p className="text-sm text-muted-foreground">
                      {initialData.cibilScore || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Loan Amount</label>
                    <p className="text-sm text-muted-foreground">
                      {initialData.loanAmount ? `₹${initialData.loanAmount.toLocaleString()}` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Created Date</label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(initialData.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => router.push('/dashboard/loans/applications')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSubmitting 
                  ? `${initialData ? 'Updating' : 'Creating'}...` 
                  : `${initialData ? 'Update' : 'Create'} Application`
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}