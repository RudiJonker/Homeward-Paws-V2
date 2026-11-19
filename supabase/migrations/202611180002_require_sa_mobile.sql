begin;

update public.profiles
set profile_completed = false
where profile_completed = true
  and (mobile is null or mobile !~ '^0[6-8][0-9]{8}$');

alter table public.profiles
  add constraint completed_profile_has_sa_mobile
  check (not profile_completed or mobile ~ '^0[6-8][0-9]{8}$');

commit;
