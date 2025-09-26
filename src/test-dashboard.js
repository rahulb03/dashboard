// Simple test script to validate dashboard data integration
// This can be run to test the dashboard without backend

const testDashboardData = {
  // Mock member data
  members: [
    { id: 1, name: 'John Doe', email: 'john@example.com', isActive: true },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', isActive: true },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', isActive: false },
  ],

  // Mock loan applications data
  loanApplications: [
    {
      id: 1,
      applicantName: 'John Doe',
      memberId: 1,
      loanAmount: 50000,
      applicationStatus: 'PENDING',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      applicantName: 'Jane Smith',
      memberId: 2,
      loanAmount: 75000,
      applicationStatus: 'APPROVED',
      createdAt: '2024-01-14T14:30:00Z'
    },
    {
      id: 3,
      applicantName: 'Bob Johnson',
      memberId: 3,
      loanAmount: 30000,
      applicationStatus: 'REJECTED',
      createdAt: '2024-01-13T09:15:00Z'
    }
  ]
};

// Test dashboard calculations
function testDashboardCalculations() {
  const { members, loanApplications } = testDashboardData;
  
  // Calculate stats like the dashboard thunks do
  const totalUsers = members.length;
  const activeMembers = members.filter(m => m.isActive).length;
  const totalLoans = loanApplications.length;
  const completedApplications = loanApplications.filter(app => app.applicationStatus === 'APPROVED').length;
  const pendingApplications = loanApplications.filter(app => app.applicationStatus === 'PENDING').length;
  const totalRevenue = loanApplications.reduce((sum, loan) => sum + parseFloat(loan.loanAmount), 0);
  
  console.log('🧪 Dashboard Test Results:');
  console.log('- Total Users:', totalUsers);
  console.log('- Active Members:', activeMembers);
  console.log('- Total Loans:', totalLoans);
  console.log('- Completed Applications:', completedApplications);
  console.log('- Pending Applications:', pendingApplications);
  console.log('- Total Revenue:', `$${totalRevenue.toLocaleString()}`);
  
  // Test recent activities generation
  const activities = loanApplications.map(loan => {
    const member = members.find(m => m.id === loan.memberId);
    return {
      id: loan.id,
      memberName: member?.name || 'Unknown User',
      type: 'Loan Application',
      status: loan.applicationStatus,
      amount: parseFloat(loan.loanAmount),
      createdAt: loan.createdAt
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  console.log('🔄 Recent Activities:', activities.length, 'items');
  
  return {
    totalUsers,
    activeMembers,
    totalLoans,
    completedApplications,
    pendingApplications,
    totalRevenue,
    activities
  };
}

// Export for use in components if needed
export { testDashboardData, testDashboardCalculations };

// Run test if this file is executed directly
if (typeof window === 'undefined') {
  testDashboardCalculations();
}