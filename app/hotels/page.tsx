import { Suspense } from "react";
import { getApprovedHotelsCached } from "@/lib/hotels";
import HotelsClient from "./HotelsClient";
import { AutoRefresh } from "@/components/AutoRefresh";

// ISR: serve a CDN-cached render and re-generate in the background at most once
// a minute. The data is already cookie-free + tag-cached, so this caches the
// rendered HTML — turning a per-request serverless render on Vercel into an
// instant edge response. New listings appear within ~60s.
export const revalidate = 60;

export default async function HotelsPage() {
  let hotels: any[] = [];
  try {
    hotels = await getApprovedHotelsCached();
  } catch (error: any) {
    return (
      <div className="flex h-screen items-center justify-center bg-cream-50 text-slate-800">
        <div className="text-center">
          <h2 className="text-xl font-bold">Error loading stays</h2>
          <p className="text-sm text-slate-500 mt-2">{error.message || "Please check database connection."}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AutoRefresh />
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-cream-50 text-slate-400 font-semibold animate-pulse">
            Loading Explore Stays...
          </div>
        }
      >
        <HotelsClient hotels={hotels} />
      </Suspense>
    </>
  );
}