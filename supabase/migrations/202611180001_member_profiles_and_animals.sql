begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  mobile text,
  home_area text,
  avatar_path text,
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint display_name_length check (display_name is null or char_length(trim(display_name)) between 1 and 80),
  constraint home_area_length check (home_area is null or char_length(home_area) <= 120)
);

create table public.animals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  animal_type text not null check (char_length(trim(animal_type)) between 1 and 50),
  description text not null default '' check (char_length(description) <= 500),
  usual_area text not null check (char_length(trim(usual_area)) between 1 and 120),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now();return new;end$$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger animals_updated before update on public.animals for each row execute function public.set_updated_at();

create or replace function public.create_member_profile() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.profiles(id) values(new.id) on conflict do nothing;return new;end$$;
create trigger auth_user_profile after insert on auth.users for each row execute function public.create_member_profile();

alter table public.profiles enable row level security;
alter table public.animals enable row level security;
create policy profiles_owner_select on public.profiles for select to authenticated using(id=auth.uid());
create policy profiles_owner_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy animals_owner_all on public.animals for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
grant select,update on public.profiles to authenticated;
grant select,insert,update,delete on public.animals to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('avatars','avatars',false,2097152,array['image/jpeg','image/png','image/webp']),
('animal-photos','animal-photos',false,3145728,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy avatar_owner_all on storage.objects for all to authenticated using(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='avatars' and (storage.foldername(name))[1]=auth.uid()::text);
create policy animal_photo_owner_all on storage.objects for all to authenticated using(bucket_id='animal-photos' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='animal-photos' and (storage.foldername(name))[1]=auth.uid()::text);

commit;
