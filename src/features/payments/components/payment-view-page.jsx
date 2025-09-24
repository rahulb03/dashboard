'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPaymentConfigByIdThunk } from '@/redux/payments/paymentConfigThunks';
import { notFound } from 'next/navigation';
import PaymentForm from './payment-form';
import { Loader2 } from 'lucide-react';

export default function PaymentViewPage({ paymentId, isViewMode = false }) {
  const dispatch = useDispatch();
  const { currentPaymentConfig, loading } = useSelector((state) => state.paymentConfig);
  const [pageTitle, setPageTitle] = useState('Create New Payment Configuration');

  useEffect(() => {
    if (paymentId && paymentId !== 'new') {
      if (isViewMode) {
        setPageTitle('View Payment Configuration');
      } else {
        setPageTitle('Edit Payment Configuration');
      }
      dispatch(fetchPaymentConfigByIdThunk({ paymentConfigId: paymentId }));
    }
  }, [dispatch, paymentId, isViewMode]);



  // If trying to edit but payment config not found
  if (paymentId !== 'new' && !currentPaymentConfig && !loading) {
    notFound();
  }

  return (
    <PaymentForm 
      initialData={paymentId === 'new' ? null : currentPaymentConfig} 
      pageTitle={pageTitle}
      isViewMode={isViewMode}
    />
  );
}
