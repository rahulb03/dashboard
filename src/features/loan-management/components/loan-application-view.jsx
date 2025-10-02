'use client';

import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/page-header';
import LoanApplicationSkeleton from '@/components/loan-application-skeleton';

export default function LoanApplicationView({ application }) {
  if (!application) {
    return <LoanApplicationSkeleton />;
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title={`View Application - ${application.fullName}`}
        description={`View detailed information for loan application #${application.id}`}
        backUrl="/dashboard/loans/applications"
      />
      
      <Card className="mx-auto w-full">
        <CardContent className="space-y-8 pt-6">
          
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input 
                  type="text" 
                  value={application.fullName || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input 
                  type="text" 
                  value={application.firstName || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input 
                  type="text" 
                  value={application.lastName || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Mobile Number</label>
                <input 
                  type="tel" 
                  value={application.mobileNumber || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <input 
                  type="email" 
                  value={application.email || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth</label>
                <input 
                  type="date" 
                  value={application.dateOfBirth ? application.dateOfBirth.split('T')[0] : ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <textarea 
                value={application.address || ''}
                disabled
                readOnly
                rows={3}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Documentation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentation</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">PAN Number</label>
                <input 
                  type="text" 
                  value={application.panNumber || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Aadhaar Number</label>
                <input 
                  type="tel" 
                  value={application.aadharNumber || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Employment & Loan Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Employment & Loan Details</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employment Type</label>
                <select 
                  value={application.employmentType || ''}
                  disabled
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select employment type</option>
                  <option value="salaried">Salaried</option>
                  <option value="self-employed">Self Employed</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Salary</label>
                <input 
                  type="number" 
                  value={application.monthlySalary || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Loan Amount (Auto-calculated)</label>
                <input 
                  type="number" 
                  value={application.loanAmount || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CIBIL Score (Optional)</label>
                <input 
                  type="number" 
                  value={application.cibilScore || ''}
                  disabled
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documents</h3>
            {application.documents && application.documents.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {application.documents.map((doc, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                        {doc.size && (
                          <p className="text-xs text-muted-foreground">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                      <div className="text-green-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No documents uploaded</p>
            )}
          </div>

          {/* Application Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Application Information</h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Application ID</label>
                <p className="text-sm font-medium">#{application.id}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm font-medium">{application.applicationStatus}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">CIBIL Score</label>
                <p className="text-sm font-medium">{application.cibilScore || 'Not set'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Loan Amount</label>
                <p className="text-sm font-medium">
                  {application.loanAmount ? `₹${application.loanAmount.toLocaleString()}` : 'Not set'}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                <p className="text-sm font-medium">
                  {new Date(application.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}