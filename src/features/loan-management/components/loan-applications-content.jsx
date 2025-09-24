'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LoanApplicationsDataTable from './loan-applications-data-table';
import { fetchLoanApplicationsThunk } from '@/redux/Loan_Application/loanThunks';

export default function LoanApplicationsContent() {
  const dispatch = useDispatch();
  const { loanApplications, loading } = useSelector((state) => state.loan);
  
  // Debug logging
  console.log('🔍 Applications Content Debug:', {
    loanApplications,
    loading,
    applicationsLength: loanApplications?.length
  });

  useEffect(() => {
    // Don't force refresh on initial load - use cache if available
    dispatch(fetchLoanApplicationsThunk(false));
  }, [dispatch]);

  const handleExport = (data) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Phone,Status,Loan Amount,Application Date\n"
      + data.map(app => `${app.fullName || ''},${app.email || ''},${app.mobileNumber || ''},${app.applicationStatus || ''},${app.loanAmount || ''},${new Date(app.createdAt).toLocaleDateString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "loan_applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = () => {
    // Force refresh when user explicitly clicks refresh
    dispatch(fetchLoanApplicationsThunk(true));
  };

  return (
    <LoanApplicationsDataTable 
      applications={loanApplications || []}
      loading={loading}
      onRefresh={handleRefresh}
      onExport={handleExport}
      onCreateApplication={() => {}}
      onEditApplication={() => {}}
      onViewApplication={() => {}}
      onDeleteApplication={() => {}}
    />
  );
}
