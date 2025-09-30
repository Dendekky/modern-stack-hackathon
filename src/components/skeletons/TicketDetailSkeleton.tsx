import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton, SkeletonBadge, SkeletonAvatar } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageLayout } from "@/components/ui/page-layout";

export function TicketDetailSkeleton() {
  return (
    <PageLayout maxWidth="xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-6 w-48" />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Ticket Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Skeleton className="h-8 w-3/4 mb-4" />
                  <div className="flex gap-2 flex-wrap mb-4">
                    <SkeletonBadge />
                    <SkeletonBadge />
                    <SkeletonBadge />
                    <SkeletonBadge />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Skeleton className="h-6 w-32 mb-3" />
                  <SkeletonText lines={4} />
                </div>
                
                {/* Voice Transcript Skeleton */}
                <div>
                  <Skeleton className="h-6 w-40 mb-3" />
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                    <SkeletonText lines={3} />
                  </div>
                </div>

                {/* AI Response Skeleton */}
                <div>
                  <Skeleton className="h-6 w-48 mb-3" />
                  <div className="bg-green-50 border border-green-200 rounded-lg max-h-[25.8rem] overflow-y-auto">
                    <div className="p-4">
                      <SkeletonText lines={6} className="mb-4" />
                      
                      <div className="border-t border-green-200 pt-4">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <div className="space-y-2">
                          {Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="bg-white p-3 rounded border border-green-100">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <Skeleton className="h-4 w-3/4 mb-2" />
                                  <Skeleton className="h-3 w-full" />
                                </div>
                                <Skeleton className="h-4 w-20" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 text-sm pt-4 border-t">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-36" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <SkeletonText lines={3} className="mb-3" />
                    <div className="flex gap-2">
                      <SkeletonButton />
                      <SkeletonButton />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Conversation and Message Input */}
        <div className="space-y-6">
          {/* Conversation Thread */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="min-h-96 max-h-96 overflow-y-auto py-2">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex flex-col ${i % 2 === 0 ? "items-end mr-4" : "items-start"} mb-4 ${i % 2 === 1 ? "pr-8" : ""}`}>
                      <div className={`flex items-end gap-2 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
                        <SkeletonAvatar size="sm" />
                        <div
                          className={`max-w-[100%] rounded-2xl px-4 py-3 shadow-sm ${
                            i % 2 === 0
                              ? "bg-blue-600"
                              : "bg-gray-100 border border-gray-200"
                          }`}
                        >
                          <SkeletonText lines={2} />
                        </div>
                      </div>
                      <div className={`text-xs mt-1 px-2 ${i % 2 === 0 ? "text-right" : "text-left"}`}>
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Message Input */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <div className="flex justify-end">
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
