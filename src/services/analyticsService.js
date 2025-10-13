/**
 * Analytics Service
 * 
 * Comprehensive analytics service for tracking and analyzing user flow data.
 * Handles funnel analytics, trend analysis, and statistical calculations.
 */

// Note: These imports will need to be adjusted based on your actual project structure
// For now, we'll create placeholder functions for development

// Mock database connection - replace with your actual prisma setup
const prisma = {
  userFlowTracking: {
    findMany: () => Promise.resolve([]),
    count: () => Promise.resolve(0),
    groupBy: () => Promise.resolve([]),
  },
  stepInteractionLogs: {
    count: () => Promise.resolve(0),
  }
};

// Utility functions - replace with your actual implementations
const getDateRange = (range) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (range) {
    case '1d':
      startDate.setDate(now.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }
  
  return {
    startDate: startDate.toISOString(),
    endDate: now.toISOString()
  };
};

const calculateConversionFunnel = (sessions) => {
  // Placeholder implementation
  return {
    steps: [],
    overallConversion: 0
  };
};

const normalizePhoneNumber = (phone) => {
  return phone ? phone.replace(/\D/g, '') : null;
};

const generateSessionSummary = (session, logs = []) => {
  return {
    sessionId: session.sessionId,
    isCompleted: session.isCompleted,
    totalDuration: session.totalDuration || 0,
    stepCount: logs.length
  };
};

const calculateSessionDuration = (startedAt) => {
  return Math.floor((new Date() - new Date(startedAt)) / 1000);
};

/**
 * Get optimized funnel analytics with conversion rates
 * @param {string} dateRange - Date range (1d, 7d, 30d, all)
 * @param {string} startDate - Optional custom start date
 * @param {string} endDate - Optional custom end date
 * @returns {Object} Funnel analytics data
 */
async function getOptimizedFunnelAnalytics(dateRange = '7d', startDate = null, endDate = null) {
  try {
    // console.log(`📊 Generating optimized funnel analytics for ${dateRange}`);

    // Determine date range
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        startedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else if (dateRange !== 'all') {
      const range = getDateRange(dateRange);
      dateFilter = {
        startedAt: {
          gte: new Date(range.startDate),
          lte: new Date(range.endDate)
        }
      };
    }

    // Get all sessions in date range
    const sessions = await prisma.userFlowTracking.findMany({
      where: dateFilter,
      include: {
        stepLogs: {
          orderBy: { timestamp: 'asc' },
          select: {
            stepName: true,
            stepIndex: true,
            action: true,
            timestamp: true,
            timeFromStart: true
          }
        }
      }
    });

    // Calculate funnel steps
    const funnelData = await calculateAdvancedFunnel(sessions);
    
    // Get conversion metrics
    const conversionMetrics = calculateConversionMetrics(sessions);
    
    // Get drop-off analysis
    const dropOffAnalysis = await getDropOffAnalysis(sessions, dateFilter);
    
    // Get time-based analysis
    const timeAnalysis = getTimeBasedAnalysis(sessions);

    return {
      success: true,
      data: {
        funnel: funnelData,
        metrics: conversionMetrics,
        dropOffs: dropOffAnalysis,
        timeAnalysis: timeAnalysis,
        summary: {
          totalSessions: sessions.length,
          completedSessions: sessions.filter(s => s.isCompleted).length,
          averageSessionDuration: sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / sessions.length,
          overallConversionRate: sessions.length > 0 ? (sessions.filter(s => s.isCompleted).length / sessions.length) * 100 : 0
        }
      },
      meta: {
        dateRange,
        startDate,
        endDate,
        generatedAt: new Date().toISOString(),
        sessionCount: sessions.length
      }
    };

  } catch (error) {
    console.error('❌ Optimized funnel analytics error:', error);
    throw new Error('Failed to generate optimized funnel analytics');
  }
}

/**
 * Calculate advanced funnel with step-by-step conversion rates
 * @param {Array} sessions - Array of session data
 * @returns {Object} Funnel analysis
 */
