-- Run in the Supabase SQL Editor ONLY after creating your own admin user.
-- Replace the placeholder with the exact User UID from Authentication > Users.
-- Do not share an admin password and never add public demo-admin credentials.
update public.profiles
set role = 'admin', display_name = 'Admin'
where id = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid;

-- Verify the single account you intended to promote.
select id, display_name, role from public.profiles where id = 'REPLACE_WITH_ADMIN_USER_UUID'::uuid;
