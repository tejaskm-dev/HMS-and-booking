"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { completeProfile } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { primaryBtn } from "@/components/AuthCard";
import {
  IconField,
  FieldLabel,
  FieldShell,
  bareInput,
} from "@/components/AuthFields";
import {
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  MapPinIcon,
} from "@/components/icons";

export default function OnboardingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Prefill what we already have (name comes from the OAuth provider); bounce
  // out if there's no session, or if the profile is already complete.
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, dob, location")
        .eq("id", user.id)
        .single();

      if (profile?.phone) {
        router.replace("/");
        return;
      }

      setFullName(
        profile?.full_name ??
          (user.user_metadata?.full_name as string) ??
          (user.user_metadata?.name as string) ??
          "",
      );
      if (profile?.dob) setDob(profile.dob);
      if (profile?.location) setLocation(profile.location);
      setReady(true);
    })();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await completeProfile({ fullName, dob, phone, location });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your details");
      setLoading(false);
    }
  }

  if (!ready) return null;

  return (
    <AuthShell
      side={{
        title: "Almost there",
        subtitle: "A few more details and your account is ready to go.",
      }}
    >
      <h1 className="text-2xl font-bold text-slate-900">Complete your profile</h1>
      <p className="mt-1 text-sm text-slate-500">
        We just need a little more information to finish setting up your account.
      </p>

      {error && (
        <div className="mb-4 mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <FieldLabel>Full name</FieldLabel>
          <IconField
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            required
            icon={<UserIcon className="h-4 w-4" />}
          />
        </div>
        <div>
          <FieldLabel>Default location</FieldLabel>
          <IconField
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            required
            icon={<MapPinIcon className="h-4 w-4" />}
          />
        </div>
        <div>
          <FieldLabel>Date of birth</FieldLabel>
          <FieldShell icon={<CalendarIcon className="h-4 w-4" />}>
            <input
              type="date"
              className={bareInput}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </FieldShell>
        </div>
        <div>
          <FieldLabel>Phone number</FieldLabel>
          <IconField
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            required
            icon={<PhoneIcon className="h-4 w-4" />}
          />
        </div>
        <button type="submit" disabled={loading} className={primaryBtn}>
          {loading ? "Saving…" : "Finish setup"}
        </button>
      </form>
    </AuthShell>
  );
}
