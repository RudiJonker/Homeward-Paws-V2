begin;

alter table public.animals
  add column photo_paths text[] not null default '{}',
  add column breed text not null default '',
  add column colours text[] not null default '{}',
  add column sex text,
  add column identifiable_features text not null default '',
  add column has_medical_requirements boolean not null default false,
  add column medical_requirements text not null default '',
  add column chipped boolean not null default false,
  add column approach_guidance text;

update public.animals
set photo_paths = array[photo_path]
where photo_path is not null and cardinality(photo_paths) = 0;

alter table public.animals
  add constraint animal_photo_count check (cardinality(photo_paths) <= 3),
  add constraint animal_breed_length check (char_length(breed) <= 100),
  add constraint animal_colour_count check (cardinality(colours) <= 10),
  add constraint animal_sex_value check (sex is null or sex in ('Male','Female')),
  add constraint animal_identifiable_features_length check (char_length(identifiable_features) <= 1000),
  add constraint animal_medical_requirements_length check (char_length(medical_requirements) <= 1000),
  add constraint animal_medical_requirements_value check (has_medical_requirements or medical_requirements = ''),
  add constraint animal_approach_guidance_value check (approach_guidance is null or approach_guidance in ('safe','caution'));

commit;
