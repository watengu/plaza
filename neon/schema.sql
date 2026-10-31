create table if not exists boards (
  id serial primary key,
  slug text unique not null,
  name text not null,
  icon text not null default '',
  is_open boolean not null default true,
  display_order int not null default 0
);
create table if not exists threads (
  id serial primary key,
  board_id int not null references boards(id),
  title text not null,
  starter_name text not null,
  created_at timestamptz not null default now()
);
create table if not exists posts (
  id serial primary key,
  thread_id int not null references threads(id),
  author_name text not null,
  body text not null,
  kind text not null default 'info',
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create table if not exists notices (
  id serial primary key,
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists posts_expires_idx on posts (expires_at);
create index if not exists posts_thread_idx on posts (thread_id);
