import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton, SkeletonBadge } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { PageLayout } from "@/components/ui/page-layout";

export function MyTicketsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <PageLayout maxWidth="2xl">
        <div className="py-12">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-80 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-4 text-center">
                  <Skeleton className="h-6 w-6 mx-auto mb-1 rounded-full" />
                  <Skeleton className="h-6 w-8 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search and Filters Skeleton */}
          <Card className="mb-6 border-gray-200/60 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-4 space-y-4">
              {/* Search Bar */}
              <Skeleton className="h-10 w-full" />
              
              {/* Filters */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Skeleton className="h-4 w-16" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <SkeletonButton />
                </div>
                
                {/* Create Button */}
                <Skeleton className="h-10 w-36" />
              </div>
            </CardContent>
          </Card>

          {/* Tickets List Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <div className="flex gap-2 mb-3">
                        <SkeletonBadge />
                        <SkeletonBadge />
                        <SkeletonBadge />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                  
                  <SkeletonText lines={2} className="mb-4" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
