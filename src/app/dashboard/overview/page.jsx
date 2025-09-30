'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchLoanApplicationsThunk } from '@/redux/Loan_Application/loanThunks';
import { fetchMembersThunk } from '@/redux/member/memberThunks';
import { fetchPaymentsThunk } from '@/redux/payments/paymentThunks';
import { 
  fetchTrackingDashboardThunk, 
  fetchTrackingSessionsThunk, 
  fetchStatsThunk,
  fetchTrendsThunk,
  fetchFunnelAnalyticsThunk 
} from '@/redux/tracking/trackingThunks';

export default function DashboardOverviewPage() {
  const dispatch = useDispatch();

  // Load all dashboard data on component mount (ONCE ONLY)
  useEffect(() => {
    const loadDashboardData = () => {
      console.log('🚀 Loading dashboard data (ONCE)...');
      
      // Load essential dashboard data with focus on tracking analytics (NO force refresh)
      dispatch(fetchLoanApplicationsThunk({ forceRefresh: false }))
        .then((result) => {
          console.log('✅ Loan applications loaded:', result);
        })
        .catch((error) => {
          console.error('❌ Loan applications error:', error);
        });
        
      dispatch(fetchMembersThunk({ page: 1, limit: 100, forceRefresh: false }))
        .then((result) => {
          console.log('✅ Members loaded:', result);
        })
        .catch((error) => {
          console.error('❌ Members error:', error);
        });
        
      dispatch(fetchPaymentsThunk({ page: 1, limit: 100, forceRefresh: false }))
        .then((result) => {
          console.log('✅ Payments loaded:', result);
        })
        .catch((error) => {
          console.error('❌ Payments error:', error);
        });
        
      // Tracking analytics data (cached)
      dispatch(fetchTrackingDashboardThunk({ forceRefresh: false }))
        .then((result) => {
          console.log('✅ Tracking dashboard loaded:', result);
        })
        .catch((error) => {
          console.error('❌ Tracking dashboard error:', error);
        });
        
      dispatch(fetchTrackingSessionsThunk({ limit: 100, forceRefresh: false }))
        .then((result) => {
          console.log('✅ Tracking sessions loaded:', result);
        })
        .catch((error) => {
          console.error('❌ Tracking sessions error:', error);
        });
        
      dispatch(fetchStatsThunk({ forceRefresh: false }))
        .then((result) => {
          console.log('✅ Stats loaded:', result);
        })
        .catch((error) => {
          console.error('❌ Stats error:', error);
        });
        
      dispatch(fetchTrendsThunk({ period: 'monthly', periods: 6, forceRefresh: false }))
        .then((result) => {
          console.log('✅ Trends loaded:', result);
        })
        .catch((error) => {
          console.error('❌ Trends error:', error);
        });
        
      dispatch(fetchFunnelAnalyticsThunk({ dateRange: '30d', forceRefresh: false }))
        .then((result) => {
          console.log('✅ Funnel analytics loaded:', result);
        })
        .catch((error) => {
          console.error('❌ Funnel analytics error:', error);
        });
    };

    loadDashboardData();
  }, [dispatch]);

  // This will be rendered by the layout with parallel routes
  return null;
}