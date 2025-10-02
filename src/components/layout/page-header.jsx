'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

/**
 * Consistent page header for management pages (View/Edit/Create)
 * Matches the listing page header design
 */
export function PageHeader({ 
  title, 
  description, 
  backUrl,
  actions 
}) {
  const router = useRouter();

  return (
    <>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {backUrl && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push(backUrl)}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1">{description}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <Separator />
    </>
  );
}
