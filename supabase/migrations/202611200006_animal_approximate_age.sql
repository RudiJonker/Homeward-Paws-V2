begin;

alter table public.animals
  add column approximate_age numeric(5,1),
  add column age_unit text;

alter table public.animals
  add constraint animal_approximate_age_value check (approximate_age is null or approximate_age > 0),
  add constraint animal_age_unit_value check (age_unit is null or age_unit in ('Months','Years')),
  add constraint animal_age_pair check (
    (approximate_age is null and age_unit is null) or
    (approximate_age is not null and age_unit is not null)
  );

commit;
