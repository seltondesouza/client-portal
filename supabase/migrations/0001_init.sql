-- Replace the email below with your admin email before running.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'ADMIN_EMAIL_HERE'
$$;

create type public.project_stage as enum
  ('pagamento','briefing','design','desenvolvimento','revisao','online');
create type public.plan_type as enum ('estatico','ecommerce');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  stripe_customer_id text unique,
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles on delete cascade,
  plan public.plan_type not null,
  stage public.project_stage not null default 'pagamento',
  preview_url text,
  created_at timestamptz not null default now()
);

create table public.project_updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects on delete cascade,
  stage public.project_stage not null,
  note text,
  created_at timestamptz not null default now()
);

-- Create a profile automatically on first login.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_updates enable row level security;

-- Clients: read only their own data. Admin: read/write everything.
-- Billing columns on profiles are written only by the Stripe webhook (service role).
create policy "profiles read own or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "projects read own or admin" on public.projects
  for select using (client_id = auth.uid() or public.is_admin());
create policy "projects admin update" on public.projects
  for update using (public.is_admin());

create policy "updates read own or admin" on public.project_updates
  for select using (
    public.is_admin() or exists (
      select 1 from public.projects p
      where p.id = project_id and p.client_id = auth.uid())
  );
create policy "updates admin insert" on public.project_updates
  for insert with check (public.is_admin());

-- Realtime for the live dashboard.
alter publication supabase_realtime add table public.profiles, public.projects, public.project_updates;
