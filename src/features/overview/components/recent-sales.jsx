'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const mockApplicationsData = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@email.com',
    fallback: 'RK',
    status: 'APPROVED',
    amount: '₹5,00,000',
    type: 'Personal Loan'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@email.com', 
    fallback: 'PS',
    status: 'PROCESSING',
    amount: '₹2,50,000',
    type: 'Home Loan'
  },
  {
    name: 'Amit Patel',
    email: 'amit.patel@email.com',
    fallback: 'AP', 
    status: 'PENDING',
    amount: '₹1,50,000',
    type: 'Car Loan'
  },
  {
    name: 'Sneha Gupta',
    email: 'sneha.gupta@email.com',
    fallback: 'SG',
    status: 'APPROVED',
    amount: '₹3,00,000',
    type: 'Business Loan'
  },
  {
    name: 'Vikram Singh',
    email: 'vikram.singh@email.com',
    fallback: 'VS',
    status: 'REJECTED',
    amount: '₹75,000',
    type: 'Personal Loan'
  }
];

export function RecentSales() {
  const { loanApplications, loading } = useSelector((state) => state.loan);
  
  // Get recent loan applications
  const recentApplications = React.useMemo(() => {
    if (!loanApplications?.length) return mockApplicationsData;
    
    // Create a copy of the array to avoid mutating read-only array
    return [...loanApplications]
      .sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt))
      .slice(0, 5)
      .map(app => ({
        name: app.fullName || app.applicantName || 'Unknown Applicant',
        email: app.email || app.mobileNumber || 'No Contact',
        fallback: (app.fullName || app.applicantName || 'U').substring(0, 2).toUpperCase(),
        status: app.applicationStatus || 'PENDING',
        amount: `₹${parseFloat(app.loanAmount || 0).toLocaleString('en-IN')}`,
        type: app.loanType || 'Personal Loan'
        
      }));
  }, [loanApplications]);
  
  const totalRecentApplications = recentApplications.length;
  
  return (
    <Card className='h-full'>
      <CardHeader>
        <CardTitle>Recent Applications</CardTitle>
        <CardDescription>
          {loading ? 'Loading...' : `${totalRecentApplications} recent loan applications.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-8'>
          {recentApplications.map((application, index) => (
            <div key={index} className='flex items-center'>
              <Avatar className='h-9 w-9'>
                <AvatarFallback>{application.fallback}</AvatarFallback>
              </Avatar>
              <div className='ml-4 space-y-1'>
                <p className='text-sm leading-none font-medium'>{application.name}</p>
              </div>
              <div className='ml-auto text-right'>
                <div className='font-medium'>{application.amount}</div>
                <div className='text-muted-foreground text-sm'>{application.status}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
