"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";

const STORAGE_KEY = "booknest-cookie-consent";

// Bottom cookie-consent banner. Slides up on first visit, persists the choice
// in localStorage, and slides back down on dismissal. Purely client-side.
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Small delay so it eases in after the page settles.
        const t = setTimeout(() => setShow(true), 700);
        return () => clearTimeout(t);
      }
    } catch {
      // localStorage blocked (private mode) — just don't show it.
    }
  }, []);

  function decide(value: "accepted" | "necessary") {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 140, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 140, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="fixed inset-x-4 bottom-4 z-[100] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md"
          role="dialog"
          aria-live="polite"
          aria-label="Cookie consent"
        >
          <div className="overflow-hidden rounded-2xl border border-brand-100 bg-[#FFFDF9] shadow-[0_20px_50px_-12px_rgba(10,67,53,0.35)] ring-1 ring-black/5">
            {/* Gold accent rule — the BookNest luxury motif */}
            <div className="h-[3px] w-full bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600" />

            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-800 text-gold-400 ring-2 ring-gold-200/60">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z" />
                    <path d="M8.5 8.5h.01M16 11h.01M11 15h.01M8 13h.01M15 15.5h.01" />
                  </svg>
                </span>
                <div className="pt-0.5">
                  <h2 className="font-serif text-lg font-bold leading-tight text-brand-800">
                    We value your privacy
                  </h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
                    We use cookies to keep you signed in, remember your
                    preferences, and craft a better stay on BookNest. Read our{" "}
                    <Link
                      href="/privacy"
                      className="font-semibold text-brand-700 underline decoration-gold-400 underline-offset-2 hover:text-brand-800"
                    >
                      privacy policy
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => decide("necessary")}
                  className="flex-1 rounded-xl border border-brand-200 px-4 py-2.5 text-xs font-bold tracking-wide text-brand-700 transition hover:border-brand-300 hover:bg-brand-50"
                >
                  Necessary only
                </button>
                <button
                  onClick={() => decide("accepted")}
                  className="flex-1 rounded-xl bg-brand-700 px-4 py-2.5 text-xs font-bold tracking-wide text-white shadow-sm ring-1 ring-inset ring-white/10 transition hover:bg-brand-800"
                >
                  Accept all
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
