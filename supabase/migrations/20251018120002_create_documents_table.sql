create table
  public.documents (
    id uuid not null default gen_random_uuid (),
    user_id uuid not null references public.profiles on delete cascade,
    title text not null,
    content text null,  -- Changed from jsonb to text to match client usage
    status text not null default 'Draft',
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    primary key (id)
  );

alter table public.documents enable row level security;