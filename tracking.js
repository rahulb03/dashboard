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
    console.log(`📊 Admin dashboard analytics requested by: ${req.user.name}`);

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
      meta: {
        generatedAt: new Date().toISOString(),
        generatedBy: req.user.name,
        userRole: req.user.role,
        dataRetentionNote: "Phone numbers are masked for privacy"
      }
    };

    console.log(`✅ Admin dashboard generated successfully`);
    return res.status(200).json(dashboard);

  } catch (error) {
    console.error("❌ Get admin dashboard analytics error:", error);
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
    console.log(`📋 Admin sessions request by: ${req.user.name}`);
    
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

    console.log(`✅ Admin retrieved ${sessions.length}/${totalCount} sessions`);
    return res.status(200).json(response);

  } catch (error) {
    console.error("❌ Get admin all sessions error:", error);
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
    
    console.log(`🔍 Admin getting session details for: ${sessionId} by ${req.user.name}`);

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
    console.error("❌ Get admin session details error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get session details",
      error: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
};

module.exports = {
  getAdminDashboardAnalytics,
  getAdminAllSessions,
  getAdminSessionDetails
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
  getAdminSessionDetails
} = require('../../controllers/admin/tracking.controller');

// Note: getFunnelAnalytics needs to be implemented in admin controller if needed

const analyticsService = require('./src/services/analyticsService');

// ===============================================
// ADMIN ANALYTICS ROUTES
// ===============================================

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
      console.error('❌ Admin optimized funnel analytics error:', error);
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
      console.error('❌ Admin trending analysis error:', error);
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
      
      console.log(`📊 Daily stats calculation triggered by ADMIN: ${req.user.name}`);
      
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
      console.error('❌ Admin calculate daily stats error:', error);
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
      console.error('❌ Admin health check error:', error);
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
      console.error('❌ Admin stats summary error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate stats summary',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
);

module.exports = router; 


