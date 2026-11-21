begin;

alter table public.missing_alerts
  add column owner_display_name text not null default 'Homeward Paws member'
    check (char_length(trim(owner_display_name)) between 1 and 80);

update public.missing_alerts as alert
set owner_display_name = coalesce(nullif(trim(profile.display_name), ''), 'Homeward Paws member')
from public.profiles as profile
where profile.id = alert.owner_id;

create or replace function public.set_alert_owner_display_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select coalesce(nullif(trim(profile.display_name), ''), 'Homeward Paws member')
  into new.owner_display_name
  from public.profiles as profile
  where profile.id = new.owner_id;

  new.owner_display_name := coalesce(new.owner_display_name, 'Homeward Paws member');
  return new;
end;
$$;

create trigger missing_alert_owner_display_name
before insert or update of owner_id on public.missing_alerts
for each row execute function public.set_alert_owner_display_name();

create or replace function public.sync_alert_owner_display_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.missing_alerts
  set owner_display_name = coalesce(nullif(trim(new.display_name), ''), 'Homeward Paws member')
  where owner_id = new.id;
  return new;
end;
$$;

create trigger profile_alert_owner_display_name
after update of display_name on public.profiles
for each row
when (old.display_name is distinct from new.display_name)
execute function public.sync_alert_owner_display_name();

revoke all on function public.set_alert_owner_display_name() from public;
revoke all on function public.sync_alert_owner_display_name() from public;

commit;
