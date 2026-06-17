import Link from "next/link";
import type { HotelCardData } from "@/lib/types";

export function HotelCard({ hotel }: { hotel: HotelCardData }) {
  return (
    <Link
      href={`/hotels/${hotel.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {hotel.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hotel.image_url}
            alt={hotel.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-4xl">
            🏨
          </div>
        )}
        {hotel.rating !== null && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-slate-700 shadow">
            ⭐ {hotel.rating.toFixed(1)}
            <span className="text-slate-400"> ({hotel.reviewCount})</span>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-slate-900">{hotel.name}</h3>
        <p className="text-sm text-slate-500">📍 {hotel.location}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-sm">
            {hotel.minPrice !== null ? (
              <>
                <span className="font-bold text-slate-900">
                  ${hotel.minPrice}
                </span>
                <span className="text-slate-500"> / night</span>
              </>
            ) : (
              <span className="text-slate-400">Price on request</span>
            )}
          </span>
          <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 group-hover:bg-rose-100">
            View Details
          </span>
        </div>
      </div>
    </Link>
  );
}
