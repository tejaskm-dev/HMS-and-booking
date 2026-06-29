import Link from "next/link";
import { User, Eye, Share2, ShieldAlert, Key, HelpCircle } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — BookNest",
  description: "Privacy policy detailing how BookNest collects, uses, and protects your personal data.",
};

export default function PrivacyPage() {
  const sections = [
    {
      id: "collection",
      title: "1. Information We Collect",
      icon: User,
      content: (
        <>
          <p>
            We collect personal information that you voluntarily provide to us when registering on the platform, completing your profile, or making a booking. This includes:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Identity Details:</strong> Full name, Date of Birth (for age verification and booking validation).</li>
            <li><strong>Contact Details:</strong> Email address, phone number, and default location.</li>
            <li><strong>Booking Information:</strong> Selected hotel, room choices, stay dates, guest names, and special requests.</li>
            <li><strong>Technical Data:</strong> IP address, device type, browser settings, and page interaction data.</li>
          </ul>
          <p className="mt-2">
            We do not store your credit/debit card numbers, UPI PINs, or net banking passwords on our servers. All financial transactions are handled securely by our payment partner, **Razorpay**.
          </p>
        </>
      ),
    },
    {
      id: "usage",
      title: "2. How We Use Your Information",
      icon: Eye,
      content: (
        <>
          <p>
            We use the collected information for the following business and operational purposes:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>To process and confirm your hotel reservations.</li>
            <li>To securely process payments and issue refunds through Razorpay.</li>
            <li>To send booking confirmations, invoices, stay updates, and security alerts.</li>
            <li>To verify the identity of guests and hotel managers during registration.</li>
            <li>To personalize your search experience and improve our platform's usability.</li>
          </ul>
        </>
      ),
    },
    {
      id: "sharing",
      title: "3. Sharing of Information",
      icon: Share2,
      content: (
        <>
          <p>
            We share your data only with third parties essential to fulfilling your bookings and maintaining platform security:
          </p>
          <p className="mt-2 font-semibold text-slate-800">
            Hotel Partners:
          </p>
          <p className="mt-1">
            When you make a booking, we share your name, phone number, and stay details with the hotel staff so they can prepare for your arrival and check you in. They do not receive your payment credentials.
          </p>
          <p className="mt-2 font-semibold text-slate-800">
            Payment Gateways:
          </p>
          <p className="mt-1">
            Transaction details are shared with **Razorpay** to process payments, verify payment status, and initiate refunds.
          </p>
          <p className="mt-2">
            We **never** sell, rent, or trade your personal information to third-party advertising networks for marketing purposes.
          </p>
        </>
      ),
    },
    {
      id: "security",
      title: "4. Data Security & Retention",
      icon: ShieldAlert,
      content: (
        <>
          <p>
            We implement industry-standard technical and organizational security measures (including SSL/TLS encryption, secure database access tokens, and regular vulnerability audits) to protect your personal data from unauthorized access, alteration, or disclosure.
          </p>
          <p className="mt-2">
            We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with tax and accounting regulations (e.g., maintaining transaction histories), and resolve any booking disputes.
          </p>
        </>
      ),
    },
    {
      id: "rights",
      title: "5. Your Privacy Rights",
      icon: Key,
      content: (
        <>
          <p>
            Depending on your location, you have specific rights regarding your personal data:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Right to Access:</strong> You can request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> You can update or correct your profile details at any time from your account settings.</li>
            <li><strong>Right to Deletion:</strong> You can request that we delete your account and associated personal data, subject to our legal and regulatory retention obligations.</li>
          </ul>
          <p className="mt-2">
            To exercise any of these rights, please contact our support team at the email address listed below.
          </p>
        </>
      ),
    },
    {
      id: "cookies",
      title: "6. Cookies & Tracking",
      icon: HelpCircle,
      content: (
        <>
          <p>
            We use cookies to keep you signed in, remember your search preferences, and analyze site traffic. You can control your cookie preferences at any time:
          </p>
          <p className="mt-2">
            Essential cookies are required for core site functions (like user authentication) and cannot be turned off. Analytical or personalization cookies can be accepted or rejected using our **Cookie Consent** settings banner at the bottom of the screen.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="bg-[#FFFDF9] min-h-screen pb-20">
      {/* Decorative Top Gold Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600" />

      {/* Header Banner */}
      <div className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 text-center">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gold-600 bg-gold-50 px-3 py-1 rounded-full border border-gold-200/50">
          Legal Directory
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl font-black text-brand-900 mt-4 leading-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-slate-550 font-semibold">
          Last Updated: June 29, 2026 • Version 1.2
        </p>
      </div>

      {/* Content Layout */}
      <div className="mx-auto max-w-5xl px-4 mt-12 sm:px-6 grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-10">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-2 border-l-2 border-slate-100 pl-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-450 mb-3">
              Sections
            </p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="block text-xs font-bold text-slate-500 hover:text-brand-800 transition py-1"
              >
                {s.title.substring(3)}
              </a>
            ))}
            <div className="pt-6 mt-6 border-t border-slate-100 space-y-2">
              <Link href="/terms" className="block text-xs font-bold text-brand-700 hover:underline">
                Terms of Service
              </Link>
              <Link href="/" className="block text-xs font-bold text-slate-500 hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </aside>

        {/* Privacy Content */}
        <main className="space-y-10">
          <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-base font-medium text-slate-800 mb-6">
              At BookNest, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our platform.
            </p>

            <div className="space-y-10">
              {sections.map((s) => {
                const Icon = s.icon;
                return (
                  <section key={s.id} id={s.id} className="scroll-mt-24 pt-4 border-t border-slate-100 first:border-t-0 first:pt-0">
                    <div className="flex items-center gap-3 mb-3.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <h2 className="font-serif text-lg font-bold text-slate-900 m-0">
                        {s.title}
                      </h2>
                    </div>
                    <div className="space-y-2 pl-11">{s.content}</div>
                  </section>
                );
              })}
            </div>
          </div>

          {/* Contact Footer */}
          <div className="bg-brand-900 rounded-3xl p-6 sm:p-8 text-white text-center relative overflow-hidden shadow-lg border border-brand-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.15),transparent_40%)]" />
            <h3 className="font-serif text-xl font-bold text-gold-300 relative z-10">
              Need assistance with your data?
            </h3>
            <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto relative z-10 leading-relaxed">
              If you have any questions regarding your data privacy, wish to request data deletion, or want to exercise your rights, please reach out to our privacy officer.
            </p>
            <div className="mt-5 relative z-10 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs font-bold">
              <span className="bg-brand-850 px-4 py-2 rounded-xl border border-brand-750">
                Email: privacy@booknest.com
              </span>
              <span className="bg-brand-850 px-4 py-2 rounded-xl border border-brand-750">
                Phone: +91 11 4059 8320
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
