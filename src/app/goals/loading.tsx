import { Skeleton } from "@/components/ui/skeleton";
import { GoalCardSkeleton } from "@/components/goals/goal-card-skeleton";

export default function Loading() {
  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <Skeleton className="h-8 md:h-9 w-48" />
        <Skeleton className="h-9 w-32 self-start sm:self-auto" />
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <GoalCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
