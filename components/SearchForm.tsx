"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Search form shown in the navbar (compact) and the hero (full).
// Submitting navigates to "/" with the criteria as query params, which the
// landing page reads to filter hotels.
export function SearchForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();

  const [location, setLocation] = useState(params.get("location") ?? "");
  const [checkIn, setCheckIn] = useState(params.get("checkIn") ?? "");
  const [checkOut, setCheckOut] = useState(params.get("checkOut") ?? "");
  const [guests, setGuests] = useState(params.get("guests") ?? "1");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = new URLSearchParams();
    if (location) query.set("location", location);
    if (checkIn) query.set("checkIn", checkIn);
    if (checkOut) query.set("checkOut", checkOut);
    if (guests) query.set("guests", guests);
    router.push(`/?${query.toString()}#hotels`);
  }

  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1 rounded-full border border-slate-300 py-1 pl-4 pr-1 shadow-sm"
      >
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Search location"
          className="w-40 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
        <button
          type="submit"
          className="grid h-8 w-8 place-items-center rounded-full bg-rose-600 text-white hover:bg-rose-700"
          aria-label="Search"
        >
          🔍
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid w-full max-w-4xl grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-5"
    >
      <Field label="Location">
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Where to?"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </Field>
      <Field label="Check in">
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-700 outline-none"
        />
      </Field>
      <Field label="Check out">
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-700 outline-none"
        />
      </Field>
      <Field label="Guests">
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full bg-transparent text-sm text-slate-700 outline-none"
        >
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>
              {n} {n === 1 ? "guest" : "guests"}
            </option>
          ))}
        </select>
      </Field>
      <button
        type="submit"
        className="rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700"
      >
        Search
      </button>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col rounded-xl border border-slate-200 px-3 py-2 text-left focus-within:border-rose-400">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}