async function calculateAdvancedFunnel(sessions) {
  // Get all unique steps from the sessions
  const allSteps = new Set();
  sessions.forEach(session => {
    session.stepLogs.forEach(log => {
      allSteps.add(log.stepName);
    });
  });

  const stepNames = Array.from(allSteps).sort();
  
  // Calculate funnel for each step
  const funnelSteps = stepNames.map((stepName, index) => {
    const sessionsReachingStep = sessions.filter(session => 
      session.stepLogs.some(log => log.stepName === stepName)
    );
    
    const sessionsCompletingStep = sessionsReachingStep.filter(session => {
      const stepLogs = session.stepLogs.filter(log => log.stepName === stepName);
      return stepLogs.some(log => log.action === 'completed' || log.action === 'next');
    });

    const conversionRate = sessionsReachingStep.length > 0 
      ? (sessionsCompletingStep.length / sessionsReachingStep.length) * 100 
      : 0;

    const dropOffRate = 100 - conversionRate;

    return {
      stepName,
      stepIndex: index,
      totalReached: sessionsReachingStep.length,
      totalCompleted: sessionsCompletingStep.length,
      conversionRate: Math.round(conversionRate * 100) / 100,
      dropOffRate: Math.round(dropOffRate * 100) / 100,
      dropOffCount: sessionsReachingStep.length - sessionsCompletingStep.length
    };
  });

  return {
    steps: funnelSteps,
    overallFunnel: {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.isCompleted).length,
      overallConversionRate: sessions.length > 0 
        ? Math.round((sessions.filter(s => s.isCompleted).length / sessions.length) * 10000) / 100
        : 0
    }
  };
}

/**
 * Calculate detailed conversion metrics
 * @param {Array} sessions - Array of session data
 * @returns {Object} Conversion metrics
 */
function calculateConversionMetrics(sessions) {
  const completed = sessions.filter(s => s.isCompleted);
  const abandoned = sessions.filter(s => !s.isCompleted && s.dropOffStep);
  const inProgress = sessions.filter(s => !s.isCompleted && !s.dropOffStep);

  return {
    totalSessions: sessions.length,
    completedSessions: completed.length,
    abandonedSessions: abandoned.length,
    inProgressSessions: inProgress.length,
    completionRate: sessions.length > 0 ? (completed.length / sessions.length) * 100 : 0,
    abandonmentRate: sessions.length > 0 ? (abandoned.length / sessions.length) * 100 : 0,
    averageCompletionTime: completed.length > 0 
      ? completed.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / completed.length 
      : 0,
    averageAbandonmentTime: abandoned.length > 0
      ? abandoned.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / abandoned.length
      : 0
  };
}

/**
 * Get detailed drop-off analysis
 * @param {Array} sessions - Array of session data
 * @param {Object} dateFilter - Date filter for additional queries
 * @returns {Object} Drop-off analysis
 */
async function getDropOffAnalysis(sessions, dateFilter) {
  // Get drop-off points from current sessions
  const dropOffs = {};
  sessions.forEach(session => {
    if (session.dropOffStep) {
      dropOffs[session.dropOffStep] = (dropOffs[session.dropOffStep] || 0) + 1;
    }
  });

  // Sort drop-offs by frequency
  const sortedDropOffs = Object.entries(dropOffs)
    .map(([step, count]) => ({ step, count }))
    .sort((a, b) => b.count - a.count);

  // Get additional drop-off insights from database
  const topDropOffSteps = await prisma.userFlowTracking.groupBy({
    by: ['dropOffStep'],
    where: {
      ...dateFilter,
      dropOffStep: { not: null }
    },
    _count: { dropOffStep: true },
    orderBy: { _count: { dropOffStep: 'desc' } },
    take: 10
  });

  return {
    currentPeriod: sortedDropOffs,
    topDropOffs: topDropOffSteps.map(d => ({
      step: d.dropOffStep,
      count: d._count.dropOffStep
    })),
    totalDropOffs: sortedDropOffs.reduce((sum, d) => sum + d.count, 0)
  };
}

/**
 * Get time-based analysis
 * @param {Array} sessions - Array of session data
 * @returns {Object} Time-based analysis
 */
