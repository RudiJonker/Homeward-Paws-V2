begin;

alter table public.animals
  add column home_province text,
  add column home_city text,
  add column home_suburb text,
  add column use_owner_location boolean not null default true;

update public.animals
set
  home_suburb = nullif(trim(split_part(usual_area, ',', 1)), ''),
  home_city = nullif(trim(split_part(usual_area, ',', 2)), ''),
  home_province = nullif(trim(regexp_replace(usual_area, '^[^,]*,?[^,]*,?', '')), ''),
  use_owner_location = false;

alter table public.animals
  add constraint animal_home_province_length check (home_province is null or char_length(trim(home_province)) between 1 and 80),
  add constraint animal_home_city_length check (home_city is null or char_length(trim(home_city)) between 1 and 80),
  add constraint animal_home_suburb_length check (home_suburb is null or char_length(trim(home_suburb)) between 1 and 80);

commit;
