-- Replaces the old plain "spouse_first" yes/no with a proper three-way
-- choice, so a blended-family customer can protect their own children's
-- inheritance instead of leaving everything outright to a partner who could
-- then redirect it to their own children in a later Will of their own.
alter table public.residuary_settings add column if not exists spouse_mode text;

-- Migrate existing rows: true -> outright, false/null -> off.
update public.residuary_settings set spouse_mode = case when spouse_first then 'outright' else 'off' end
where spouse_mode is null;

alter table public.residuary_settings alter column spouse_mode set default 'off';
alter table public.residuary_settings alter column spouse_mode set not null;

alter table public.residuary_settings drop constraint if exists residuary_settings_spouse_mode_check;
alter table public.residuary_settings add constraint residuary_settings_spouse_mode_check
  check (spouse_mode in ('off', 'outright', 'life_interest'));
