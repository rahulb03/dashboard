'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocumentsTable from './documents-table';
import { fetchLoanApplicationsThunk } from '@/redux/Loan_Application/loanThunks';

export default function DocumentsContent() {
  const dispatch = useDispatch();
  const { loanApplications, loading } = useSelector((state) => state.loan);

  useEffect(() => {
    // Don't force refresh on initial load - use cache if available
    dispatch(fetchLoanApplicationsThunk(false));
  }, [dispatch]);

  return (
    <DocumentsTable 
      applications={loanApplications || []}
      loading={loading}
    />
  );
}
