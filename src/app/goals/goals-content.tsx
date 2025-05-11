"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Goal as GoalIcon } from "lucide-react";

import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { GoalCard } from "@/components/goals/goal-card";
import { GoalCardSkeleton } from "@/components/goals/goal-card-skeleton";
import { getGoals } from "@/utils/goals/actions";
import { EmptyState } from "@/components/ui/empty-state";
import { Goal } from "@/types/goals";

export function GoalsContent() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch goals
  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const result = await getGoals();
        if (result.success && result.data) {
          setGoals(result.data);
        } else if (result.error) {
          toast.error(result.error);
        }
      } catch {
        toast.error("Failed to load goals");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [refreshKey]);

  // Handle refresh
  const handleRefresh = () => {
    // Force a complete refresh of the goals data
    setGoals([]); // Clear existing goals
    setIsLoading(true);

    // Immediately increment the refresh key to trigger a new fetch
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="container py-4 md:py-8 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Financial Goals</h1>
        <AddGoalDialog onSuccess={handleRefresh} />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <GoalCardSkeleton key={index} />
          ))}
        </div>
      ) : goals.length === 0 ? (
        <EmptyState
          icon={<GoalIcon className="h-12 w-12 text-muted-foreground" />}
          title="No goals yet"
          description="Create your first financial goal to start tracking your progress."
          action={<AddGoalDialog onSuccess={handleRefresh} />}
        />
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => (
            <GoalCard
              key={`${goal.id}-${goal.current_amount}-${goal.target_amount}`}
              goal={goal}
              onUpdate={handleRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}
