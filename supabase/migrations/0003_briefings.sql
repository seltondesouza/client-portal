create table public.briefings (
  project_id uuid primary key references public.projects on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.briefings enable row level security;

create policy "briefings read own or admin" on public.briefings
  for select using (
    public.is_admin() or exists (
      select 1 from public.projects p where p.id = project_id and p.client_id = (select auth.uid()))
  );
create policy "briefings insert own" on public.briefings
  for insert with check (
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = (select auth.uid()))
  );
create policy "briefings update own" on public.briefings
  for update using (
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.projects p where p.id = project_id and p.client_id = (select auth.uid()))
  );

alter publication supabase_realtime add table public.briefings;
