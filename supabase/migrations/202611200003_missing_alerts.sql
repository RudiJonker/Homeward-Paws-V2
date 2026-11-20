begin;

create or replace function public.generate_alert_reference()
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
    exit when not exists (select 1 from public.missing_alerts where reference = candidate);
  end loop;
  return candidate;
end;
$$;

create table public.missing_alerts (
  id uuid primary key default gen_random_uuid(),
  reference text not null default public.generate_alert_reference() unique,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  animal_id uuid references public.animals(id) on delete set null,
  animal_name text not null,
  animal_type text not null,
  description text not null default '',
  photo_path text,
  status text not null default 'missing' check (status in ('missing','reunited','closed')),
  last_seen_at timestamptz,
  last_seen_unknown boolean not null default false,
  province text not null,
  city text not null,
  suburb text not null,
  extra_details text not null default '',
  whatsapp_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint alert_reference_format check (reference ~ '^[A-Z]{2}[0-9]{4}$'),
  constraint alert_animal_name_length check (char_length(trim(animal_name)) between 1 and 80),
  constraint alert_animal_type_length check (char_length(trim(animal_type)) between 1 and 50),
  constraint alert_description_length check (char_length(description) <= 500),
  constraint alert_location_lengths check (
    char_length(trim(province)) between 1 and 80 and
    char_length(trim(city)) between 1 and 80 and
    char_length(trim(suburb)) between 1 and 80
  ),
  constraint alert_extra_details_length check (char_length(extra_details) <= 1000),
  constraint alert_last_seen_value check (last_seen_unknown or last_seen_at is not null)
);

create trigger missing_alerts_updated before update on public.missing_alerts
for each row execute function public.set_updated_at();

create table public.alert_follows (
  user_id uuid not null references public.profiles(id) on delete cascade,
  alert_reference text not null references public.missing_alerts(reference) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, alert_reference)
);

create table public.alert_sightings (
  id uuid primary key default gen_random_uuid(),
  alert_reference text not null references public.missing_alerts(reference) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  area text not null check (char_length(trim(area)) between 1 and 200),
  seen_when text not null check (char_length(trim(seen_when)) between 1 and 120),
  note text not null default '' check (char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

alter table public.missing_alerts enable row level security;
alter table public.alert_follows enable row level security;
alter table public.alert_sightings enable row level security;

create policy missing_alerts_public_read on public.missing_alerts
for select to anon, authenticated using (true);
create policy missing_alerts_owner_insert on public.missing_alerts
for insert to authenticated with check (
  owner_id = auth.uid() and (
    animal_id is null or exists (
      select 1 from public.animals as animal
      where animal.id = animal_id and animal.owner_id = auth.uid()
    )
  )
);
create policy missing_alerts_owner_update on public.missing_alerts
for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy alert_follows_owner_read on public.alert_follows
for select to authenticated using (user_id = auth.uid());
create policy alert_follows_owner_insert on public.alert_follows
for insert to authenticated with check (
  user_id = auth.uid() and exists (
    select 1 from public.missing_alerts as alert
    where alert.reference = alert_follows.alert_reference
      and alert.status = 'missing'
      and alert.owner_id <> auth.uid()
  )
);
create policy alert_follows_owner_delete on public.alert_follows
for delete to authenticated using (user_id = auth.uid());

create policy alert_sightings_participant_read on public.alert_sightings
for select to authenticated using (
  author_id = auth.uid() or exists (
    select 1 from public.missing_alerts as alert
    where alert.reference = alert_sightings.alert_reference and alert.owner_id = auth.uid()
  )
);
create policy alert_sightings_member_insert on public.alert_sightings
for insert to authenticated with check (
  author_id = auth.uid() and exists (
    select 1 from public.missing_alerts as alert
    where alert.reference = alert_sightings.alert_reference
      and alert.status = 'missing'
      and alert.owner_id <> auth.uid()
  )
);

grant select on public.missing_alerts to anon, authenticated;
grant insert, update on public.missing_alerts to authenticated;
grant select, insert, delete on public.alert_follows to authenticated;
grant select, insert on public.alert_sightings to authenticated;

create policy alert_photo_public_read on storage.objects
for select to anon, authenticated using (
  bucket_id = 'animal-photos' and exists (
    select 1 from public.missing_alerts
    where photo_path = storage.objects.name
  )
);

commit;
