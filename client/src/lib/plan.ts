import type { ThemePlan } from "@/lib/themes";

export type UserPlan = "free" | "pro" | "business" | "enterprise";

const PLAN_ORDER: UserPlan[] = ["free", "pro", "business", "enterprise"];

export function isPlanAtLeast(userPlan: UserPlan, required: ThemePlan): boolean {
  const userIdx = PLAN_ORDER.indexOf(userPlan);
  const reqIdx = PLAN_ORDER.indexOf(required as UserPlan);
  return userIdx >= reqIdx;
}

export function useUserPlan(): UserPlan {
  return "free";
}
