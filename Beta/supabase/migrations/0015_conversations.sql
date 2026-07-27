create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  trainer_id uuid not null references public.profiles (id) on delete cascade,
  subject text not null default '',
  status text not null default 'open' check (status in ('open', 'closed')),
  context_type text check (context_type in ('session', 'routine', 'general')),
  context_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  content text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- conversations: student sees own, trainer sees own students
create policy "conversations_select_participant"
  on public.conversations for select
  using (auth.uid() = student_id or auth.uid() = trainer_id);

create policy "conversations_insert_student"
  on public.conversations for insert
  with check (auth.uid() = student_id);

-- messages: participant in conversation sees its messages
create policy "messages_select_participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.student_id = auth.uid() or c.trainer_id = auth.uid())
    )
  );

create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.student_id = auth.uid() or c.trainer_id = auth.uid())
    )
  );

-- messages: participant can mark read
create policy "messages_update_read_participant"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
      and (c.student_id = auth.uid() or c.trainer_id = auth.uid())
    )
  )
  with check (read = true);

create index if not exists idx_conversations_participant on public.conversations (student_id, trainer_id);
create index if not exists idx_messages_conversation on public.messages (conversation_id, created_at);
