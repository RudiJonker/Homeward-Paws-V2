begin;

create table public.found_report_contacts (
  id uuid primary key default gen_random_uuid(),
  report_reference text not null references public.found_reports(reference) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  contact_status text not null default 'pending' check (contact_status in ('pending','accepted','declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (report_reference, requester_id)
);

create trigger found_report_contacts_updated before update on public.found_report_contacts
for each row execute function public.set_updated_at();

alter table public.found_report_contacts enable row level security;
create policy found_contacts_participant_read on public.found_report_contacts
for select to authenticated using (
  requester_id = auth.uid() or exists (
    select 1 from public.found_reports as report
    where report.reference = report_reference and report.reporter_id = auth.uid()
  )
);
create policy found_contacts_requester_insert on public.found_report_contacts
for insert to authenticated with check (
  requester_id = auth.uid() and exists (
    select 1 from public.found_reports as report
    where report.reference = report_reference
      and report.reporter_id <> auth.uid()
      and report.status = 'found'
  )
);

grant select, insert on public.found_report_contacts to authenticated;

create or replace function public.get_found_contact_request(p_request_id uuid)
returns table (
  request_id uuid,
  report_reference text,
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
    request.id,
    report.reference,
    report.animal_type || ' found report',
    'found_claim',
    coalesce(nullif(trim(profile.display_name), ''), 'Homeward Paws member'),
    concat_ws(', ', nullif(trim(profile.home_suburb), ''), nullif(trim(profile.home_city), ''), nullif(trim(profile.home_province), '')),
    request.contact_status,
    case when request.contact_status = 'accepted' then profile.mobile else null end
  from public.found_report_contacts as request
  join public.found_reports as report on report.reference = request.report_reference
  join public.profiles as profile on profile.id = request.requester_id
  where request.id = p_request_id and report.reporter_id = auth.uid();
$$;

create or replace function public.respond_to_found_contact(p_request_id uuid, p_response text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed_rows integer;
begin
  if p_response not in ('accepted','declined') then raise exception 'Invalid contact response'; end if;
  update public.found_report_contacts as request
  set contact_status = p_response
  from public.found_reports as report
  where request.id = p_request_id
    and report.reference = request.report_reference
    and report.reporter_id = auth.uid()
    and request.contact_status = 'pending';
  get diagnostics changed_rows = row_count;
  if changed_rows <> 1 then raise exception 'Contact request is unavailable'; end if;
end;
$$;

revoke all on function public.get_found_contact_request(uuid) from public;
revoke all on function public.respond_to_found_contact(uuid,text) from public;
grant execute on function public.get_found_contact_request(uuid) to authenticated;
grant execute on function public.respond_to_found_contact(uuid,text) to authenticated;

commit;
