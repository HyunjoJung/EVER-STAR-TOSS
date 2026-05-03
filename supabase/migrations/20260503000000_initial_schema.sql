create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  identity_provider text not null default 'apps_in_toss_anonymous',
  anonymous_hash text not null unique,
  toss_user_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  name text not null,
  age integer,
  species text not null,
  gender text not null default 'UNKNOWN' check (gender in ('MALE', 'FEMALE', 'UNKNOWN')),
  relationship text not null,
  memorial_date date not null,
  profile_image_url text,
  introduction text,
  quest_started_at timestamptz not null default now(),
  quest_index integer not null default 1,
  is_quest_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pet_personalities (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets(id) on delete cascade,
  value text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.quests (
  id integer primary key,
  day integer not null unique check (day between 1 and 49),
  type text not null check (type in ('TEXT', 'TEXT_IMAGE')),
  content text not null
);

create table if not exists public.quest_answers (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  quest_id integer not null references public.quests(id),
  content text not null,
  image_url text,
  type text not null check (type in ('TEXT', 'TEXT_IMAGE')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pet_id, quest_id)
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  parent_letter_id uuid references public.letters(id),
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_answers (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade,
  source_type text not null check (source_type in ('quest_answer', 'letter')),
  source_id uuid not null,
  kind text not null check (kind in ('quest_text_reply', 'letter_text_reply', 'image_generation')),
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  prompt text,
  content text,
  image_path text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sentiment_summaries (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade unique,
  week1_result numeric,
  week2_result numeric,
  week3_result numeric,
  week4_result numeric,
  week5_result numeric,
  week6_result numeric,
  week7_result numeric,
  total_result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memorial_books (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  pet_id uuid not null references public.pets(id) on delete cascade unique,
  psychological_test_result text,
  is_open boolean not null default true,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.diaries (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  memorial_book_id uuid not null references public.memorial_books(id) on delete cascade,
  title text not null,
  content text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null check (kind in ('quest', 'letter', 'ai', 'system')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_jobs (
  id uuid primary key default gen_random_uuid(),
  app_user_id uuid not null references public.app_users(id) on delete cascade,
  notification_id uuid references public.notifications(id) on delete cascade,
  toss_user_key text,
  template_code text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'sent', 'skipped', 'failed')),
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists pets_app_user_id_idx on public.pets(app_user_id);
create index if not exists quest_answers_pet_id_idx on public.quest_answers(pet_id);
create index if not exists letters_pet_id_idx on public.letters(pet_id);
create index if not exists ai_answers_status_idx on public.ai_answers(status);
create index if not exists notifications_app_user_id_idx on public.notifications(app_user_id, created_at desc);
create index if not exists notification_jobs_status_idx on public.notification_jobs(status);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_app_users_updated_at on public.app_users;
create trigger touch_app_users_updated_at before update on public.app_users for each row execute function public.touch_updated_at();

drop trigger if exists touch_pets_updated_at on public.pets;
create trigger touch_pets_updated_at before update on public.pets for each row execute function public.touch_updated_at();

drop trigger if exists touch_quest_answers_updated_at on public.quest_answers;
create trigger touch_quest_answers_updated_at before update on public.quest_answers for each row execute function public.touch_updated_at();

drop trigger if exists touch_letters_updated_at on public.letters;
create trigger touch_letters_updated_at before update on public.letters for each row execute function public.touch_updated_at();

drop trigger if exists touch_ai_answers_updated_at on public.ai_answers;
create trigger touch_ai_answers_updated_at before update on public.ai_answers for each row execute function public.touch_updated_at();

alter table public.app_users enable row level security;
alter table public.pets enable row level security;
alter table public.pet_personalities enable row level security;
alter table public.quests enable row level security;
alter table public.quest_answers enable row level security;
alter table public.letters enable row level security;
alter table public.ai_answers enable row level security;
alter table public.sentiment_summaries enable row level security;
alter table public.memorial_books enable row level security;
alter table public.diaries enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_jobs enable row level security;

insert into storage.buckets (id, name, public)
values ('pet-images', 'pet-images', true), ('ai-images', 'ai-images', true)
on conflict (id) do nothing;

insert into public.quests (id, day, type, content) values
(1, 1, 'TEXT', '지금 마음에 가장 크게 남아 있는 감정을 적어주세요.'),
(2, 2, 'TEXT', '함께했던 반려동물이 가장 좋아하던 활동은 무엇이었나요?'),
(3, 3, 'TEXT_IMAGE', '함께 가고 싶은 장소를 적고, 떠오르는 장면이 있다면 사진 링크도 남겨주세요.'),
(4, 4, 'TEXT', '오늘 하루를 짧은 일기처럼 남겨주세요.'),
(5, 5, 'TEXT', '처음 만난 순간과 그때의 기분을 떠올려주세요.'),
(6, 6, 'TEXT', '아직 받아들이기 어려운 마음이 있다면 천천히 적어주세요.'),
(7, 7, 'TEXT', '이번 주 전체적인 기분을 날씨처럼 표현해주세요.'),
(8, 8, 'TEXT', '분노나 억울함이 있다면 누구에게 향해 있는지 적어주세요.'),
(9, 9, 'TEXT', '가장 좋아하던 음식과 그 음식을 떠올릴 때 드는 기억을 적어주세요.'),
(10, 10, 'TEXT_IMAGE', '어릴 적 모습을 떠올리며 귀여웠던 장면을 남겨주세요.'),
(11, 11, 'TEXT', '오늘의 일상을 한 문단으로 기록해주세요.'),
(12, 12, 'TEXT', '가장 좋아하던 장난감이나 물건은 무엇이었나요?'),
(13, 13, 'TEXT', '감정을 몸으로 풀었던 방법이 있다면 기록해주세요.'),
(14, 14, 'TEXT', '이번 주 감정의 변화를 지난주와 비교해보세요.'),
(15, 15, 'TEXT', '후회되는 장면이 있다면 그때 최선을 다했던 마음도 함께 적어주세요.'),
(16, 16, 'TEXT', '함께 가장 즐겁게 놀았던 순간은 언제였나요?'),
(17, 17, 'TEXT_IMAGE', '다시 함께 해보고 싶은 활동을 구체적으로 묘사해주세요.'),
(18, 18, 'TEXT', '오늘 있었던 일을 반려동물에게 말하듯 적어주세요.'),
(19, 19, 'TEXT', '함께 여행하거나 외출했던 기억 중 하나를 골라주세요.'),
(20, 20, 'TEXT', '원치 않는 일을 마주했을 때 버텼던 나만의 방법을 적어주세요.'),
(21, 21, 'TEXT', '이번 주의 마음을 하나의 색으로 표현하면 어떤 색인가요?'),
(22, 22, 'TEXT', '깊은 슬픔이 찾아오는 순간이 있다면 그 시간을 적어주세요.'),
(23, 23, 'TEXT', '가장 기억에 남는 선물이나 간식은 무엇이었나요?'),
(24, 24, 'TEXT', '가족이나 가까운 사람에게 나누고 싶은 말을 글로 정리해주세요.'),
(25, 25, 'TEXT', '오늘 하루 중 고마웠던 일을 하나 적어주세요.'),
(26, 26, 'TEXT', '반려동물이 나를 위로해줬다고 느꼈던 순간을 적어주세요.'),
(27, 27, 'TEXT', '오늘의 나에게 해주고 싶은 다정한 말을 남겨주세요.'),
(28, 28, 'TEXT', '이번 주 감정이 어떤 방향으로 움직였는지 적어주세요.'),
(29, 29, 'TEXT', '상실 이후 내 삶에서 새롭게 중요해진 것은 무엇인가요?'),
(30, 30, 'TEXT_IMAGE', '좋아하던 산책길이나 장소를 떠올리며 장면을 묘사해주세요.'),
(31, 31, 'TEXT', '반려동물을 주제로 짧은 시나 노래 한 구절을 적어주세요.'),
(32, 32, 'TEXT', '오늘의 일기를 조금 더 자세히 남겨주세요.'),
(33, 33, 'TEXT', '애칭이 있었다면 그 이름에 담긴 마음을 적어주세요.'),
(34, 34, 'TEXT', '함께 알고 지낸 사람들과 나누고 싶은 추억을 적어주세요.'),
(35, 35, 'TEXT', '이번 주를 지나오며 발견한 작은 회복의 신호를 적어주세요.'),
(36, 36, 'TEXT_IMAGE', '가장 좋아하는 사진 속 순간을 말로 설명해주세요.'),
(37, 37, 'TEXT_IMAGE', '함께했던 순간을 그림처럼 떠올리며 자세히 적어주세요.'),
(38, 38, 'TEXT', '친구에게 털어놓고 싶은 마음을 편지처럼 적어주세요.'),
(39, 39, 'TEXT', '오늘 하루에서 미소 지었던 순간이 있었다면 적어주세요.'),
(40, 40, 'TEXT_IMAGE', '캐리커처로 남기고 싶은 표정이나 모습을 설명해주세요.'),
(41, 41, 'TEXT', '요즘 나를 조금 편하게 해주는 취미나 루틴은 무엇인가요?'),
(42, 42, 'TEXT', '이번 주의 마음 날씨와 그 이유를 적어주세요.'),
(43, 43, 'TEXT', '함께한 시간이 지금의 나에게 남긴 의미는 무엇인가요?'),
(44, 44, 'TEXT', '영원별에서 어떻게 지내고 있을지 상상해보세요.'),
(45, 45, 'TEXT_IMAGE', '영원별의 모습을 이미지로 만들 수 있게 자세히 설명해주세요.'),
(46, 46, 'TEXT', '오늘 떠오른 기억과 그 기억이 준 감정을 적어주세요.'),
(47, 47, 'TEXT', '영원별에서 가장 편안하길 바라는 순간을 적어주세요.'),
(48, 48, 'TEXT', '주변 사람들과 나눈 위로 중 기억에 남는 말을 적어주세요.'),
(49, 49, 'TEXT', '49일의 기록을 마치며 지금의 나에게 남은 마음을 정리해주세요.')
on conflict (id) do update set
  day = excluded.day,
  type = excluded.type,
  content = excluded.content;
