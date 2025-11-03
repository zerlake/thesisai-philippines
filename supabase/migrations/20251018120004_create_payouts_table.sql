create table
  public.payout_requests (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null references public.profiles on delete cascade,
    amount numeric not null check (amount > 0),
    payout_method text not null,
    status text not null default 'pending',
    created_at timestamp with time zone not null default now(),
    primary key (id)
  );

alter table public.payout_requests enable row level security;