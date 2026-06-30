import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId");

    if (!targetUserId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Security Check: Verify there is an active conversation between the current user and the target user.
    // Case 1: Current user is guest, target user is the manager of the hotel in the conversation.
    const { data: convAsGuest } = await supabase
      .from("conversations")
      .select("id, hotels!inner(manager_id)")
      .eq("guest_id", user.id)
      .eq("hotels.manager_id", targetUserId);

    // Case 2: Current user is manager, target user is the guest.
    const { data: convAsManager } = await supabase
      .from("conversations")
      .select("id, hotels!inner(manager_id)")
      .eq("guest_id", targetUserId)
      .eq("hotels.manager_id", user.id);

    const hasAccess = (convAsGuest && convAsGuest.length > 0) || (convAsManager && convAsManager.length > 0);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized access to participant profile" },
        { status: 403 }
      );
    }

    // Resolve email using admin service-role
    const admin = createAdminClient();
    const { data: userData, error: userError } = await admin.auth.admin.getUserById(targetUserId);

    if (userError || !userData?.user) {
      console.error("[participant-email] auth fetch error:", userError);
      return NextResponse.json({ email: "" });
    }

    return NextResponse.json({ email: userData.user.email });
  } catch (err) {
    console.error("[participant-email] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
