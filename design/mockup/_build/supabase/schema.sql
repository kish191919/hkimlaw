-- =====================================================================
-- 김형걸 이민법 변호사 홈페이지 시연판 · Supabase 스키마
-- 글(posts), 편집자(editors), 사진 저장소(post-images)
-- 읽기: 누구나 '발행된' 글만. 쓰기·고치기·지우기·사진 올리기: editors 에 등록된 사람만.
-- =====================================================================

-- 편집자 확인 함수는 API로 노출되지 않는 private 스키마에 둔다.
create schema if not exists private;
grant usage on schema private to anon, authenticated;

-- ---------- 편집자 ----------
create table public.editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now()
);
comment on table public.editors is '글을 쓰고 고칠 수 있는 계정 목록';
alter table public.editors enable row level security;

create or replace function private.is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.editors e where e.user_id = (select auth.uid()));
$$;
revoke all on function private.is_editor() from public;
grant execute on function private.is_editor() to anon, authenticated;

create policy "editors: 자기 정보만 읽기" on public.editors
  for select to authenticated
  using (user_id = (select auth.uid()));

-- ---------- 글 ----------
create table public.posts (
  id bigint generated always as identity primary key,
  board text not null check (board in ('news', 'column')),
  type text not null,
  title text not null check (char_length(title) between 1 and 200),
  summary text[] not null default '{}' check (coalesce(array_length(summary, 1), 0) <= 3),
  body_html text not null default '' check (char_length(body_html) <= 200000),
  has_body boolean generated always as (body_html <> '') stored,
  hubs text[] not null default '{}' check (hubs <@ array['green', 'nonimm', 'citizen', 'defense']),
  tags text[] not null default '{}',
  cover_url text,
  video_id text check (video_id ~ '^[A-Za-z0-9_-]{11}$'),
  video_shape text check (video_shape in ('short', 'wide')),
  external_url text,
  source text not null default 'site' check (source in ('site', 'blog', 'cafe')),
  status text not null default 'published' check (status in ('draft', 'published')),
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  author_id uuid default auth.uid() references auth.users (id) on delete set null,
  constraint posts_type_matches_board check (
    (board = 'news' and type in ('bulletin', 'policy', 'court', 'notice')) or
    (board = 'column' and type in ('guide', 'qna', 'case', 'view'))
  )
);
comment on table public.posts is '이민법 소식·전문가 칼럼 글. source=blog/cafe 는 기존 네이버 글(원문 링크), site 는 홈페이지에서 쓴 글';
comment on column public.posts.summary is '3줄 요약 (글 위 요약 상자, 목록 요약, 검색 설명, SNS 문구)';
comment on column public.posts.hubs is '업무분야 허브: green 이민비자·영주권, nonimm 비이민비자, citizen 시민권, defense 추방재판·이민구제';
comment on column public.posts.tags is '세부 업무분야 (가족이민, 학생·교환 등)';
comment on column public.posts.video_id is '글에 넣은 첫 유튜브 영상 ID (홈 1분 이민법 칸에 쓴다)';
comment on column public.posts.video_shape is 'short: 숏츠(세로), wide: 일반 영상(가로)';

create index posts_listing_idx on public.posts (status, published_at desc);
create index posts_hubs_idx on public.posts using gin (hubs);
create index posts_author_idx on public.posts (author_id);

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger posts_touch_updated_at
  before update on public.posts
  for each row execute function private.touch_updated_at();

alter table public.posts enable row level security;

create policy "posts: 발행된 글은 누구나, 편집자는 전부 읽기" on public.posts
  for select to anon, authenticated
  using ((status = 'published' and published_at <= now()) or (select private.is_editor()));

create policy "posts: 편집자만 쓰기" on public.posts
  for insert to authenticated
  with check ((select private.is_editor()));

create policy "posts: 편집자만 고치기" on public.posts
  for update to authenticated
  using ((select private.is_editor()))
  with check ((select private.is_editor()));

create policy "posts: 편집자만 지우기" on public.posts
  for delete to authenticated
  using ((select private.is_editor()));

-- ---------- 사진·영상 저장소 (파일 하나 최대 50MB) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('post-images', 'post-images', true, 52428800,
        array['image/webp', 'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do nothing;

create policy "post-images: 편집자만 목록 보기" on storage.objects
  for select to authenticated
  using (bucket_id = 'post-images' and (select private.is_editor()));

create policy "post-images: 편집자만 올리기" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'post-images' and (select private.is_editor()));

create policy "post-images: 편집자만 지우기" on storage.objects
  for delete to authenticated
  using (bucket_id = 'post-images' and (select private.is_editor()));
