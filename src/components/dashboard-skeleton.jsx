import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Skeleton for dashboard stat cards
export function DashboardCardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <div className="absolute top-4 right-4">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </CardHeader>
      <div className="px-6 pb-6 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
    </Card>
  );
}
