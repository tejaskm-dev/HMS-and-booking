import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function GuestDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id ?? "")
    .single();
  const profile = data as Profile | null;

  return <DashboardClient profile={profile} user={user} />;
}
