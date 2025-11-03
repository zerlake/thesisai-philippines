create table
  public.advisor_student_relationships (
    advisor_id uuid not null references public.profiles on delete cascade,
    student_id uuid not null references public.profiles on delete cascade,
    primary key (advisor_id, student_id)
  );

alter table public.advisor_student_relationships enable row level security;