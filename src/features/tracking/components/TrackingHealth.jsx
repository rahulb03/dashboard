'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  AlertTriangle,
  Database,
  Server,
  Clock
} from 'lucide-react';
import { fetchHealthThunk } from '@/redux/tracking/trackingThunks';
import { clearError } from '@/redux/tracking/trackingSlice';

export default function TrackingHealth() {
  const dispatch = useDispatch();
  const {
    health,
    healthLoading,
    healthError
  } = useSelector((state) => state.tracking);

  useEffect(() => {
    // Fetch health status on mount
    dispatch(fetchHealthThunk({ forceRefresh: false }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchHealthThunk({ forceRefresh: true }));
  };

  const clearErrorHandler = () => {
    dispatch(clearError());
  };

  const formatUptime = (uptimeSeconds) => {
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes) => {
    const mb = (bytes / 1024 / 1024).toFixed(2);
    return `${mb} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={healthLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {healthError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading health status: {healthError}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearErrorHandler}
              className="ml-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {healthLoading && !health && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Health Status */}
      {health && (
        <div className="space-y-6">
          {/* Service Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {health.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Service Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={health.success ? "default" : "destructive"}>
                      {health.success ? "Healthy" : "Unhealthy"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Service</span>
                    <span className="text-sm font-medium">{health.service}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Version</span>
                    <span className="text-sm font-medium">{health.version}</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Checked By</span>
                    <span className="text-sm font-medium">{health.checkedBy}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <span className="text-sm font-medium">{health.userRole}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Checked At</span>
                    <span className="text-sm font-medium">
                      {new Date(health.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          {health.systemInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Uptime</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatUptime(health.systemInfo.uptime)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Memory Usage</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      RSS: {formatMemory(health.systemInfo.memory.rss)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Heap: {formatMemory(health.systemInfo.memory.heapUsed)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Node.js Version</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {health.systemInfo.nodeVersion}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Database Status */}
          {health.database && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Connection</span>
                      <Badge variant={health.database.connected ? "default" : "destructive"}>
                        {health.database.connected ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Total Sessions</span>
                      <span className="text-sm font-medium">
                        {health.database.totalSessions?.toLocaleString() || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                <span>{health.message}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}