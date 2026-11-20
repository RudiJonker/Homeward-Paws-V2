begin;

alter table public.profiles
  add column home_province text,
  add column home_city text,
  add column home_suburb text;

update public.profiles
set
  home_suburb = nullif(trim(split_part(home_area, ',', 1)), ''),
  home_city = nullif(trim(split_part(home_area, ',', 2)), ''),
  home_province = nullif(trim(substring(home_area from '^[^,]*,[^,]*,(.*)$')), '')
where home_area is not null;

alter table public.profiles
  add constraint home_province_length check (home_province is null or char_length(trim(home_province)) between 1 and 80),
  add constraint home_city_length check (home_city is null or char_length(trim(home_city)) between 1 and 80),
  add constraint home_suburb_length check (home_suburb is null or char_length(trim(home_suburb)) between 1 and 80);

commit;
