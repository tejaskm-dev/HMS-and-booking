-- =============================================================================
-- BookNest — Email notifications.
-- Adds a guard column so a booking's confirmation email is sent exactly once,
-- even though both the Razorpay webhook and the reconcile safety net can confirm
-- the same booking. The send is "claimed" via an atomic UPDATE ... WHERE
-- confirmation_email_sent_at IS NULL. Safe to re-run.
-- =============================================================================

alter table public.bookings
  add column if not exists confirmation_email_sent_at timestamptz;

-- Same one-shot guard for the cancellation and refund-processed emails. The
-- refund email especially needs it: Razorpay can fire refund.created AND
-- refund.processed for the same refund.
alter table public.bookings
  add column if not exists cancellation_email_sent_at timestamptz;
alter table public.bookings
  add column if not exists refund_email_sent_at timestamptz;
