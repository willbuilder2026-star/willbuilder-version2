-- Stage 5 (Property) now asks a Scotland-specific question about title and
-- survivorship/special destinations, instead of reusing the England & Wales
-- "joint tenants / tenants in common" terminology, which doesn't apply the
-- same way in Scotland. This column only gets used when the Will's
-- jurisdiction is Scotland; it stays empty for England & Wales / Northern
-- Ireland properties.
alter table public.properties add column if not exists scotland_title_position text;

alter table public.properties drop constraint if exists properties_scotland_title_position_check;
alter table public.properties add constraint properties_scotland_title_position_check
  check (scotland_title_position is null or scotland_title_position in ('sole', 'joint_survivorship', 'joint_no_survivorship', 'not_sure'));
