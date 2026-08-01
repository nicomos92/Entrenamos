import { createAdminClient } from "@/lib/supabase/admin";

interface CreateNotificationInput {
  userId: string;
  type: "schedule_updated" | "routine_assigned" | "session_completed" | "metric_recorded";
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput) {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? "",
    data: input.data ?? {},
  });
}
