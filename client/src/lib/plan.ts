import type { ThemePlan } from "@/lib/themes";

export type UserPlan = "free" | "pro" | "business" | "enterprise";

const PLAN_ORDER: UserPlan[] = ["free", "pro", "business", "enterprise"];

export function isPlanAtLeast(userPlan: UserPlan, required: ThemePlan): boolean {
  const userIdx = PLAN_ORDER.indexOf(userPlan);
  const reqIdx = PLAN_ORDER.indexOf(required as UserPlan);
  return userIdx >= reqIdx;
}

export function useUserPlan(): UserPlan {
  // NOTE: Returns "pro" for all users during trial period.
  // Replace with real billing lookup when payments are wired up.
  return "pro";
}
