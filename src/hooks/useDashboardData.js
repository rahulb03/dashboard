import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSmartCache } from './useSmartCache';

// Dashboard data hook for comprehensive management statistics
export const useDashboardData = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get data from Redux store
  const loans = useSelector((state) => state.loan?.applications || []);
  const members = useSelector((state) => state.member?.members || []);
  const memberships = useSelector((state) => state.membership?.memberships || []);
  const payments = useSelector((state) => state.payment?.payments || []);
  const paymentConfigs = useSelector((state) => state.paymentConfig?.configurations || []);
  const tracking = useSelector((state) => state.tracking?.sessions || []);
  const salary = useSelector((state) => state.salary?.configurations || []);

  // Use smart cache for performance
  const { getCachedData, setCachedData } = useSmartCache();

  // Calculate loan statistics
  const loanStats = useMemo(() => {
    const totalLoans = loans.length;
    const pendingLoans = loans.filter(loan => loan.status === 'PENDING' || loan.status === 'UNDER_REVIEW').length;
    const approvedLoans = loans.filter(loan => loan.status === 'APPROVED').length;
    const rejectedLoans = loans.filter(loan => loan.status === 'REJECTED').length;
    const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);
    const approvedAmount = loans
      .filter(loan => loan.status === 'APPROVED')
      .reduce((sum, loan) => sum + (loan.loanAmount || 0), 0);

    return {
      totalLoans,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
      totalLoanAmount,
      approvedAmount,
      approvalRate: totalLoans > 0 ? ((approvedLoans / totalLoans) * 100).toFixed(1) : 0
    };
  }, [loans]);

  // Calculate member statistics
  const memberStats = useMemo(() => {
    const totalMembers = members.length;
    const activeMembers = members.filter(member => member.status === 'active').length;
    const inactiveMembers = members.filter(member => member.status === 'inactive').length;
    const newMembersThisMonth = members.filter(member => {
      const createdDate = new Date(member.createdAt || member.joinedDate);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      totalMembers,
      activeMembers,
      inactiveMembers,
      newMembersThisMonth,
      activeRate: totalMembers > 0 ? ((activeMembers / totalMembers) * 100).toFixed(1) : 0
    };
  }, [members]);

  // Calculate membership statistics
  const membershipStats = useMemo(() => {
    const totalMemberships = memberships.length;
    const activeMemberships = memberships.filter(membership => membership.status === 'active').length;
    const expiredMemberships = memberships.filter(membership => membership.status === 'expired').length;
    const expiringThisMonth = memberships.filter(membership => {
      const expiryDate = new Date(membership.expiryDate);
      const now = new Date();
      return expiryDate.getMonth() === now.getMonth() && 
             expiryDate.getFullYear() === now.getFullYear() &&
             expiryDate > now;
    }).length;

    const totalRevenue = memberships
      .filter(membership => membership.status === 'active')
      .reduce((sum, membership) => sum + (membership.amount || membership.fee || 0), 0);

    return {
      totalMemberships,
      activeMemberships,
      expiredMemberships,
      expiringThisMonth,
      totalRevenue,
      renewalRate: totalMemberships > 0 ? ((activeMemberships / totalMemberships) * 100).toFixed(1) : 0
    };
  }, [memberships]);

  // Calculate payment statistics
  const paymentStats = useMemo(() => {
    const totalPayments = payments.length;
    const successfulPayments = payments.filter(payment => payment.status === 'completed' || payment.status === 'success').length;
    const failedPayments = payments.filter(payment => payment.status === 'failed').length;
    const pendingPayments = payments.filter(payment => payment.status === 'pending').length;
    
    const totalAmount = payments
      .filter(payment => payment.status === 'completed' || payment.status === 'success')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const thisMonthPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt || payment.date);
      const now = new Date();
      return paymentDate.getMonth() === now.getMonth() && 
             paymentDate.getFullYear() === now.getFullYear();
    });

    const thisMonthAmount = thisMonthPayments
      .filter(payment => payment.status === 'completed' || payment.status === 'success')
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    return {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalAmount,
      thisMonthAmount,
      successRate: totalPayments > 0 ? ((successfulPayments / totalPayments) * 100).toFixed(1) : 0
    };
  }, [payments]);

  // Calculate tracking statistics
  const trackingStats = useMemo(() => {
    const totalSessions = tracking.length;
    const activeSessions = tracking.filter(session => session.status === 'active').length;
    const todaySessions = tracking.filter(session => {
      const sessionDate = new Date(session.createdAt || session.startTime);
      const today = new Date();
      return sessionDate.toDateString() === today.toDateString();
    }).length;

    const avgSessionDuration = tracking.reduce((sum, session) => {
      const duration = session.duration || session.endTime - session.startTime || 0;
      return sum + duration;
    }, 0) / (totalSessions || 1);

    return {
      totalSessions,
      activeSessions,
      todaySessions,
      avgSessionDuration: Math.round(avgSessionDuration / 1000 / 60), // in minutes
    };
  }, [tracking]);

  // Calculate recent activities
  const recentActivities = useMemo(() => {
    const activities = [];

    // Recent loans
    loans.slice(0, 5).forEach(loan => {
      activities.push({
        id: `loan-${loan.id}`,
        type: 'loan',
        title: `Loan Application #${loan.applicationNumber || loan.id}`,
        description: `${loan.applicantName} - $${loan.loanAmount?.toLocaleString()}`,
        status: loan.status,
        date: loan.createdAt || loan.applicationDate,
        amount: loan.loanAmount,
        link: `/dashboard/loans/applications/${loan.id}/view`
      });
    });

    // Recent members
    members.slice(0, 3).forEach(member => {
      activities.push({
        id: `member-${member.id}`,
        type: 'member',
        title: `New Member Joined`,
        description: `${member.name || member.firstName + ' ' + member.lastName}`,
        status: member.status,
        date: member.createdAt || member.joinedDate,
        link: `/dashboard/members/${member.id}/view`
      });
    });

    // Recent payments
    payments.slice(0, 3).forEach(payment => {
      activities.push({
        id: `payment-${payment.id}`,
        type: 'payment',
        title: `Payment ${payment.status}`,
        description: payment.description || `Payment ID: ${payment.id}`,
        status: payment.status,
        date: payment.createdAt || payment.date,
        amount: payment.amount,
        link: `/dashboard/payments/${payment.id}/view`
      });
    });

    // Sort by date (newest first)
    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  }, [loans, members, payments]);

  // Pending approvals and actions
  const pendingActions = useMemo(() => {
    const actions = [];

    // Pending loan approvals
    const pendingLoanApprovals = loans.filter(loan => 
      loan.status === 'PENDING' || loan.status === 'UNDER_REVIEW'
    ).length;

    if (pendingLoanApprovals > 0) {
      actions.push({
        type: 'loan_approval',
        title: `${pendingLoanApprovals} Loan${pendingLoanApprovals > 1 ? 's' : ''} Pending Approval`,
        count: pendingLoanApprovals,
        priority: 'high',
        link: '/dashboard/loans/applications?status=pending'
      });
    }

    // Expiring memberships
    const expiringMemberships = membershipStats.expiringThisMonth;
    if (expiringMemberships > 0) {
      actions.push({
        type: 'membership_expiry',
        title: `${expiringMemberships} Membership${expiringMemberships > 1 ? 's' : ''} Expiring This Month`,
        count: expiringMemberships,
        priority: 'medium',
        link: '/dashboard/memberships?expiring=true'
      });
    }

    // Failed payments
    const failedPayments = paymentStats.failedPayments;
    if (failedPayments > 0) {
      actions.push({
        type: 'payment_failure',
        title: `${failedPayments} Failed Payment${failedPayments > 1 ? 's' : ''}`,
        count: failedPayments,
        priority: 'high',
        link: '/dashboard/payments?status=failed'
      });
    }

    // Inactive members (no activity in last 30 days)
    const inactiveMembers = memberStats.inactiveMembers;
    if (inactiveMembers > 0) {
      actions.push({
        type: 'member_inactive',
        title: `${inactiveMembers} Inactive Member${inactiveMembers > 1 ? 's' : ''}`,
        count: inactiveMembers,
        priority: 'low',
        link: '/dashboard/members?status=inactive'
      });
    }

    return actions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [loanStats, membershipStats, paymentStats, memberStats]);

  // Load data on mount
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Here you would dispatch actions to load data from APIs
        // For now, we'll use the data from the store
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  return {
    loading,
    error,
    loanStats,
    memberStats,
    membershipStats,
    paymentStats,
    trackingStats,
    recentActivities,
    pendingActions
  };
};

// Quick stats hook for header cards
export const useQuickStats = () => {
  const { loanStats, memberStats, membershipStats, paymentStats } = useDashboardData();

  return useMemo(() => ({
    totalRevenue: membershipStats.totalRevenue + paymentStats.totalAmount,
    totalMembers: memberStats.totalMembers,
    activeLoans: loanStats.approvedLoans,
    successRate: paymentStats.successRate
  }), [loanStats, memberStats, membershipStats, paymentStats]);
};