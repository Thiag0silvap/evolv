-- Tabela de perfil, complementando auth.users (que já vem pronta do Supabase)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  title text,
  created_at timestamptz default now()
);

-- Cria o profile automaticamente quando alguém se registra
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, title)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''), new.raw_user_meta_data->>'title');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text,
  status text not null default 'Planejado',
  technologies jsonb default '[]',
  description text,
  origem text not null default 'corporativo',
  created_at timestamptz default now()
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  project text,
  category text not null,
  technologies jsonb default '[]',
  date date not null,
  result text,
  competencies jsonb default '[]',
  created_at timestamptz default now()
);

-- Cache de categorização de habilidades sugerida pela IA (Gemini), por usuário.
-- Preenchida sob demanda pelo hook useSkillCategories: uma linha por par
-- (usuário, habilidade) evita recategorizar via IA em toda visita à tela.
create table public.skill_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  category text not null,
  created_at timestamptz default now(),
  unique (user_id, skill_name)
);

-- Row Level Security: cada usuário só acessa o próprio dado
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.experiences enable row level security;
alter table public.skill_categories enable row level security;

create policy "Usuários veem o próprio perfil" on public.profiles
  for select using (auth.uid() = id);
create policy "Usuários atualizam o próprio perfil" on public.profiles
  for update using (auth.uid() = id);

create policy "Usuários gerenciam os próprios projetos" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuários gerenciam as próprias experiências" on public.experiences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Usuários gerenciam o próprio cache de categorias de habilidade" on public.skill_categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
