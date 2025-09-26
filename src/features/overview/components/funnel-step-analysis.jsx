'use client';

import * as React from 'react';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Minimal Step Analysis Component
function StepAnalysisSection({ steps }) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const stepsPerPage = 8;
  const totalPages = Math.ceil(steps.length / stepsPerPage);
  
  const currentSteps = steps.slice(
    currentPage * stepsPerPage, 
    (currentPage + 1) * stepsPerPage
  );
  
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };
  
  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };
  
  return (
    <div className="space-y-4">
      {/* Header with Pagination */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">Quick Funnel Overview</h4>
            <a 
              href="/dashboard/tracking/sessions" 
              className="text-xs text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Detailed Analysis →
            </a>
          </div>
          <p className="text-xs text-muted-foreground">{steps.length} steps • Conversion & drop-off rates</p>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={totalPages <= 1}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[40px] text-center">
              {currentPage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={totalPages <= 1}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
      
      {/* Compact Step List */}
      <div className="space-y-1">
        {currentSteps.map((step, index) => {
          const globalIndex = currentPage * stepsPerPage + index;
          const performanceIndicator = 
            step.performance === 'excellent' ? '✓' :
            step.performance === 'good' ? '•' :
            step.performance === 'average' ? '▲' : '⚠';
          
          return (
            <div key={step.stepName} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/30 transition-colors border-b border-muted/50 last:border-b-0">
              {/* Step Info */}
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-mono text-muted-foreground min-w-[24px]">
                  #{globalIndex + 1}
                </span>
                <span className="text-sm font-medium text-foreground truncate">
                  {step.displayName}
                </span>
              </div>
              
              {/* Metrics */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <span>{performanceIndicator}</span>
                  <span className="font-semibold text-foreground">
                    {step.conversionRate?.toFixed(1)}%
                  </span>
                </div>
                <div className="text-muted-foreground min-w-[32px] text-right">
                  -{parseFloat(step.dropoffRate || 0).toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FunnelStepAnalysis() {
  const { enhancedFunnel, enhancedFunnelLoading } = useSelector((state) => state.tracking);
  
  // Get funnel steps analysis
  const funnelStepsAnalysis = React.useMemo(() => {
    if (!enhancedFunnel?.data?.funnel) return [];
    
    const funnelSteps = enhancedFunnel.data.funnel || [];
    
    return funnelSteps.map((step, index) => {
      const stepName = step.stepName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      return {
        ...step,
        displayName: stepName,
        dropoffRate: step.totalEntries > 0 ? ((step.totalEntries - step.totalCompletions) / step.totalEntries * 100).toFixed(1) : '0',
        performance: step.conversionRate >= 90 ? 'excellent' : 
                    step.conversionRate >= 80 ? 'good' : 
                    step.conversionRate >= 60 ? 'average' : 'needs attention',
        errorRateLevel: step.errorRate > 5 ? 'high' : step.errorRate > 2 ? 'medium' : 'low'
      };
    });
  }, [enhancedFunnel]);
  
  if (enhancedFunnelLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funnel Step Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 px-2 animate-pulse">
                <div className="flex items-center gap-2 flex-1">
                  <div className="h-3 w-6 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-3 w-8 bg-muted rounded" />
                  <div className="h-3 w-8 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (funnelStepsAnalysis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funnel Step Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No funnel data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funnel Step Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <StepAnalysisSection steps={funnelStepsAnalysis} />
      </CardContent>
    </Card>
  );
}