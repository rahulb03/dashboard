'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoanApplicationByIdThunk } from '@/redux/Loan_Application/loanThunks';
import LoanApplicationFormClean from './loan-application-form-clean';
import LoanApplicationView from './loan-application-view';

export default function LoanApplicationViewPage({ applicationId, mode }) {
  const dispatch = useDispatch();
  const { currentLoanApplication, loading } = useSelector((state) => state.loan);
  const hasFetched = useRef(new Set()); // Track which IDs we've already fetched
  
  let application = null;
  let pageTitle = 'Create New Loan Application';
  const isViewMode = mode === 'view';

  useEffect(() => {
    if (applicationId !== 'new' && !hasFetched.current.has(applicationId)) {
      // Check if we already have the right application in state
      const hasCorrectApplication = currentLoanApplication && 
                                   currentLoanApplication.id === parseInt(applicationId);
      
      if (!hasCorrectApplication) {
        // console.log('🔄 Fetching loan application:', applicationId);
        dispatch(fetchLoanApplicationByIdThunk({ id: applicationId }));
        hasFetched.current.add(applicationId); // Mark as fetched
      } else {
        // console.log('📦 Using existing loan application:', currentLoanApplication.id);
        hasFetched.current.add(applicationId); // Mark as fetched since we have it
      }
    }
  }, [dispatch, applicationId, currentLoanApplication]);

  if (applicationId !== 'new') {
    application = currentLoanApplication;
    // Only show notFound if we've attempted to load and failed
    if (!loading && !application && currentLoanApplication === null) {
      // Only trigger notFound after we've actually tried to fetch
      // This prevents premature notFound calls
    }
    
    // Set page title based on mode and application data
    if (isViewMode) {
      pageTitle = `View Application - ${application?.fullName || 'Loading...'}`;
    } else {
      pageTitle = `Edit Application - ${application?.fullName || 'Loading...'}`;
    }
  }

  // Don't show loading UI here - Suspense with skeleton handles it

  // Use different components for view vs edit mode
  if (isViewMode) {
    return <LoanApplicationView application={application} />;
  } else {
    return <LoanApplicationFormClean initialData={application} pageTitle={pageTitle} />;
  }
}