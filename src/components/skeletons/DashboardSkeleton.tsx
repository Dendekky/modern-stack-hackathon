import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton, SkeletonBadge, SkeletonAvatar } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { PageLayout } from "@/components/ui/page-layout";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <PageLayout maxWidth="2xl">
        <div className="py-12">
          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-96" />
          </div>

          {/* Quick Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-gray-200/60 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
                  <Skeleton className="h-8 w-12 mx-auto mb-1" />
                  <Skeleton className="h-4 w-16 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs Skeleton */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-28" />
              </nav>
            </div>
          </div>

          {/* Search Bar Skeleton */}
          <SkeletonCard className="mb-6">
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-48" />
            </div>
          </SkeletonCard>

          {/* Tickets List Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
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
                      <div className="flex items-center gap-2">
                        <SkeletonAvatar size="sm" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex items-center gap-2">
                        <SkeletonAvatar size="sm" />
                        <Skeleton className="h-4 w-20" />
                      </div>
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
