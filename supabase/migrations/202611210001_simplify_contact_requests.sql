begin;

drop policy alert_sightings_member_insert on public.alert_sightings;
create policy alert_sightings_member_insert on public.alert_sightings
for insert to authenticated with check (
  author_id = auth.uid() and exists (
    select 1 from public.missing_alerts as alert
    where alert.reference = alert_sightings.alert_reference
      and alert.status = 'missing'
      and alert.owner_id <> auth.uid()
  )
);

create or replace function public.get_sighting_contact_request(p_sighting_id uuid)
returns table (
  sighting_id uuid,
  alert_reference text,
  animal_name text,
  response_type text,
  requester_name text,
  requester_area text,
  contact_status text,
  mobile text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    sighting.id,
    alert.reference,
    alert.animal_name,
    sighting.response_type,
    coalesce(nullif(trim(profile.display_name), ''), 'Homeward Paws member'),
    concat_ws(', ', nullif(trim(profile.home_suburb), ''), nullif(trim(profile.home_city), ''), nullif(trim(profile.home_province), '')),
    sighting.contact_status,
    case when sighting.contact_status = 'accepted' then profile.mobile else null end
  from public.alert_sightings as sighting
  join public.missing_alerts as alert on alert.reference = sighting.alert_reference
  join public.profiles as profile on profile.id = sighting.author_id
  where sighting.id = p_sighting_id
    and alert.owner_id = auth.uid()
    and sighting.whatsapp_requested;
$$;

create or replace function public.respond_to_sighting_contact(p_sighting_id uuid, p_response text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_rows integer;
begin
  if p_response not in ('accepted', 'declined') then
    raise exception 'Invalid contact response';
  end if;

  update public.alert_sightings as sighting
  set contact_status = p_response
  from public.missing_alerts as alert
  where sighting.id = p_sighting_id
    and alert.reference = sighting.alert_reference
    and alert.owner_id = auth.uid()
    and sighting.whatsapp_requested
    and sighting.contact_status = 'pending';

  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then
    raise exception 'Contact request is unavailable';
  end if;
end;
$$;

revoke all on function public.get_sighting_contact_request(uuid) from public;
revoke all on function public.respond_to_sighting_contact(uuid, text) from public;
grant execute on function public.get_sighting_contact_request(uuid) to authenticated;
grant execute on function public.respond_to_sighting_contact(uuid, text) to authenticated;

commit;
