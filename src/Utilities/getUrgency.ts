import { Task } from "../Pages/Hero";

export const getUrgency = (task: Task, now: number) => {
  const total = task.deadline - task.created_at;
  if (total <= 0) return 1;
  const elapsed = now - task.created_at;
  const urgency = Math.min(1, Math.max(0, elapsed / total));
  return urgency;
};