function getTimeBasedAnalysis(sessions) {
  const hourlyDistribution = {};
  const dailyDistribution = {};

  sessions.forEach(session => {
    const startDate = new Date(session.startedAt);
    const hour = startDate.getHours();
    const day = startDate.toISOString().split('T')[0];

    hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
    dailyDistribution[day] = (dailyDistribution[day] || 0) + 1;
  });

  return {
    hourlyDistribution: Object.entries(hourlyDistribution).map(([hour, count]) => ({
      hour: parseInt(hour),
      count
    })).sort((a, b) => a.hour - b.hour),
    dailyDistribution: Object.entries(dailyDistribution).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date))
  };
}

/**
 * Get trending analysis with historical comparisons
 * @param {string} period - Time period (daily, weekly, monthly)
 * @param {number} periods - Number of periods to analyze
 * @returns {Object} Trending analysis
 */
async function getTrendingAnalysis(period = 'daily', periods = 7) {
  try {
    // console.log(`📈 Generating trending analysis: ${period} for ${periods} periods`);

    const now = new Date();
    const trends = [];

    for (let i = periods - 1; i >= 0; i--) {
      let startDate, endDate;
      
      if (period === 'daily') {
        startDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      } else if (period === 'weekly') {
        startDate = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      } else if (period === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      }

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const periodSessions = await prisma.userFlowTracking.findMany({
        where: {
          startedAt: {
            gte: startDate,
            lt: endDate
          }
        },
        select: {
          isCompleted: true,
          totalDuration: true,
          dropOffStep: true
        }
      });

      const completedSessions = periodSessions.filter(s => s.isCompleted).length;
      const totalSessions = periodSessions.length;
      const conversionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      const averageDuration = totalSessions > 0 
        ? periodSessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / totalSessions 
        : 0;

      trends.push({
        period: startDate.toISOString().split('T')[0],
        totalSessions,
        completedSessions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageDuration: Math.round(averageDuration),
        abandonedSessions: periodSessions.filter(s => !s.isCompleted && s.dropOffStep).length
      });
    }

    // Calculate trends (percentage change from previous period)
    const trendsWithChanges = trends.map((current, index) => {
      if (index === 0) {
        return { ...current, changes: {} };
      }
      
      const previous = trends[index - 1];
      return {
        ...current,
        changes: {
          sessionsChange: previous.totalSessions > 0 
            ? ((current.totalSessions - previous.totalSessions) / previous.totalSessions) * 100
            : 0,
          conversionChange: previous.conversionRate > 0
            ? ((current.conversionRate - previous.conversionRate) / previous.conversionRate) * 100
            : 0,
          durationChange: previous.averageDuration > 0
            ? ((current.averageDuration - previous.averageDuration) / previous.averageDuration) * 100
            : 0
        }
      };
    });

    return {
      success: true,
      data: {
        trends: trendsWithChanges,
        summary: {
          totalPeriods: periods,
          period,
          latestPeriod: trends[trends.length - 1],
          averageConversion: trends.reduce((sum, t) => sum + t.conversionRate, 0) / trends.length
        }
      },
      meta: {
        generatedAt: new Date().toISOString(),
        period,
        periodsAnalyzed: periods
      }
    };

  } catch (error) {
    console.error('❌ Trending analysis error:', error);
    throw new Error('Failed to generate trending analysis');
  }
}

/**
 * Calculate daily funnel stats (for the calculate-stats endpoint)
 * @param {Date} targetDate - Target date for calculation (default: today)
 * @returns {Object} Calculated stats
 */
