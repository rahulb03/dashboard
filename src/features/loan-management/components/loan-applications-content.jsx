'use client';

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import LoanApplicationsDataTable from './loan-applications-data-table';
import { fetchLoanApplicationsThunk } from '@/redux/Loan_Application/loanThunks';
import { useSimpleCacheData, useSimpleCache } from '@/hooks/useSimpleCache';

export default function LoanApplicationsContent() {
  const { loanApplications, loading: reduxLoading } = useSelector((state) => state.loan);
  
  // Use simple smart caching for loan applications
  const { data: cachedData, loading: cacheLoading, refetch } = useSimpleCacheData(
    fetchLoanApplicationsThunk,
    'loanApplications',
    {},
    { autoFetch: true }
  );
  
  const { getCacheStats } = useSimpleCache();
  
  // Use cached data if available, fallback to Redux state
  const applications = cachedData?.loanApplications || loanApplications || [];
  const loading = cacheLoading || reduxLoading;
  
  // Debug logging with cache info
  const cacheStats = getCacheStats();
  console.log('🔍 Applications Content Debug:', {
    applications: applications.length,
    loading,
    cacheHitRate: `${cacheStats.cacheHitRate.toFixed(1)}%`,
    cacheSize: cacheStats.cacheSize,
    usingCache: !!cachedData
  });

  const handleExport = (data) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Name,Email,Phone,Status,Loan Amount,Application Date\n' +
      data
        .map(
          (app) =>
            `${app.fullName || ''},${app.email || ''},${app.mobileNumber || ''},${app.applicationStatus || ''},${app.loanAmount || ''},${new Date(app.createdAt).toLocaleDateString()}`
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'loan_applications.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRefresh = useCallback(() => {
    // Force refresh when user explicitly clicks refresh
    refetch(true);
  }, [refetch]);

  return (
    <LoanApplicationsDataTable
      applications={applications}
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
