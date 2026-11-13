-- One-time orders (extra services + domain) and client reviews.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles on delete cascade,
  project_id uuid references public.projects on delete set null,
  stripe_session_id text unique,
  services text[] not null default '{}',
  domain_mode text not null default 'none' check (domain_mode in ('none','buy','own','unsure')),
  domain text,
  amount_cents integer not null default 0,
  status text not null default 'paid' check (status in ('paid','done')),
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;

-- Orders are created by Edge Functions (service role). Clients read their own; the admin reads and updates all.
create policy "orders read own or admin" on public.orders
  for select using (client_id = (select auth.uid()) or public.is_admin());
create policy "orders admin update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles on delete cascade,
  project_id uuid references public.projects on delete set null,
  author_name text not null check (char_length(author_name) between 1 and 60),
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 5 and 600),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (client_id)
);
alter table public.reviews enable row level security;

-- Only approved reviews are public. Clients write one review each, always unapproved; the admin approves.
create policy "reviews read approved, own or admin" on public.reviews
  for select to anon, authenticated using (approved or client_id = (select auth.uid()) or public.is_admin());
create policy "reviews insert own" on public.reviews
  for insert to authenticated with check (client_id = (select auth.uid()) and approved = false);
create policy "reviews update own unapproved" on public.reviews
  for update to authenticated
  using (client_id = (select auth.uid()) and approved = false)
  with check (client_id = (select auth.uid()) and approved = false);
create policy "reviews admin update" on public.reviews
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "reviews admin delete" on public.reviews
  for delete to authenticated using (public.is_admin());

alter publication supabase_realtime add table public.orders;
