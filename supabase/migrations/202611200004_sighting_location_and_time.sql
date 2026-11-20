begin;

alter table public.alert_sightings
  add column province text,
  add column city text,
  add column suburb text,
  add column location_details text not null default '',
  add column seen_at timestamptz;

alter table public.alert_sightings
  add constraint sighting_province_length check (province is null or char_length(trim(province)) between 1 and 80),
  add constraint sighting_city_length check (city is null or char_length(trim(city)) between 1 and 80),
  add constraint sighting_suburb_length check (suburb is null or char_length(trim(suburb)) between 1 and 80),
  add constraint sighting_location_details_length check (char_length(location_details) <= 300);

commit;
