begin;

create or replace function public.sync_animal_main_photo_to_alerts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.photo_path is distinct from old.photo_path then
    update public.missing_alerts
    set photo_path = new.photo_path
    where animal_id = new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.sync_animal_main_photo_to_alerts() from public;

create trigger animals_sync_main_photo
after update of photo_path on public.animals
for each row execute function public.sync_animal_main_photo_to_alerts();

update public.missing_alerts as alert
set photo_path = animal.photo_path
from public.animals as animal
where alert.animal_id = animal.id
  and alert.photo_path is distinct from animal.photo_path;

commit;
