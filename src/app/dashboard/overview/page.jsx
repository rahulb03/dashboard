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

  // ============================================================
  // OPTIMIZED PROGRESSIVE DATA LOADING
  // Loads data in 3 phases to improve perceived performance:
  // Phase 1: Critical data (20 records) - loads immediately
  // Phase 2: Basic analytics - deferred 500ms
  // Phase 3: Heavy analytics - deferred 1500ms
  // ============================================================
  useEffect(() => {
    const loadDashboardData = async () => {
      // console.log('🚀 Starting OPTIMIZED dashboard load...');
      
      // ============================================================
      // PHASE 1: CRITICAL DATA (Load immediately)
      // Reduced from 100 to 20 records for 5x faster initial load
      // These provide the essential stats for dashboard cards
      // ============================================================
      // console.log('📊 Phase 1: Loading critical data (20 records)...');
      
      const phase1Start = performance.now();
      
      await Promise.all([
        dispatch(fetchLoanApplicationsThunk({ limit: 20, forceRefresh: false }))
          .then(() => console.log('✅ Loans loaded (20)'))
          .catch((error) => console.error('❌ Loans error:', error)),
        
        dispatch(fetchMembersThunk({ page: 1, limit: 20, forceRefresh: false }))
          .then(() => console.log('✅ Members loaded (20)'))
          .catch((error) => console.error('❌ Members error:', error)),
        
        dispatch(fetchPaymentsThunk({ page: 1, limit: 20, forceRefresh: false }))
          .then(() => console.log('✅ Payments loaded (20)'))
          .catch((error) => console.error('❌ Payments error:', error))
      ]);
      
      const phase1Time = performance.now() - phase1Start;
      // console.log(`✅ Phase 1 complete in ${Math.round(phase1Time)}ms`);
      
      // ============================================================
      // PHASE 2: BASIC ANALYTICS (Deferred 500ms)
      // Dashboard summary and recent sessions (20 records)
      // Allows UI to render critical data first
      // ============================================================
      setTimeout(() => {
        console.log('📈 Phase 2: Loading basic analytics...');
        
        dispatch(fetchTrackingDashboardThunk({ forceRefresh: false }))
          .then(() => console.log('✅ Dashboard summary loaded'))
          .catch((error) => console.error('❌ Dashboard error:', error));
        
        dispatch(fetchStatsThunk({ forceRefresh: false }))
          .then(() => console.log('✅ Stats loaded'))
          .catch((error) => console.error('❌ Stats error:', error));
        
        // Fetch more sessions for chart visualization (100 for better trends)
        dispatch(fetchTrackingSessionsThunk({ limit: 100, forceRefresh: false }))
          .then(() => console.log('✅ Sessions loaded (100 for charts)'))
          .catch((error) => console.error('❌ Sessions error:', error));
      }, 500);
      
      // ============================================================
      // PHASE 3: HEAVY ANALYTICS (Deferred 1500ms)
      // Chart data with reduced ranges for better performance
      // - Trends: 3 periods instead of 6
      // - Funnel: 7 days instead of 30 days
      // ============================================================
      setTimeout(() => {
        // console.log('📊 Phase 3: Loading heavy analytics...');
        
        // Reduced from 6 to 3 periods
        dispatch(fetchTrendsThunk({ period: 'monthly', periods: 3, forceRefresh: false }))
          .then(() => console.log('✅ Trends loaded (3 periods)'))
          .catch((error) => console.error('❌ Trends error:', error));
        
        // Reduced from 30 days to 7 days
        dispatch(fetchFunnelAnalyticsThunk({ dateRange: '7d', forceRefresh: false }))
          .then(() => console.log('✅ Funnel loaded (7 days)'))
          .catch((error) => console.error('❌ Funnel error:', error));
      }, 1500);
    };

    loadDashboardData();
  }, [dispatch]);

  // This will be rendered by the layout with parallel routes
  return null;
}
