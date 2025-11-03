create table
  public.profiles (
    id uuid not null references auth.users on delete cascade,
    first_name text null,
    last_name text null,
    role text not null default 'student',
    created_at timestamp with time zone not null default now(),
    primary key (id)
  );

alter table public.profiles enable row level security;