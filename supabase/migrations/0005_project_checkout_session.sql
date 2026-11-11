-- Idempotent Stripe webhook: one project per Checkout Session, so retried events can't create duplicates.
alter table public.projects add column stripe_session_id text unique;