async function calculateDailyFunnelStats(targetDate = null) {
  try {
    const date = targetDate || new Date();
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    // console.log(`🧮 Calculating daily stats for ${startOfDay.toISOString().split('T')[0]}`);

    // Get all sessions for the day
    const sessions = await prisma.userFlowTracking.findMany({
      where: {
        startedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      include: {
        stepLogs: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    // Calculate comprehensive stats
    const stats = {
      date: startOfDay.toISOString().split('T')[0],
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.isCompleted).length,
      abandonedSessions: sessions.filter(s => !s.isCompleted && s.dropOffStep).length,
      inProgressSessions: sessions.filter(s => !s.isCompleted && !s.dropOffStep).length,
      conversionRate: sessions.length > 0 ? (sessions.filter(s => s.isCompleted).length / sessions.length) * 100 : 0,
      averageSessionDuration: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.totalDuration || 0), 0) / sessions.length 
        : 0,
      uniqueUsers: new Set(sessions.map(s => s.phoneNumber).filter(Boolean)).size,
      totalStepInteractions: sessions.reduce((sum, s) => sum + (s.stepLogs?.length || 0), 0)
    };

    // Get top drop-off points for the day
    const dropOffs = sessions
      .filter(s => s.dropOffStep)
      .reduce((acc, s) => {
        acc[s.dropOffStep] = (acc[s.dropOffStep] || 0) + 1;
        return acc;
      }, {});

    stats.topDropOffs = Object.entries(dropOffs)
      .map(([step, count]) => ({ step, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Device breakdown
    const deviceStats = sessions.reduce((acc, s) => {
      const device = s.deviceInfo?.device || 'Unknown';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    stats.deviceBreakdown = Object.entries(deviceStats).map(([device, count]) => ({
      device,
      count,
      percentage: (count / sessions.length) * 100
    }));

    // console.log(`✅ Daily stats calculated: ${stats.totalSessions} sessions, ${stats.conversionRate.toFixed(2)}% conversion`);

    return {
      success: true,
      data: stats,
      meta: {
        calculatedAt: new Date().toISOString(),
        targetDate: startOfDay.toISOString(),
        processingTime: Date.now() - new Date().getTime()
      }
    };

  } catch (error) {
    console.error('❌ Calculate daily stats error:', error);
    throw new Error('Failed to calculate daily funnel stats');
  }
}

/**
 * Get comprehensive stats summary
 * @param {string} period - Time period for summary
 * @returns {Object} Stats summary
 */
async function getStatsSummary(period = '7d') {
  try {
    // console.log(`📊 Generating stats summary for ${period}`);

    // Get date range
    let dateFilter = {};
    if (period !== 'all') {
      const range = getDateRange(period);
      dateFilter = {
        startedAt: {
          gte: new Date(range.startDate),
          lte: new Date(range.endDate)
        }
      };
    }

    // Get basic counts
    const totalSessions = await prisma.userFlowTracking.count({
      where: dateFilter
    });

    const completedSessions = await prisma.userFlowTracking.count({
      where: {
        ...dateFilter,
        isCompleted: true
      }
    });

    const abandonedSessions = await prisma.userFlowTracking.count({
      where: {
        ...dateFilter,
        isCompleted: false,
        dropOffStep: { not: null }
      }
    });

    // Get unique users
    const uniqueUsers = await prisma.userFlowTracking.findMany({
      where: dateFilter,
      select: { phoneNumber: true },
      distinct: ['phoneNumber']
    });

    // Get average session duration
    const sessionsWithDuration = await prisma.userFlowTracking.findMany({
      where: {
        ...dateFilter,
        totalDuration: { not: null }
      },
      select: { totalDuration: true }
    });

    const avgDuration = sessionsWithDuration.length > 0
      ? sessionsWithDuration.reduce((sum, s) => sum + s.totalDuration, 0) / sessionsWithDuration.length
      : 0;

    // Get step interactions count
    const stepInteractions = await prisma.stepInteractionLogs.count({
      where: {
        timestamp: dateFilter.startedAt ? {
          gte: dateFilter.startedAt.gte,
          lte: dateFilter.startedAt.lte
        } : undefined
      }
    });

    return {
      success: true,
      data: {
        overview: {
          totalSessions,
          completedSessions,
          abandonedSessions,
          inProgressSessions: totalSessions - completedSessions - abandonedSessions,
          uniqueUsers: uniqueUsers.length,
          conversionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
          abandonmentRate: totalSessions > 0 ? (abandonedSessions / totalSessions) * 100 : 0,
          averageSessionDuration: avgDuration,
          totalStepInteractions: stepInteractions
        },
        period,
        dateRange: dateFilter.startedAt ? {
          start: dateFilter.startedAt.gte.toISOString(),
          end: dateFilter.startedAt.lte.toISOString()
        } : null
      }
    };

  } catch (error) {
    console.error('❌ Stats summary error:', error);
    throw new Error('Failed to generate stats summary');
  }
}

module.exports = {
  getOptimizedFunnelAnalytics,
  getTrendingAnalysis,
  calculateDailyFunnelStats,
  getStatsSummary
};