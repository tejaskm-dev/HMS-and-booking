"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Refreshes the current route's server data (router.refresh re-fetches the RSC
// payload; for an ISR page that's cheap — it returns the cached render, or the
// revalidated one once the window lapses). Fires when the user returns to the
// tab and on a slow interval, so a left-open page picks up new listings without
// a manual reload. Client state (scroll, inputs) is preserved across refresh.
export function AutoRefresh({ intervalMs = 300_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    document.addEventListener("visibilitychange", refresh);
    const id = setInterval(refresh, intervalMs);

    return () => {
      document.removeEventListener("visibilitychange", refresh);
      clearInterval(id);
    };
  }, [router, intervalMs]);

  return null;
}
