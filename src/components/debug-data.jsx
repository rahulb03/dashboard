'use client';

import { useSelector } from 'react-redux';

export function DebugData() {
  const loanState = useSelector((state) => state.loan);
  const memberState = useSelector((state) => state.member);
  const paymentState = useSelector((state) => state.payments);
  const trackingState = useSelector((state) => state.tracking);

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: '#000', 
      color: '#fff', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <h4>🐛 Debug Data</h4>
      <div>Loans: {loanState.loanApplications?.length || 0} items</div>
      <div>Members: {memberState.data?.length || 0} items</div>
      <div>Payments: {paymentState.data?.payments?.length || 0} items</div>
      <div>Sessions: {trackingState.sessions?.length || 0} items</div>
      <div>Stats: {trackingState.statsummary ? 'Available' : 'None'}</div>
      <div>Loading: L:{loanState.loading?'T':'F'} M:{memberState.loading?'T':'F'} P:{paymentState.loading?'T':'F'} T:{trackingState.dashboardLoading?'T':'F'}</div>
      <div style={{fontSize: '10px'}}>Paths: loan.loanApplications | member.data | payments.data.payments | tracking.sessions</div>
    </div>
  );
}