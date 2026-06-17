import Link from "next/link";

// Shared centered card used by login and signup pages.
export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <Link
        href="/"
        className="mb-6 text-center text-3xl font-extrabold text-rose-600"
      >
        HMS
      </Link>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100";

export const labelClass = "mb-1 block text-sm font-medium text-slate-700";

export const primaryBtn =
  "w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50";
