begin;

create or replace function public.generate_found_reference()
returns text
language plpgsql
set search_path = ''
as $$
declare
  candidate text;
begin
  loop
    candidate := chr(65 + floor(random() * 26)::int)
      || chr(65 + floor(random() * 26)::int)
      || lpad(floor(random() * 10000)::int::text, 4, '0');
    exit when not exists (select 1 from public.found_reports where reference = candidate);
  end loop;
  return candidate;
end;
$$;

create table public.found_reports (
  id uuid primary key default gen_random_uuid(),
  reference text not null default public.generate_found_reference() unique,
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  reporter_display_name text not null default 'Homeward Paws member',
  animal_type text not null,
  description text not null default '',
  photo_path text not null,
  found_at timestamptz not null,
  province text not null,
  city text not null,
  suburb text not null,
  location_details text not null default '',
  status text not null default 'found' check (status in ('found','reunited','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint found_reference_format check (reference ~ '^[A-Z]{2}[0-9]{4}$'),
  constraint found_type_length check (char_length(trim(animal_type)) between 1 and 50),
  constraint found_description_length check (char_length(trim(description)) between 1 and 1000),
  constraint found_location_lengths check (
    char_length(trim(province)) between 1 and 80 and
    char_length(trim(city)) between 1 and 80 and
    char_length(trim(suburb)) between 1 and 80
  ),
  constraint found_location_details_length check (char_length(location_details) <= 1000)
);

create trigger found_reports_updated before update on public.found_reports
for each row execute function public.set_updated_at();

create or replace function public.set_found_reporter_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select coalesce(nullif(trim(profile.display_name), ''), 'Homeward Paws member')
  into new.reporter_display_name
  from public.profiles as profile
  where profile.id = new.reporter_id;
  return new;
end;
$$;

create trigger found_reporter_name before insert on public.found_reports
for each row execute function public.set_found_reporter_name();

alter table public.found_reports enable row level security;
create policy found_reports_public_read on public.found_reports
for select to anon, authenticated using (true);
create policy found_reports_reporter_insert on public.found_reports
for insert to authenticated with check (reporter_id = auth.uid());
create policy found_reports_reporter_update on public.found_reports
for update to authenticated using (reporter_id = auth.uid()) with check (reporter_id = auth.uid());

grant select on public.found_reports to anon, authenticated;
grant insert, update on public.found_reports to authenticated;

create policy found_report_photo_public_read on storage.objects
for select to anon, authenticated using (
  bucket_id = 'animal-photos' and exists (
    select 1 from public.found_reports where photo_path = storage.objects.name
  )
);

commit;
