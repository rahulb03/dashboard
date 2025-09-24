import React from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';

export default function LoanApplicationSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header with Back and Edit buttons */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" disabled className="flex items-center space-x-2">
          <div className="h-4 w-4" />
          <span>Back to Applications</span>
        </Button>
        <Button disabled className="flex items-center space-x-2">
          <div className="h-4 w-4" />
          <span>Edit Application</span>
        </Button>
      </div>
      
      <Card className="mx-auto w-full">
        <CardHeader>
          <Skeleton className="h-8 w-64" /> {/* Title */}
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Personal Information Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" /> {/* Section title */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-24" /> {/* Label */}
                  <Skeleton className="h-10 w-full" /> {/* Input */}
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" /> {/* Address label */}
              <Skeleton className="h-20 w-full" /> {/* Address textarea */}
            </div>
          </div>

          {/* Documentation Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" /> {/* Section title */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-32" /> {/* Label */}
                  <Skeleton className="h-10 w-full" /> {/* Input */}
                </div>
              ))}
            </div>
          </div>

          {/* Employment & Loan Details */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-56" /> {/* Section title */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-40" /> {/* Label */}
                  <Skeleton className="h-10 w-full" /> {/* Input */}
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-24" /> {/* Section title */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" /> {/* Document name */}
                      <Skeleton className="h-3 w-20" /> {/* Document type */}
                      <Skeleton className="h-3 w-16" /> {/* Document size */}
                    </div>
                    <Skeleton className="h-5 w-5 rounded-full" /> {/* Check icon */}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Information */}
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" /> {/* Section title */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-3 w-24" /> {/* Label */}
                  <Skeleton className="h-4 w-16" /> {/* Value */}
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}