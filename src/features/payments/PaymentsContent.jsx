'use client';

import { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';
import { PaymentTable } from './PaymentTable';
import { fetchPaymentsThunk } from '@/redux/payments/paymentThunks';
import { columns } from './PaymentTableColumns';

export default function PaymentsContent() {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector((state) => state.payments);
  
  useEffect(() => {
    // console.log('📡 Fetching payments on mount');
    dispatch(fetchPaymentsThunk({}));
  }, [dispatch]);

  const handleExport = (data) => {
    // console.log('📊 Exporting payments data:', data.length);
    
    // Prepare data for Excel export
    const excelData = data.map(payment => {
      return {
        'Payment ID': payment.id || '',
        'User ID': payment.userId || '',
        'User Name': payment.user?.name || '',
        'User Email': payment.user?.email || '',
        'User Mobile': payment.user?.mobile || '',
        'Amount': payment.amount ? `₹${payment.amount.toLocaleString('en-IN')}` : '',
        'Currency': payment.currency || 'INR',
        'Type': payment.type ? payment.type.replace(/_/g, ' ') : '',
        'Status': payment.status || '',
        'Receipt': payment.receipt || '',
        'Cashfree Order ID': payment.cfOrderId || payment.cashfreeOrderId || '',
        'Cashfree Payment ID': payment.cfPaymentId || payment.cashfreePaymentId || '',
        'Payment Session ID': payment.paymentSessionId || '',
        'Loan Application ID': payment.loanApplicationId || '',
        'Refund Amount': payment.refundAmount ? `₹${payment.refundAmount.toLocaleString('en-IN')}` : '',
        'Refund ID': payment.refundId || '',
        'Refund Reason': payment.refundReason || '',
        'Refunded At': payment.refundedAt ? new Date(payment.refundedAt).toLocaleString('en-IN') : '',
        'Failure Reason': payment.failureReason || '',
        'Notes': payment.notes ? JSON.stringify(payment.notes) : '',
        'Payment Date': payment.paidAt ? new Date(payment.paidAt).toLocaleString('en-IN') : '',
        'Created Date': payment.createdAt ? new Date(payment.createdAt).toLocaleString('en-IN') : '',
        'Updated Date': payment.updatedAt ? new Date(payment.updatedAt).toLocaleString('en-IN') : '',
      };
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths for proper display
    const columnWidths = [
      { wch: 38 },  // Payment ID
      { wch: 10 },  // User ID
      { wch: 25 },  // User Name
      { wch: 30 },  // User Email
      { wch: 15 },  // User Mobile
      { wch: 15 },  // Amount
      { wch: 10 },  // Currency
      { wch: 18 },  // Type
      { wch: 12 },  // Status
      { wch: 25 },  // Receipt
      { wch: 30 },  // Cashfree Order ID
      { wch: 30 },  // Cashfree Payment ID
      { wch: 60 },  // Payment Session ID
      { wch: 20 },  // Loan Application ID
      { wch: 15 },  // Refund Amount
      { wch: 20 },  // Refund ID
      { wch: 30 },  // Refund Reason
      { wch: 20 },  // Refunded At
      { wch: 30 },  // Failure Reason
      { wch: 50 },  // Notes
      { wch: 20 },  // Payment Date
      { wch: 20 },  // Created Date
      { wch: 20 }   // Updated Date
    ];
    worksheet['!cols'] = columnWidths;
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
    
    // Generate Excel file and download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payments_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // console.log('✅ Export completed');
  };

  const handleRefresh = useCallback(() => {
    // console.log('🔄 Refreshing payments');
    dispatch(fetchPaymentsThunk({}));
  }, [dispatch]);

  return (
    <PaymentTable 
      columns={columns} 
      onExport={handleExport}
      onRefresh={handleRefresh}
    />
  );
}
