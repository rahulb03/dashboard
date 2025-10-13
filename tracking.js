/**
 * Admin Tracking Controller
 * 
 * This controller handles admin-specific tracking operations:
 * - Analytics and reporting
 * - Session management and monitoring
 * - System administration functions
 */

const { prisma } = require("../../config/db");
const {
  calculateConversionFunnel,
  getDateRange,
  normalizePhoneNumber,
  generateSessionSummary,
  calculateSessionDuration
} = require("../../utils/trackingUtils");

/**
 * Get comprehensive dashboard analytics for admin
 * GET /api/admin/tracking/dashboard
 */
const getAdminDashboardAnalytics = async (req, res) => {
  try {
    // console.log(`📊 Admin dashboard analytics requested by: ${req.user.name}`);
    
    const { enhanced = 'false' } = req.query;
    const includeAdvanced = enhanced === 'true';

    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Active sessions (last 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const activeSessions = await prisma.UserFlowTracking.count({
      where: {
        lastActivity: { gte: thirtyMinutesAgo },
        isCompleted: false
      }
    });

    // Today's stats
    const todaySessions = await prisma.UserFlowTracking.count({
      where: { startedAt: { gte: today } }
    });
    
    const todayCompletions = await prisma.UserFlowTracking.count({
      where: { 
        startedAt: { gte: today },
        isCompleted: true 
      }
    });

    // This week's stats
    const weekSessions = await prisma.UserFlowTracking.count({
      where: { startedAt: { gte: thisWeek } }
    });
    
    const weekCompletions = await prisma.UserFlowTracking.count({
      where: { 
        startedAt: { gte: thisWeek },
        isCompleted: true 
      }
    });

    // This month's stats
    const monthSessions = await prisma.UserFlowTracking.count({
      where: { startedAt: { gte: thisMonth } }
    });
    
    const monthCompletions = await prisma.UserFlowTracking.count({
      where: { 
        startedAt: { gte: thisMonth },
        isCompleted: true 
      }
    });

    // Error rate (last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const totalStepsLast24h = await prisma.StepInteractionLogs.count({
      where: { timestamp: { gte: yesterday } }
    });
    
    const errorStepsLast24h = await prisma.StepInteractionLogs.count({
      where: { 
        timestamp: { gte: yesterday },
        action: 'error'
      }
    });

    const errorRate = totalStepsLast24h > 0 ? (errorStepsLast24h / totalStepsLast24h) * 100 : 0;

    // Top drop-off steps (this week)
    const dropOffs = await prisma.UserFlowTracking.groupBy({
      by: ['dropOffStep'],
      where: {
        startedAt: { gte: thisWeek },
        dropOffStep: { not: null }
      },
      _count: { dropOffStep: true },
      orderBy: { _count: { dropOffStep: 'desc' } },
      take: 5
    });

    // Get recent user activity (last 10 users)
    const recentActivity = await prisma.UserFlowTracking.findMany({
      where: {
        startedAt: { gte: yesterday }
      },
      select: {
        sessionId: true,
        phoneNumber: true,
        currentStep: true,
        startedAt: true,
        lastActivity: true,
        isCompleted: true,
        completionRate: true,
        deviceInfo: true
      },
      orderBy: { startedAt: 'desc' },
      take: 10
    });

    // Advanced metrics (only if requested)
    let advancedMetrics = {};
    if (includeAdvanced) {
      // Hourly trends for today
      const hourlyTrends = [];
      for (let i = 23; i >= 0; i--) {
        const hourStart = new Date(today.getTime() + i * 60 * 60 * 1000);
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);
        
        const hourSessions = await prisma.UserFlowTracking.count({
          where: {
            startedAt: { gte: hourStart, lt: hourEnd }
          }
        });
        
        hourlyTrends.push({
          hour: hourStart.getHours(),
          sessions: hourSessions
        });
      }

      // Device breakdown for this week
      const deviceSessions = await prisma.UserFlowTracking.findMany({
        where: { startedAt: { gte: thisWeek } },
        select: { deviceInfo: true, isCompleted: true }
      });

      const deviceBreakdown = {};
      const browserBreakdown = {};
      deviceSessions.forEach(session => {
        const device = session.deviceInfo?.device || 'Unknown';
        const browser = session.deviceInfo?.browser || 'Unknown';
        
        if (!deviceBreakdown[device]) {
          deviceBreakdown[device] = { total: 0, completed: 0 };
        }
        if (!browserBreakdown[browser]) {
          browserBreakdown[browser] = { total: 0, completed: 0 };
        }
        
        deviceBreakdown[device].total++;
        browserBreakdown[browser].total++;
        
        if (session.isCompleted) {
          deviceBreakdown[device].completed++;
          browserBreakdown[browser].completed++;
        }
      });

      // Calculate conversion rates for devices
      Object.keys(deviceBreakdown).forEach(device => {
        const data = deviceBreakdown[device];
        data.conversionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
      });

      Object.keys(browserBreakdown).forEach(browser => {
        const data = browserBreakdown[browser];
        data.conversionRate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
      });

      // User segments analysis
      const newVsReturning = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN user_sessions.session_count = 1 THEN 'new'
            ELSE 'returning'
          END as user_type,
          COUNT(*) as total_sessions,
          SUM(CASE WHEN "isCompleted" = true THEN 1 ELSE 0 END) as completed_sessions
        FROM "UserFlowTracking" u
        JOIN (
          SELECT "phoneNumber", COUNT(*) as session_count
          FROM "UserFlowTracking"
          WHERE "startedAt" >= ${thisWeek}
          GROUP BY "phoneNumber"
        ) user_sessions ON u."phoneNumber" = user_sessions."phoneNumber"
        WHERE u."startedAt" >= ${thisWeek}
        GROUP BY user_type
      `;

      const userSegments = {
        new: { total: 0, completed: 0, conversionRate: 0 },
        returning: { total: 0, completed: 0, conversionRate: 0 }
      };

      newVsReturning.forEach(segment => {
        const total = parseInt(segment.total_sessions);
        const completed = parseInt(segment.completed_sessions);
        userSegments[segment.user_type] = {
          total,
          completed,
          conversionRate: total > 0 ? (completed / total) * 100 : 0
        };
      });

      advancedMetrics = {
        hourlyTrends,
        deviceBreakdown,
        browserBreakdown,
        userSegments,
        performanceInsights: [
          `Best performing hour: ${hourlyTrends.reduce((max, hour) => hour.sessions > max.sessions ? hour : max, hourlyTrends[0])?.hour || 'N/A'}:00`,
          `Top device: ${Object.entries(deviceBreakdown).sort(([,a], [,b]) => b.conversionRate - a.conversionRate)[0]?.[0] || 'Unknown'}`,
          `User retention: ${userSegments.returning.total > 0 ? ((userSegments.returning.total / (userSegments.new.total + userSegments.returning.total)) * 100).toFixed(1) : 0}% returning users`
        ]
      };
    }

    const dashboard = {
      success: true,
      realTimeMetrics: {
        activeSessions,
        todayConversionRate: todaySessions > 0 ? Math.round((todayCompletions / todaySessions) * 10000) / 100 : 0,
        weeklyConversionRate: weekSessions > 0 ? Math.round((weekCompletions / weekSessions) * 10000) / 100 : 0,
        monthlyConversionRate: monthSessions > 0 ? Math.round((monthCompletions / monthSessions) * 10000) / 100 : 0,
        errorRate: Math.round(errorRate * 100) / 100
      },
      sessionStats: {
        today: { total: todaySessions, completed: todayCompletions },
        thisWeek: { total: weekSessions, completed: weekCompletions },
        thisMonth: { total: monthSessions, completed: monthCompletions }
      },
      topDropOffs: dropOffs.map(d => ({
        step: d.dropOffStep,
        count: d._count.dropOffStep
      })),
      recentActivity: recentActivity.map(activity => ({
        sessionId: activity.sessionId,
        phoneNumber: activity.phoneNumber ? `***-***-${activity.phoneNumber.slice(-4)}` : 'N/A', // Mask phone number
        currentStep: activity.currentStep,
        startedAt: activity.startedAt,
        lastActivity: activity.lastActivity,
        isCompleted: activity.isCompleted,
        completionRate: activity.completionRate,
        device: activity.deviceInfo?.device || 'Unknown'
      })),
      ...(includeAdvanced && { advancedMetrics }),
      meta: {
        generatedAt: new Date().toISOString(),
        generatedBy: req.user.name,
        userRole: req.user.role,
        enhancedMode: includeAdvanced,
        dataRetentionNote: "Phone numbers are masked for privacy"
      }
    };

    // console.log(`✅ Admin dashboard generated successfully`);
    return res.status(200).json(dashboard);

  } catch (error) {
    // console.error("❌ Get admin dashboard analytics error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate admin dashboard analytics",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get all sessions with admin-specific information
 * GET /api/admin/tracking/sessions
 */
const getAdminAllSessions = async (req, res) => {
  try {
    // console.log(`📋 Admin sessions request by: ${req.user.name}`);
    
    const {
      limit = 50, // Reduced default for admin interface
      offset = 0,
      status = 'all',
      dateRange = '7d', // Reduced default for admin
      phoneNumber,
      includeSteps = 'false' // Default false for performance
    } = req.query;

    // Build filters
    let filters = {};
    
    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const range = getDateRange(dateRange);
      filters.startedAt = {
        gte: new Date(range.startDate),
        lte: new Date(range.endDate)
      };
    }
    
    // Status filter
    if (status === 'completed') {
      filters.isCompleted = true;
    } else if (status === 'active') {
      filters.isCompleted = false;
      filters.lastActivity = {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
    } else if (status === 'abandoned') {
      filters.isCompleted = false;
      filters.dropOffStep = { not: null };
    }
    
    // Phone number filter
    if (phoneNumber) {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      filters.phoneNumber = normalizedPhone;
    }

    // Get sessions with optional step logs
    const sessions = await prisma.UserFlowTracking.findMany({
      where: filters,
      include: {
        stepLogs: includeSteps === 'true' ? {
          orderBy: { timestamp: 'asc' },
          select: {
            id: true,
            stepName: true,
            stepIndex: true,
            action: true,
            timestamp: true,
            stepDuration: true,
            timeFromStart: true,
            errorMessage: true
          }
        } : false
      },
      orderBy: { startedAt: 'desc' },
      skip: parseInt(offset),
      take: parseInt(limit)
    });

    // Get total count for pagination
    const totalCount = await prisma.UserFlowTracking.count({
      where: filters
    });

    // Calculate summary statistics
    const completedSessions = sessions.filter(s => s.isCompleted).length;
    const abandonedSessions = sessions.filter(s => !s.isCompleted && s.dropOffStep).length;
    const activeSessions = sessions.filter(s => !s.isCompleted && !s.dropOffStep).length;
    
    const averageDuration = sessions
      .filter(s => s.totalDuration)
      .reduce((sum, s) => sum + s.totalDuration, 0) / Math.max(sessions.filter(s => s.totalDuration).length, 1);

    // Process sessions with admin-specific data
    const processedSessions = sessions.map(session => {
      const summary = generateSessionSummary(session, session.stepLogs || []);
      return {
        ...summary,
        // Admin-specific fields
        adminInfo: {
          sessionId: session.sessionId,
          fullPhoneNumber: session.phoneNumber, // Full phone for admin
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
          deviceInfo: session.deviceInfo
        },
        stepLogs: includeSteps === 'true' ? session.stepLogs : undefined
      };
    });

    const response = {
      success: true,
      message: `Retrieved ${sessions.length} sessions`,
      pagination: {
        total: totalCount,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: totalCount > parseInt(offset) + parseInt(limit)
      },
      summary: {
        totalSessions: sessions.length,
        completedSessions,
        abandonedSessions,
        activeSessions,
        averageDuration: Math.round(averageDuration),
        completionRate: sessions.length > 0 ? Math.round((completedSessions / sessions.length) * 100 * 100) / 100 : 0
      },
      filters: {
        status,
        dateRange,
        phoneNumber: phoneNumber || null,
        includeSteps: includeSteps === 'true'
      },
      data: processedSessions,
      meta: {
        generatedAt: new Date().toISOString(),
        requestedBy: req.user.name,
        userRole: req.user.role
      }
    };

    // console.log(`✅ Admin retrieved ${sessions.length}/${totalCount} sessions`);
    return res.status(200).json(response);

  } catch (error) {
    // console.error("❌ Get admin all sessions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve sessions",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get detailed session information with admin context
 * GET /api/admin/tracking/session/:sessionId
 */
const getAdminSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // console.log(`🔍 Admin getting session details for: ${sessionId} by ${req.user.name}`);

    const session = await prisma.UserFlowTracking.findUnique({
      where: { sessionId },
      include: {
        stepLogs: {
          orderBy: { timestamp: 'asc' }
        }
      }
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
        error: "Session ID does not exist"
      });
    }

    const sessionSummary = generateSessionSummary(session, session.stepLogs);

    // Add admin-specific analysis
    const errorLogs = session.stepLogs.filter(log => log.action === 'error');
    const abandonmentLogs = session.stepLogs.filter(log => log.action === 'abandonment');
    const uniqueSteps = [...new Set(session.stepLogs.map(log => log.stepName))];
    const stepDurations = session.stepLogs
      .filter(log => log.stepDuration)
      .map(log => ({ step: log.stepName, duration: log.stepDuration }));

    return res.status(200).json({
      success: true,
      data: {
        session: {
          ...sessionSummary,
          // Admin-specific details
          adminDetails: {
            fullPhoneNumber: session.phoneNumber,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
            rawDeviceInfo: session.deviceInfo,
            flowVersion: session.flowVersion
          }
        },
        stepLogs: session.stepLogs,
        analysis: {
          totalSteps: session.stepLogs.length,
          uniqueSteps: uniqueSteps.length,
          uniqueStepNames: uniqueSteps,
          errorCount: errorLogs.length,
          abandonmentCount: abandonmentLogs.length,
          stepDurations: stepDurations,
          sessionDuration: session.totalDuration || calculateSessionDuration(session.startedAt),
          lastActivity: session.lastActivity
        },
        errors: errorLogs,
        abandonments: abandonmentLogs
      },
      meta: {
        viewedBy: req.user.name,
        viewedAt: new Date().toISOString(),
        userRole: req.user.role
      }
    });

  } catch (error) {
    // console.error("❌ Get admin session details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get session details",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get real-time performance metrics
 * GET /api/admin/tracking/realtime/performance
 */
const getRealTimePerformance = async (req, res) => {
  try {
    // console.log(`⚡ Real-time performance requested by: ${req.user.name}`);

    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);

    // Current active users (last 5 minutes activity)
    const currentUsers = await prisma.UserFlowTracking.count({
      where: {
        lastActivity: { gte: fiveMinutesAgo },
        isCompleted: false
      }
    });

    // Sessions started in last hour vs previous hour for trend
    const [currentHourSessions, previousHourSessions] = await Promise.all([
      prisma.UserFlowTracking.count({
        where: { startedAt: { gte: oneHourAgo } }
      }),
      prisma.UserFlowTracking.count({
        where: {
          startedAt: {
            gte: new Date(oneHourAgo.getTime() - 60 * 60 * 1000),
            lt: oneHourAgo
          }
        }
      })
    ]);

    // Recent completions and conversion rate
    const recentCompletions = await prisma.UserFlowTracking.count({
      where: {
        completedAt: { gte: oneHourAgo },
        isCompleted: true
      }
    });

    const conversionRate = currentHourSessions > 0 
      ? (recentCompletions / currentHourSessions) * 100 
      : 0;

    // Previous hour conversion for trend
    const previousHourCompletions = await prisma.UserFlowTracking.count({
      where: {
        completedAt: {
          gte: new Date(oneHourAgo.getTime() - 60 * 60 * 1000),
          lt: oneHourAgo
        },
        isCompleted: true
      }
    });

    const previousConversionRate = previousHourSessions > 0
      ? (previousHourCompletions / previousHourSessions) * 100
      : 0;

    // Find current top bottleneck (step with highest drop-off)
    const recentDropOffs = await prisma.UserFlowTracking.groupBy({
      by: ['dropOffStep'],
      where: {
        startedAt: { gte: oneHourAgo },
        dropOffStep: { not: null }
      },
      _count: { dropOffStep: true },
      orderBy: { _count: { dropOffStep: 'desc' } },
      take: 1
    });

    const topBottleneck = recentDropOffs.length > 0 
      ? recentDropOffs[0].dropOffStep 
      : null;

    // Recent error rate
    const recentErrors = await prisma.StepInteractionLogs.count({
      where: {
        timestamp: { gte: thirtyMinutesAgo },
        action: 'error'
      }
    });

    const totalRecentSteps = await prisma.StepInteractionLogs.count({
      where: { timestamp: { gte: thirtyMinutesAgo } }
    });

    const errorRate = totalRecentSteps > 0 
      ? (recentErrors / totalRecentSteps) * 100 
      : 0;

    // Calculate trends
    const sessionTrend = previousHourSessions > 0
      ? ((currentHourSessions - previousHourSessions) / previousHourSessions) * 100
      : 0;

    const conversionTrend = previousConversionRate > 0
      ? conversionRate - previousConversionRate
      : 0;

    // Average session duration for recent sessions
    const recentSessionsWithDuration = await prisma.UserFlowTracking.findMany({
      where: {
        startedAt: { gte: oneHourAgo },
        totalDuration: { not: null }
      },
      select: { totalDuration: true }
    });

    const averageSessionDuration = recentSessionsWithDuration.length > 0
      ? recentSessionsWithDuration.reduce((sum, s) => sum + s.totalDuration, 0) / recentSessionsWithDuration.length
      : 0;

    // Check for alerts (significant changes)
    const alerts = [];
    
    if (conversionTrend < -10) {
      alerts.push({
        type: 'critical',
        message: `Conversion rate dropped by ${Math.abs(conversionTrend).toFixed(1)}% in last hour`,
        timestamp: new Date(),
        metric: 'conversion_rate'
      });
    }
    
    if (errorRate > 5) {
      alerts.push({
        type: 'warning',
        message: `Error rate elevated at ${errorRate.toFixed(1)}%`,
        timestamp: new Date(),
        metric: 'error_rate'
      });
    }

    if (sessionTrend < -20) {
      alerts.push({
        type: 'warning',
        message: `Session starts down ${Math.abs(sessionTrend).toFixed(1)}% from previous hour`,
        timestamp: new Date(),
        metric: 'session_volume'
      });
    }

    const realTimeMetrics = {
      success: true,
      timestamp: new Date().toISOString(),
      currentUsers,
      sessionsThisHour: currentHourSessions,
      sessionsCompleted: recentCompletions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      topBottleneck,
      errorRate: Math.round(errorRate * 100) / 100,
      averageSessionDuration: Math.round(averageSessionDuration),
      trends: {
        sessions: sessionTrend > 0 ? `+${sessionTrend.toFixed(1)}%` : `${sessionTrend.toFixed(1)}%`,
        conversionRate: conversionTrend > 0 ? `+${conversionTrend.toFixed(1)}%` : `${conversionTrend.toFixed(1)}%`,
        errorRate: errorRate > 0 ? `${errorRate.toFixed(1)}%` : '0%'
      },
      alerts,
      dataFreshness: {
        lastUpdate: new Date().toISOString(),
        updateInterval: '5 minutes',
        dataRange: 'Last 1 hour'
      },
      meta: {
        requestedBy: req.user.name,
        userRole: req.user.role
      }
    };

    // console.log(`✅ Real-time performance data generated with ${alerts.length} alerts`);
    return res.status(200).json(realTimeMetrics);

  } catch (error) {
    // console.error("❌ Get real-time performance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get real-time performance metrics",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get advanced cohort analysis
 * GET /api/admin/tracking/cohort-analysis
 */
const getCohortAnalysis = async (req, res) => {
  try {
    const { 
      cohortType = 'weekly',
      startDate,
      endDate,
      metric = 'retention',
      periods = 8 
    } = req.query;

    // console.log(`📈 Cohort analysis requested: ${cohortType} ${metric} by ${req.user.name}`);

    // Determine date range
    let analysisStartDate, analysisEndDate;
    if (startDate && endDate) {
      analysisStartDate = new Date(startDate);
      analysisEndDate = new Date(endDate);
    } else {
      const now = new Date();
      const periodsBack = parseInt(periods) || 8;
      if (cohortType === 'weekly') {
        analysisStartDate = new Date(now.getTime() - (periodsBack * 7 * 24 * 60 * 60 * 1000));
      } else if (cohortType === 'monthly') {
        analysisStartDate = new Date(now.getTime() - (periodsBack * 30 * 24 * 60 * 60 * 1000));
      } else {
        analysisStartDate = new Date(now.getTime() - (periodsBack * 24 * 60 * 60 * 1000));
      }
      analysisEndDate = now;
    }

    // Build cohort periods
    const cohorts = [];
    let currentDate = new Date(analysisStartDate);
    
    while (currentDate < analysisEndDate) {
      let periodStart = new Date(currentDate);
      let periodEnd;
      let periodLabel;
      
      if (cohortType === 'weekly') {
        // Start of week (Monday)
        const dayOfWeek = currentDate.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        periodStart = new Date(currentDate.getTime() - (daysToMonday * 24 * 60 * 60 * 1000));
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart.getTime() + (7 * 24 * 60 * 60 * 1000));
        periodLabel = `Week of ${periodStart.toISOString().split('T')[0]}`;
        currentDate = new Date(periodEnd);
      } else if (cohortType === 'monthly') {
        periodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        periodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
        periodLabel = `${periodStart.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        currentDate = new Date(periodEnd);
      } else {
        // Daily
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart.getTime() + (24 * 60 * 60 * 1000));
        periodLabel = periodStart.toISOString().split('T')[0];
        currentDate = new Date(periodEnd);
      }
      
      if (periodStart >= analysisEndDate) break;

      // Get users who started in this period (cohort)
      const cohortUsers = await prisma.UserFlowTracking.findMany({
        where: {
          startedAt: {
            gte: periodStart,
            lt: periodEnd
          }
        },
        select: {
          phoneNumber: true,
          startedAt: true,
          isCompleted: true
        }
      });

      if (cohortUsers.length === 0) continue;

      const cohortSize = cohortUsers.length;
      const completedInCohort = cohortUsers.filter(u => u.isCompleted).length;
      const cohortConversionRate = (completedInCohort / cohortSize) * 100;

      // Calculate retention for subsequent periods
      const retentionRates = {};
      const phoneNumbers = cohortUsers.map(u => u.phoneNumber);
      
      for (let i = 1; i <= 8; i++) {
        let retentionPeriodStart, retentionPeriodEnd;
        
        if (cohortType === 'weekly') {
          retentionPeriodStart = new Date(periodStart.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
          retentionPeriodEnd = new Date(retentionPeriodStart.getTime() + (7 * 24 * 60 * 60 * 1000));
        } else if (cohortType === 'monthly') {
          retentionPeriodStart = new Date(periodStart.getFullYear(), periodStart.getMonth() + i, 1);
          retentionPeriodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + i + 1, 1);
        } else {
          retentionPeriodStart = new Date(periodStart.getTime() + (i * 24 * 60 * 60 * 1000));
          retentionPeriodEnd = new Date(retentionPeriodStart.getTime() + (24 * 60 * 60 * 1000));
        }
        
        if (retentionPeriodStart >= new Date()) break;
        
        // Count how many from this cohort returned in this period
        const returningUsers = await prisma.UserFlowTracking.count({
          where: {
            phoneNumber: { in: phoneNumbers },
            startedAt: {
              gte: retentionPeriodStart,
              lt: retentionPeriodEnd
            }
          }
        });
        
        const retentionRate = (returningUsers / cohortSize) * 100;
        retentionRates[`period${i}`] = Math.round(retentionRate * 100) / 100;
      }

      cohorts.push({
        cohortPeriod: periodLabel,
        cohortStart: periodStart,
        cohortSize,
        initialConversionRate: Math.round(cohortConversionRate * 100) / 100,
        retentionRates
      });
    }

    // Generate insights
    const insights = [];
    if (cohorts.length > 0) {
      // Average retention by period
      const avgRetentionByPeriod = {};
      for (let i = 1; i <= 8; i++) {
        const periodKey = `period${i}`;
        const validCohorts = cohorts.filter(c => c.retentionRates[periodKey] !== undefined);
        if (validCohorts.length > 0) {
          const avgRetention = validCohorts.reduce((sum, c) => sum + c.retentionRates[periodKey], 0) / validCohorts.length;
          avgRetentionByPeriod[periodKey] = Math.round(avgRetention * 100) / 100;
        }
      }
      
      // Best and worst performing cohorts
      const bestCohort = cohorts.reduce((best, current) => 
        current.initialConversionRate > best.initialConversionRate ? current : best
      );
      const worstCohort = cohorts.reduce((worst, current) => 
        current.initialConversionRate < worst.initialConversionRate ? current : worst
      );
      
      insights.push(`Best performing cohort: ${bestCohort.cohortPeriod} (${bestCohort.initialConversionRate}% conversion)`);
      insights.push(`Lowest performing cohort: ${worstCohort.cohortPeriod} (${worstCohort.initialConversionRate}% conversion)`);
      
      // Retention trends
      if (avgRetentionByPeriod.period1 && avgRetentionByPeriod.period4) {
        const retentionTrend = avgRetentionByPeriod.period4 > avgRetentionByPeriod.period1 ? 'improving' : 'declining';
        insights.push(`Retention trend is ${retentionTrend} over time`);
      }
      
      // Overall metrics
      const avgCohortSize = cohorts.reduce((sum, c) => sum + c.cohortSize, 0) / cohorts.length;
      const avgConversionRate = cohorts.reduce((sum, c) => sum + c.initialConversionRate, 0) / cohorts.length;
      insights.push(`Average cohort size: ${Math.round(avgCohortSize)} users`);
      insights.push(`Average conversion rate: ${Math.round(avgConversionRate * 100) / 100}%`);
    }

    const response = {
      success: true,
      cohortType,
      metric,
      dateRange: {
        start: analysisStartDate.toISOString(),
        end: analysisEndDate.toISOString()
      },
      totalCohorts: cohorts.length,
      cohorts,
      insights,
      meta: {
        generatedAt: new Date().toISOString(),
        generatedBy: req.user.name,
        userRole: req.user.role,
        analysisType: 'cohort_retention'
      }
    };

    // console.log(`✅ Cohort analysis completed: ${cohorts.length} cohorts analyzed`);
    return res.status(200).json(response);

  } catch (error) {
    // console.error("❌ Get cohort analysis error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate cohort analysis",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get smart alerts and anomaly detection
 * GET /api/admin/tracking/alerts/smart
 */
const getSmartAlerts = async (req, res) => {
  try {
    const { 
      timeframe = '24h',
      severity = 'all',
      includeResolved = 'false' 
    } = req.query;

    // console.log(`🚨 Smart alerts requested for ${timeframe} by ${req.user.name}`);

    const now = new Date();
    let comparisonStart, currentStart;
    
    // Define time ranges for comparison
    if (timeframe === '1h') {
      currentStart = new Date(now.getTime() - 60 * 60 * 1000);
      comparisonStart = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    } else if (timeframe === '24h') {
      currentStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      comparisonStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '7d') {
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      comparisonStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    } else {
      currentStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      comparisonStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    }

    const alerts = [];

    // 1. Conversion Rate Anomaly Detection
    const [currentSessions, comparisonSessions] = await Promise.all([
      prisma.UserFlowTracking.findMany({
        where: { startedAt: { gte: currentStart } },
        select: { isCompleted: true }
      }),
      prisma.UserFlowTracking.findMany({
        where: { 
          startedAt: { gte: comparisonStart, lt: currentStart }
        },
        select: { isCompleted: true }
      })
    ]);

    const currentConversionRate = currentSessions.length > 0 
      ? (currentSessions.filter(s => s.isCompleted).length / currentSessions.length) * 100 
      : 0;
    
    const comparisonConversionRate = comparisonSessions.length > 0 
      ? (comparisonSessions.filter(s => s.isCompleted).length / comparisonSessions.length) * 100 
      : 0;

    const conversionDrop = comparisonConversionRate - currentConversionRate;
    if (conversionDrop > 15) {
      alerts.push({
        id: `conversion_drop_${Date.now()}`,
        type: 'critical',
        category: 'conversion',
        title: 'Significant Conversion Rate Drop',
        message: `Conversion rate dropped by ${conversionDrop.toFixed(1)}% (${comparisonConversionRate.toFixed(1)}% → ${currentConversionRate.toFixed(1)}%)`,
        impact: 'high',
        detectedAt: new Date(),
        metrics: {
          current: currentConversionRate,
          previous: comparisonConversionRate,
          change: -conversionDrop
        },
        recommendations: [
          'Check for recent changes in user flow',
          'Review error logs for technical issues',
          'Verify payment gateway functionality'
        ]
      });
    } else if (conversionDrop > 5) {
      alerts.push({
        id: `conversion_warning_${Date.now()}`,
        type: 'warning',
        category: 'conversion',
        title: 'Conversion Rate Decline',
        message: `Conversion rate declined by ${conversionDrop.toFixed(1)}%`,
        impact: 'medium',
        detectedAt: new Date(),
        metrics: {
          current: currentConversionRate,
          previous: comparisonConversionRate,
          change: -conversionDrop
        },
        recommendations: ['Monitor closely', 'Review recent user feedback']
      });
    }

    // 2. Error Rate Anomaly
    const [currentErrors, currentSteps] = await Promise.all([
      prisma.StepInteractionLogs.count({
        where: {
          timestamp: { gte: currentStart },
          action: 'error'
        }
      }),
      prisma.StepInteractionLogs.count({
        where: { timestamp: { gte: currentStart } }
      })
    ]);

    const currentErrorRate = currentSteps > 0 ? (currentErrors / currentSteps) * 100 : 0;
    
    if (currentErrorRate > 10) {
      alerts.push({
        id: `high_error_rate_${Date.now()}`,
        type: 'critical',
        category: 'errors',
        title: 'High Error Rate Detected',
        message: `Error rate is ${currentErrorRate.toFixed(1)}%, significantly above normal`,
        impact: 'high',
        detectedAt: new Date(),
        metrics: {
          errorRate: currentErrorRate,
          totalErrors: currentErrors,
          totalSteps: currentSteps
        },
        recommendations: [
          'Review error logs immediately',
          'Check system dependencies',
          'Consider temporary rollback if recent deployment'
        ]
      });
    } else if (currentErrorRate > 5) {
      alerts.push({
        id: `elevated_errors_${Date.now()}`,
        type: 'warning',
        category: 'errors',
        title: 'Elevated Error Rate',
        message: `Error rate is ${currentErrorRate.toFixed(1)}%, above normal threshold`,
        impact: 'medium',
        detectedAt: new Date(),
        metrics: { errorRate: currentErrorRate },
        recommendations: ['Monitor error patterns', 'Review recent changes']
      });
    }

    // 3. Traffic Volume Anomaly
    const trafficDrop = ((comparisonSessions.length - currentSessions.length) / Math.max(comparisonSessions.length, 1)) * 100;
    
    if (trafficDrop > 30) {
      alerts.push({
        id: `traffic_drop_${Date.now()}`,
        type: 'warning',
        category: 'traffic',
        title: 'Significant Traffic Drop',
        message: `Session volume dropped by ${trafficDrop.toFixed(1)}%`,
        impact: 'medium',
        detectedAt: new Date(),
        metrics: {
          current: currentSessions.length,
          previous: comparisonSessions.length,
          change: -trafficDrop
        },
        recommendations: [
          'Check marketing campaigns',
          'Verify site accessibility',
          'Review search rankings'
        ]
      });
    }

    // 4. Specific Step Performance Issues
    const stepProblems = await prisma.StepInteractionLogs.groupBy({
      by: ['stepName'],
      where: {
        timestamp: { gte: currentStart },
        action: 'error'
      },
      _count: { stepName: true },
      having: {
        stepName: { _count: { gt: 5 } }
      },
      orderBy: { _count: { stepName: 'desc' } },
      take: 3
    });

    stepProblems.forEach((step, index) => {
      alerts.push({
        id: `step_problem_${step.stepName}_${Date.now()}`,
        type: 'warning',
        category: 'step_performance',
        title: `Issues with ${step.stepName} Step`,
        message: `${step._count.stepName} errors detected in ${step.stepName} step`,
        impact: 'medium',
        detectedAt: new Date(),
        metrics: {
          stepName: step.stepName,
          errorCount: step._count.stepName
        },
        recommendations: [
          `Review ${step.stepName} step implementation`,
          'Check user experience flow',
          'Analyze user feedback for this step'
        ]
      });
    });

    // 5. Session Duration Anomalies
    const recentSessionsWithDuration = await prisma.UserFlowTracking.findMany({
      where: {
        startedAt: { gte: currentStart },
        totalDuration: { not: null }
      },
      select: { totalDuration: true }
    });

    if (recentSessionsWithDuration.length > 0) {
      const avgDuration = recentSessionsWithDuration.reduce((sum, s) => sum + s.totalDuration, 0) / recentSessionsWithDuration.length;
      
      if (avgDuration > 600) { // More than 10 minutes
        alerts.push({
          id: `long_duration_${Date.now()}`,
          type: 'info',
          category: 'performance',
          title: 'Longer Session Durations',
          message: `Average session duration is ${Math.round(avgDuration / 60)} minutes, longer than usual`,
          impact: 'low',
          detectedAt: new Date(),
          metrics: { averageDuration: avgDuration },
          recommendations: [
            'Review user flow complexity',
            'Consider UX improvements',
            'Check if users are getting stuck'
          ]
        });
      }
    }

    // Filter alerts by severity if requested
    let filteredAlerts = alerts;
    if (severity !== 'all') {
      filteredAlerts = alerts.filter(alert => alert.type === severity);
    }

    // Sort by impact and detected time
    filteredAlerts.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      if (impactOrder[a.impact] !== impactOrder[b.impact]) {
        return impactOrder[b.impact] - impactOrder[a.impact];
      }
      return new Date(b.detectedAt) - new Date(a.detectedAt);
    });

    const response = {
      success: true,
      alertsSummary: {
        total: filteredAlerts.length,
        critical: filteredAlerts.filter(a => a.type === 'critical').length,
        warning: filteredAlerts.filter(a => a.type === 'warning').length,
        info: filteredAlerts.filter(a => a.type === 'info').length
      },
      alerts: filteredAlerts,
      systemHealth: {
        conversionRate: currentConversionRate,
        errorRate: currentErrorRate,
        sessionVolume: currentSessions.length,
        status: filteredAlerts.filter(a => a.type === 'critical').length > 0 ? 'critical' :
                filteredAlerts.filter(a => a.type === 'warning').length > 0 ? 'warning' : 'healthy'
      },
      meta: {
        timeframe,
        comparisonPeriod: `${currentStart.toISOString()} to ${now.toISOString()}`,
        generatedAt: new Date().toISOString(),
        generatedBy: req.user.name,
        nextUpdate: new Date(now.getTime() + 5 * 60 * 1000).toISOString() // Next update in 5 mins
      }
    };

    // console.log(`✅ Smart alerts generated: ${filteredAlerts.length} alerts found`);
    return res.status(200).json(response);

  } catch (error) {
    // console.error("❌ Get smart alerts error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate smart alerts",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

/**
 * Get user segment performance analysis
 * GET /api/admin/tracking/segments/performance
 */
const getUserSegmentPerformance = async (req, res) => {
  try {
    const {
      segmentType = 'user_type', // user_type, device, browser, geography
      timeRange = '7d',
      startDate,
      endDate
    } = req.query;

    // console.log(`📊 User segment performance requested: ${segmentType} for ${timeRange} by ${req.user.name}`);

    // Determine date range
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        startedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    } else {
      const days = parseInt(timeRange.replace('d', '')) || 7;
      const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      dateFilter = {
        startedAt: { gte: fromDate }
      };
    }

    let segmentAnalysis = {};

    if (segmentType === 'user_type') {
      // New vs Returning Users Analysis
      const userTypeAnalysis = await prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN user_sessions.session_count = 1 THEN 'new'
            ELSE 'returning'
          END as segment,
          COUNT(u.id) as total_sessions,
          SUM(CASE WHEN u."isCompleted" = true THEN 1 ELSE 0 END) as completed_sessions,
          AVG(u."totalDuration") as avg_session_duration,
          AVG(u."completionRate") as avg_completion_rate
        FROM "UserFlowTracking" u
        JOIN (
          SELECT "phoneNumber", COUNT(*) as session_count
          FROM "UserFlowTracking"
          WHERE "startedAt" >= ${dateFilter.startedAt.gte}
          GROUP BY "phoneNumber"
        ) user_sessions ON u."phoneNumber" = user_sessions."phoneNumber"
        WHERE u."startedAt" >= ${dateFilter.startedAt.gte}
        GROUP BY segment
      `;

      segmentAnalysis = {
        new: { total: 0, completed: 0, conversionRate: 0, avgDuration: 0 },
        returning: { total: 0, completed: 0, conversionRate: 0, avgDuration: 0 }
      };

      userTypeAnalysis.forEach(segment => {
        const total = parseInt(segment.total_sessions);
        const completed = parseInt(segment.completed_sessions);
        const avgDuration = parseFloat(segment.avg_session_duration) || 0;
        
        segmentAnalysis[segment.segment] = {
          total,
          completed,
          conversionRate: total > 0 ? (completed / total) * 100 : 0,
          avgDuration: Math.round(avgDuration),
          avgCompletionRate: parseFloat(segment.avg_completion_rate) || 0
        };
      });
    }
    
    else if (segmentType === 'device') {
      // Device Type Analysis
      const sessions = await prisma.UserFlowTracking.findMany({
        where: dateFilter,
        select: {
          deviceInfo: true,
          isCompleted: true,
          totalDuration: true,
          completionRate: true
        }
      });

      const deviceGroups = {};
      sessions.forEach(session => {
        const device = session.deviceInfo?.device || 'Unknown';
        if (!deviceGroups[device]) {
          deviceGroups[device] = [];
        }
        deviceGroups[device].push(session);
      });

      segmentAnalysis = {};
      Object.keys(deviceGroups).forEach(device => {
        const deviceSessions = deviceGroups[device];
        const completed = deviceSessions.filter(s => s.isCompleted).length;
        const avgDuration = deviceSessions.filter(s => s.totalDuration)
          .reduce((sum, s) => sum + s.totalDuration, 0) / Math.max(deviceSessions.filter(s => s.totalDuration).length, 1);
        
        segmentAnalysis[device] = {
          total: deviceSessions.length,
          completed,
          conversionRate: (completed / deviceSessions.length) * 100,
          avgDuration: Math.round(avgDuration || 0),
          marketShare: (deviceSessions.length / sessions.length) * 100
        };
      });
    }
    
    else if (segmentType === 'browser') {
      // Browser Type Analysis
      const sessions = await prisma.UserFlowTracking.findMany({
        where: dateFilter,
        select: {
          deviceInfo: true,
          isCompleted: true,
          totalDuration: true
        }
      });

      const browserGroups = {};
      sessions.forEach(session => {
        const browser = session.deviceInfo?.browser || 'Unknown';
        if (!browserGroups[browser]) {
          browserGroups[browser] = [];
        }
        browserGroups[browser].push(session);
      });

      segmentAnalysis = {};
      Object.keys(browserGroups).forEach(browser => {
        const browserSessions = browserGroups[browser];
        const completed = browserSessions.filter(s => s.isCompleted).length;
        
        segmentAnalysis[browser] = {
          total: browserSessions.length,
          completed,
          conversionRate: (completed / browserSessions.length) * 100,
          marketShare: (browserSessions.length / sessions.length) * 100
        };
      });
    }
    
    else if (segmentType === 'time_of_day') {
      // Time of Day Analysis
      const sessions = await prisma.UserFlowTracking.findMany({
        where: dateFilter,
        select: {
          startedAt: true,
          isCompleted: true,
          totalDuration: true
        }
      });

      const timeGroups = {
        'Morning (6-12)': [],
        'Afternoon (12-18)': [],
        'Evening (18-24)': [],
        'Night (0-6)': []
      };

      sessions.forEach(session => {
        const hour = session.startedAt.getHours();
        if (hour >= 6 && hour < 12) {
          timeGroups['Morning (6-12)'].push(session);
        } else if (hour >= 12 && hour < 18) {
          timeGroups['Afternoon (12-18)'].push(session);
        } else if (hour >= 18) {
          timeGroups['Evening (18-24)'].push(session);
        } else {
          timeGroups['Night (0-6)'].push(session);
        }
      });

      segmentAnalysis = {};
      Object.keys(timeGroups).forEach(timeSlot => {
        const timeSessions = timeGroups[timeSlot];
        const completed = timeSessions.filter(s => s.isCompleted).length;
        const avgDuration = timeSessions.filter(s => s.totalDuration)
          .reduce((sum, s) => sum + s.totalDuration, 0) / Math.max(timeSessions.filter(s => s.totalDuration).length, 1);
        
        segmentAnalysis[timeSlot] = {
          total: timeSessions.length,
          completed,
          conversionRate: timeSessions.length > 0 ? (completed / timeSessions.length) * 100 : 0,
          avgDuration: Math.round(avgDuration || 0),
          trafficShare: timeSessions.length > 0 ? (timeSessions.length / sessions.length) * 100 : 0
        };
      });
    }

    // Generate insights based on segment analysis
    const insights = [];
    const segments = Object.keys(segmentAnalysis);
    
    if (segments.length > 0) {
      // Best performing segment
      const bestSegment = segments.reduce((best, current) => 
        segmentAnalysis[current].conversionRate > segmentAnalysis[best].conversionRate ? current : best
      );
      
      const worstSegment = segments.reduce((worst, current) => 
        segmentAnalysis[current].conversionRate < segmentAnalysis[worst].conversionRate ? current : worst
      );
      
      insights.push(`Best performing segment: ${bestSegment} (${segmentAnalysis[bestSegment].conversionRate.toFixed(1)}% conversion)`);
      insights.push(`Lowest performing segment: ${worstSegment} (${segmentAnalysis[worstSegment].conversionRate.toFixed(1)}% conversion)`);
      
      // Volume insights
      const highestVolume = segments.reduce((highest, current) => 
        segmentAnalysis[current].total > segmentAnalysis[highest].total ? current : highest
      );
      
      insights.push(`Highest volume segment: ${highestVolume} (${segmentAnalysis[highestVolume].total} sessions)`);
      
      // Performance gap
      const performanceGap = segmentAnalysis[bestSegment].conversionRate - segmentAnalysis[worstSegment].conversionRate;
      if (performanceGap > 20) {
        insights.push(`Large performance gap detected: ${performanceGap.toFixed(1)}% difference between best and worst segments`);
      }
      
      // Segment-specific recommendations
      if (segmentType === 'user_type' && segmentAnalysis.new && segmentAnalysis.returning) {
        if (segmentAnalysis.new.conversionRate > segmentAnalysis.returning.conversionRate) {
          insights.push('New users are converting better than returning users - consider retention strategies');
        } else {
          insights.push('Returning users show better conversion - focus on user acquisition quality');
        }
      }
    }

    const response = {
      success: true,
      segmentType,
      timeRange: startDate && endDate ? `${startDate} to ${endDate}` : timeRange,
      totalSegments: segments.length,
      segmentAnalysis,
      insights,
      recommendations: {
        optimization: 'Focus marketing efforts on best-performing segments',
        improvement: `Investigate and improve ${segments.length > 0 ? segments.reduce((worst, current) => 
          segmentAnalysis[current].conversionRate < segmentAnalysis[worst].conversionRate ? current : worst) : 'N/A'} segment performance`,
        growth: 'Scale successful patterns from high-converting segments'
      },
      meta: {
        generatedAt: new Date().toISOString(),
        generatedBy: req.user.name,
        userRole: req.user.role,
        analysisType: 'segment_performance'
      }
    };

    // console.log(`✅ User segment analysis completed: ${segments.length} segments analyzed`);
    return res.status(200).json(response);

  } catch (error) {
    // console.error("❌ Get user segment performance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate segment performance analysis",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

module.exports = {
  getAdminDashboardAnalytics,
  getAdminAllSessions,
  getAdminSessionDetails,
  getRealTimePerformance,
  getCohortAnalysis,
  getSmartAlerts,
  getUserSegmentPerformance
};


const express = require('express');
const router = express.Router();
const { validateRequest } = require('../../middleware/validateRequest');
const { userVerifyToken } = require('../../middleware/verify');
const { requireRole, requirePermission } = require('../../middleware/rbac.middleware');
const {
  analyticsQueryValidation
} = require('../../validations/tracking.validation');

const {
  getAdminDashboardAnalytics,
  getAdminAllSessions,
  getAdminSessionDetails,
  getRealTimePerformance,
  getCohortAnalysis,
  getSmartAlerts,
  getUserSegmentPerformance,
} = require('../../controllers/admin/tracking.controller');

// Note: getFunnelAnalytics needs to be implemented in admin controller if needed

const analyticsService = require('../../services/analyticsService');

// ===============================================
// ADMIN ANALYTICS ROUTES
// ===============================================

/**
 * @route   GET /api/admin/tracking/realtime/performance
 * @desc    Get real-time performance metrics
 * @access  Admin/Manager with analytics permission
 */
router.get('/realtime/performance',
  userVerifyToken,
  requirePermission('analytics', 'read'),
  getRealTimePerformance
);

/**
 * @route   GET /api/admin/tracking/cohort-analysis
 * @desc    Get advanced cohort analysis
 * @access  Admin/Manager with analytics permission
 */
router.get('/cohort-analysis',
  userVerifyToken,
  requirePermission('analytics', 'read'),
  getCohortAnalysis
);

/**
 * @route   GET /api/admin/tracking/alerts/smart
 * @desc    Get smart alerts and anomaly detection
 * @access  Admin/Manager with analytics permission
 */
router.get('/alerts/smart',
  userVerifyToken,
  requirePermission('analytics', 'read'),
  getSmartAlerts
);

/**
 * @route   GET /api/admin/tracking/segments/performance
 * @desc    Get user segment performance analysis
 * @access  Admin/Manager with analytics permission
 */
router.get('/segments/performance',
  userVerifyToken,
  requirePermission('analytics', 'read'),
  getUserSegmentPerformance
);

/**
 * @route   GET /api/admin/tracking/dashboard
 * @desc    Get comprehensive dashboard analytics for admin
 * @access  Admin/Manager with analytics permission
 */
router.get('/dashboard', 
  userVerifyToken,
  requirePermission('analytics', 'read'),
  getAdminDashboardAnalytics
);

/**
 * @route   GET /api/admin/tracking/funnel
 * @desc    Get detailed conversion funnel analytics
 * @access  Admin/Manager with analytics permission
 * @query   dateRange=7d, stepName=all, startDate?, endDate?
 * @note    TEMPORARILY DISABLED - needs to be implemented in admin controller
 */
// router.get('/funnel',
//   userVerifyToken,
//   requirePermission('analytics', 'read'),
//   validateRequest(analyticsQueryValidation, 'query'),
//   getFunnelAnalytics  // This function was moved/removed
// );

/**
 * @route   GET /api/admin/tracking/funnel-optimized
 * @desc    Get optimized funnel analytics (high performance)
 * @access  Admin/Manager with analytics permission
 */
router.get('/funnel-optimized',
  userVerifyToken,
  requirePermission('analytics', 'read'),
  validateRequest(analyticsQueryValidation, 'query'),
  async (req, res) => {
    try {
      const { dateRange, startDate, endDate } = req.query;
      const analytics = await analyticsService.getOptimizedFunnelAnalytics(
        dateRange, startDate, endDate
      );
      return res.status(200).json({
        ...analytics,
        meta: {
          requestedBy: req.user.name,
          requestedAt: new Date().toISOString(),
          userRole: req.user.role
        }
      });
    } catch (error) {
      // console.error('❌ Admin optimized funnel analytics error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate optimized analytics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   GET /api/admin/tracking/trends
 * @desc    Get trending analysis with historical comparisons
 * @access  Admin/Manager with analytics permission
 * @query   period=daily&periods=7
 */
router.get('/trends',
  userVerifyToken,
  requirePermission('analytics', 'read'),
  async (req, res) => {
    try {
      const { period = 'daily', periods = 7 } = req.query;
      const trends = await analyticsService.getTrendingAnalysis(period, parseInt(periods));
      
      return res.status(200).json({
        ...trends,
        meta: {
          generatedBy: req.user.name,
          generatedAt: new Date().toISOString(),
          period: period,
          periodsAnalyzed: parseInt(periods)
        }
      });
    } catch (error) {
      // console.error('❌ Admin trending analysis error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate trending analysis',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

// ===============================================
// ADMIN SESSION MANAGEMENT
// ===============================================

/**
 * @route   GET /api/admin/tracking/sessions
 * @desc    Get all tracking sessions with admin filters
 * @access  Admin/Manager with user data access
 * @query   limit=100, offset=0, status=all, dateRange=30d, phoneNumber?, includeSteps=true
 */
router.get('/sessions',
  userVerifyToken,
  requirePermission('user', 'read'), // Can view user sessions
  getAdminAllSessions
);

/**
 * @route   GET /api/admin/tracking/session/:sessionId
 * @desc    Get detailed session information
 * @access  Admin/Manager with user data access
 * @param   sessionId - UUID of the session
 */
router.get('/session/:sessionId',
  userVerifyToken,
  requirePermission('user', 'read'),
  getAdminSessionDetails
);

// ===============================================
// ADMIN SYSTEM MANAGEMENT
// ===============================================

/**
 * @route   POST /api/admin/tracking/calculate-stats
 * @desc    Manually trigger daily stats calculation
 * @access  Admin only - system management
 */
router.post('/calculate-stats',
  userVerifyToken,
  requireRole(['ADMIN']), // Only ADMIN can trigger system operations
  async (req, res) => {
    try {
      const { date } = req.body;
      const targetDate = date ? new Date(date) : null;
      
      // console.log(`📊 Daily stats calculation triggered by ADMIN: ${req.user.name}`);
      
      const result = await analyticsService.calculateDailyFunnelStats(targetDate);
      
      return res.status(200).json({
        success: true,
        message: 'Daily stats calculated successfully',
        data: result,
        meta: {
          triggeredBy: req.user.name,
          triggeredAt: new Date().toISOString(),
          targetDate: targetDate?.toISOString() || 'today'
        }
      });
    } catch (error) {
      // console.error('❌ Admin calculate daily stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate daily stats',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

/**
 * @route   GET /api/admin/tracking/health
 * @desc    Get tracking service health status
 * @access  Admin/Manager - system monitoring
 */
router.get('/health',
  userVerifyToken,
  requirePermission('system', 'view'),
  async (req, res) => {
    try {
      // Enhanced health check for admin
      const healthStatus = {
        success: true,
        message: "Tracking service is healthy",
        timestamp: new Date().toISOString(),
        service: "User Flow Tracking API",
        version: "v1.0",
        checkedBy: req.user.name,
        userRole: req.user.role,
        systemInfo: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          nodeVersion: process.version
        }
      };

      // Add database connectivity check
      const { prisma } = require('../../config/db');
      const dbCheck = await prisma.userFlowTracking.count();
      healthStatus.database = {
        connected: true,
        totalSessions: dbCheck
      };

      return res.status(200).json(healthStatus);
    } catch (error) {
      // console.error('❌ Admin health check error:', error);
      return res.status(503).json({
        success: false,
        message: "Tracking service health check failed",
        error: process.env.NODE_ENV === 'development' ? error.message : 'Service unavailable',
        checkedBy: req.user?.name || 'unknown',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * @route   GET /api/admin/tracking/stats-summary
 * @desc    Get high-level statistics summary for admin dashboard
 * @access  Admin/Manager with analytics permission
 */
router.get('/stats-summary',
  userVerifyToken,
  requirePermission('analytics', 'read'),
  async (req, res) => {
    try {
      const { period = '7d' } = req.query;
      
      // Get summary statistics
      const summary = await analyticsService.getStatsSummary(period);
      
      return res.status(200).json({
        success: true,
        data: summary,
        meta: {
          period,
          generatedBy: req.user.name,
          generatedAt: new Date().toISOString(),
          userRole: req.user.role
        }
      });
    } catch (error) {
      // console.error('❌ Admin stats summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate stats summary',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router;