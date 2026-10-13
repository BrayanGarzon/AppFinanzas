-- PocketFlow's first remote schema: identity, accounts, categories and cash movements.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80),
  opening_balance_cop bigint not null default 0 check (opening_balance_cop >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 60),
  kind text not null check (kind in ('income', 'expense')),
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  check ((is_system and user_id is null) or (not is_system and user_id is not null))
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete restrict,
  category_id uuid not null references public.categories (id) on delete restrict,
  kind text not null check (kind in ('income', 'expense')),
  amount_cop bigint not null check (amount_cop > 0),
  transaction_date date not null,
  description text not null default '' check (length(description) <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index transactions_user_date_idx on public.transactions (user_id, transaction_date desc, created_at desc);
create index transactions_category_date_idx on public.transactions (user_id, category_id, transaction_date desc);
create index categories_user_kind_idx on public.categories (user_id, kind, name);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger accounts_set_updated_at before update on public.accounts
for each row execute function public.set_updated_at();
create trigger transactions_set_updated_at before update on public.transactions
for each row execute function public.set_updated_at();

create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy "Users can read their profile" on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy "Users can update their profile" on public.profiles
for update to authenticated using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can manage their accounts" on public.accounts
for all to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can read system and own categories" on public.categories
for select to authenticated using (user_id is null or (select auth.uid()) = user_id);
create policy "Users can manage their own categories" on public.categories
for all to authenticated using ((select auth.uid()) = user_id and not is_system)
with check ((select auth.uid()) = user_id and not is_system);

create policy "Users can read their transactions" on public.transactions
for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert valid own transactions" on public.transactions
for insert to authenticated with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.accounts a
    where a.id = account_id and a.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.categories c
    where c.id = category_id
      and (c.user_id is null or c.user_id = (select auth.uid()))
      and c.kind = transactions.kind
  )
);
create policy "Users can update valid own transactions" on public.transactions
for update to authenticated using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.accounts a
    where a.id = account_id and a.user_id = (select auth.uid())
  )
  and exists (
    select 1 from public.categories c
    where c.id = category_id
      and (c.user_id is null or c.user_id = (select auth.uid()))
      and c.kind = transactions.kind
  )
);
create policy "Users can delete their transactions" on public.transactions
for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.profiles, public.accounts, public.categories, public.transactions from public, anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.accounts, public.categories, public.transactions to authenticated;
