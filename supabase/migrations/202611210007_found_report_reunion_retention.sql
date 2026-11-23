begin;

alter table public.found_reports
  add column reunited_at timestamptz;

alter table public.found_reports
  add constraint found_reunion_timestamp check (
    (status = 'reunited' and reunited_at is not null) or
    (status <> 'reunited' and reunited_at is null)
  );

commit;
