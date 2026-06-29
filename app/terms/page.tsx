import Link from "next/link";
import { ShieldCheck, Calendar, Wallet, FileText, Ban, Scale } from "lucide-react";

export const metadata = {
  title: "Terms of Service — BookNest",
  description: "Terms and conditions governing the use of the BookNest hotel booking platform.",
};

export default function TermsPage() {
  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: ShieldCheck,
      content: (
        <>
          <p>
            By accessing or using the BookNest platform (including our website, mobile applications, and associated services), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you may not access or use our services.
          </p>
          <p className="mt-2">
            You must be at least 18 years of age and possess the legal authority to enter into a binding contract to book accommodation on BookNest. By making a booking, you warrant that all information you supply is true, accurate, and complete.
          </p>
        </>
      ),
    },
    {
      id: "bookings",
      title: "2. Bookings and Payments",
      icon: Calendar,
      content: (
        <>
          <p>
            BookNest operates as a booking platform connecting guests with participating hotels. A booking is considered confirmed only when you receive a confirmation email and a valid Booking ID is generated.
          </p>
          <p className="mt-2 font-semibold text-slate-800">
            Payment Processing:
          </p>
          <p className="mt-1">
            All payments made online are processed securely through our authorized third-party payment gateway, **Razorpay**. By providing your payment details, you authorize BookNest (via Razorpay) to charge the designated amount. All transactions are encrypted and subject to Razorpay's security standards.
          </p>
          <p className="mt-2">
            Depending on the hotel policy, you may be offered the choice to pay in full online, pay a partial deposit, or pay at the hotel. If you select a partial payment or pay-at-hotel option, the remaining balance must be paid directly to the hotel staff upon check-in or check-out.
          </p>
        </>
      ),
    },
    {
      id: "cancellations",
      title: "3. Cancellations, Refunds & No-Shows",
      icon: Ban,
      content: (
        <>
          <p>
            Each hotel listing on BookNest displays a specific cancellation policy (e.g., "Free cancellation up to 24 hours before check-in" or "Non-refundable"). You agree to abide by the cancellation terms of the specific hotel you book.
          </p>
          <p className="mt-2 font-semibold text-slate-800">
            Refunds:
          </p>
          <p className="mt-1">
            Eligible refunds for cancellations will be processed automatically back to your original payment method via Razorpay. Depending on your bank or card issuer, refunds typically take **5 to 7 business days** to reflect in your account. BookNest is not responsible for bank-side delays.
          </p>
          <p className="mt-2">
            If you fail to arrive at the hotel on your scheduled check-in date without prior cancellation (a "No-Show"), the booking will be marked as cancelled, and the hotel reserves the right to retain the full booking amount as per their no-show policy.
          </p>
        </>
      ),
    },
    {
      id: "responsibilities",
      title: "4. Guest Responsibilities & Hotel Rules",
      icon: Wallet,
      content: (
        <>
          <p>
            When checking in, you must present a valid government-issued photo identification card (e.g., Passport, Aadhaar, Driver's License) matching the name on the booking confirmation.
          </p>
          <p className="mt-2">
            You agree to comply with all house rules, check-in/check-out times, pet policies, and occupancy limits established by the hotel. Any damage caused to the hotel property by you or your guests during the stay is your sole financial responsibility and must be settled directly with the hotel prior to departure.
          </p>
        </>
      ),
    },
    {
      id: "disclaimer",
      title: "5. Platform Disclaimer & Limitation of Liability",
      icon: Scale,
      content: (
        <>
          <p>
            BookNest acts solely as an intermediary. We do not own, operate, or manage any of the hotels listed on our platform. Consequently, BookNest cannot be held liable for the quality, safety, cleanliness, or legality of the accommodations, nor for any personal injury, property damage, or loss suffered during your stay.
          </p>
          <p className="mt-2">
            While we strive to ensure that all information (amenities, room rates, availability) displayed on our site is accurate, we cannot guarantee its absolute correctness. The hotels are solely responsible for updating their listings.
          </p>
        </>
      ),
    },
    {
      id: "governing-law",
      title: "6. Governing Law & Dispute Resolution",
      icon: FileText,
      content: (
        <>
          <p>
            These Terms of Service and any disputes arising out of or related to your use of the BookNest platform shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
          </p>
          <p className="mt-2">
            Any legal action or proceeding arising under these terms shall be brought exclusively in the courts located in New Delhi, India, and you hereby consent to the personal jurisdiction and venue of such courts.
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
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-slate-500 font-semibold">
          Last Updated: June 29, 2026 • Version 1.2
        </p>
      </div>

      {/* Content Layout */}
      <div className="mx-auto max-w-5xl px-4 mt-12 sm:px-6 grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-10">
        {/* Sidebar Navigation */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-2 border-l-2 border-slate-100 pl-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3">
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
              <Link href="/privacy" className="block text-xs font-bold text-brand-700 hover:underline">
                Privacy Policy
              </Link>
              <Link href="/" className="block text-xs font-bold text-slate-500 hover:underline">
                Back to Home
              </Link>
            </div>
          </div>
        </aside>

        {/* Terms Content */}
        <main className="space-y-10">
          <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-base font-medium text-slate-800 mb-6">
              Welcome to BookNest. Please read these terms carefully before using our platform. They outline your rights and obligations as a guest or a hotel partner on our booking platform.
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
              Have questions about our terms?
            </h3>
            <p className="text-xs text-slate-300 mt-2 max-w-lg mx-auto relative z-10 leading-relaxed">
              If you have any questions, concerns, or require clarification regarding these terms, please contact our legal compliance team.
            </p>
            <div className="mt-5 relative z-10 flex flex-col sm:flex-row justify-center items-center gap-4 text-xs font-bold">
              <span className="bg-brand-850 px-4 py-2 rounded-xl border border-brand-750">
                Email: support@booknest.com
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
