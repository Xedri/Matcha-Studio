-- Matcha Studio: run once on a new, dedicated Supabase project.
-- No secrets or real customer records are included. All prices in PHP.
begin;
create schema if not exists matcha_private;
revoke all on schema matcha_private from public, anon, authenticated;
grant usage on schema matcha_private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Customer' check (char_length(display_name) between 1 and 80),
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);
create table public.categories (name text primary key);
create table public.products (
  id uuid primary key default gen_random_uuid(), name text not null unique check (char_length(name) between 1 and 100),
  category text not null references public.categories(name),
  price integer not null check (price between 1 and 100000),
  description text not null default '', image text not null default 'product-placeholder.svg',
  status text not null default 'Available' check (status in ('Available','Sold-out')),
  created_at timestamptz not null default now()
);
create table public.orders (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id),
  customer_name text not null, total bigint not null check (total >= 0),
  order_type text not null check (order_type in ('Dine-in','Pick-up','Delivery')),
  status text not null default 'Pending' check (status in ('Pending','Preparing','Completed','Cancelled')),
  created_at timestamptz not null default now()
);
create table public.order_items (
  id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null, unit_price integer not null check (unit_price > 0),
  quantity integer not null check (quantity between 1 and 99)
);
create table public.bookings (
  id uuid primary key default gen_random_uuid(), customer_id uuid not null references auth.users(id),
  customer_name text not null, occasion text not null check (char_length(occasion) between 1 and 200),
  details text not null check (char_length(details) <= 500),
  status text not null default 'Pending' check (status in ('Pending','Confirmed','Declined')),
  created_at timestamptz not null default now()
);
create index matcha_orders_customer_idx on public.orders(customer_id);
create index matcha_order_items_order_idx on public.order_items(order_id);
create index matcha_bookings_customer_idx on public.bookings(customer_id);

-- A trusted database trigger creates customer profiles. Only a project owner can assign admin.
create function matcha_private.new_customer() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id,display_name,role) values(new.id,'Customer','customer') on conflict(id) do nothing;
  return new;
end; $$;
revoke all on function matcha_private.new_customer() from public,anon,authenticated;
create trigger matcha_auth_user_created after insert on auth.users for each row execute function matcha_private.new_customer();
insert into public.profiles(id) select id from auth.users on conflict(id) do nothing;

create function matcha_private.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin');
$$;
revoke all on function matcha_private.is_admin() from public,anon,authenticated;
grant execute on function matcha_private.is_admin() to authenticated;

-- Deny by default. Explicit table and column grants complement row-level policies.
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.bookings enable row level security;
revoke all on table public.profiles,public.categories,public.products,public.orders,public.order_items,public.bookings from public,anon,authenticated;
grant select on public.categories,public.products to anon,authenticated;
grant select on public.profiles,public.orders,public.order_items,public.bookings to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant insert,delete on public.products to authenticated;
grant update(name,category,price,description,image,status) on public.products to authenticated;
grant update(status) on public.orders,public.bookings to authenticated;

create policy profile_self_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profile_self_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy categories_public_read on public.categories for select to anon,authenticated using(true);
create policy products_public_read on public.products for select to anon,authenticated using(true);
create policy products_admin_insert on public.products for insert to authenticated with check((select matcha_private.is_admin()));
create policy products_admin_update on public.products for update to authenticated using((select matcha_private.is_admin())) with check((select matcha_private.is_admin()));
create policy products_admin_delete on public.products for delete to authenticated using((select matcha_private.is_admin()));
create policy orders_self_or_admin_read on public.orders for select to authenticated using(customer_id=(select auth.uid()) or (select matcha_private.is_admin()));
create policy orders_admin_update on public.orders for update to authenticated using((select matcha_private.is_admin())) with check((select matcha_private.is_admin()));
create policy items_self_or_admin_read on public.order_items for select to authenticated using(exists(select 1 from public.orders o where o.id=order_id and (o.customer_id=(select auth.uid()) or (select matcha_private.is_admin()))));
create policy bookings_self_or_admin_read on public.bookings for select to authenticated using(customer_id=(select auth.uid()) or (select matcha_private.is_admin()));
create policy bookings_admin_update on public.bookings for update to authenticated using((select matcha_private.is_admin())) with check((select matcha_private.is_admin()));

-- Orders are created atomically by trusted SQL. The browser cannot set totals, customer ID or status.
create function public.place_matcha_order(p_items jsonb,p_order_type text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); oid uuid; line record; item public.products%rowtype; display_name text; total_amount bigint := 0;
begin
  if uid is null or (select matcha_private.is_admin()) then raise exception 'Sign in as a customer'; end if;
  if p_order_type is null or p_order_type not in ('Dine-in','Pick-up','Delivery') then raise exception 'Invalid order type'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then raise exception 'Invalid cart'; end if;
  if jsonb_array_length(p_items) not between 1 and 30 then raise exception 'Invalid cart size'; end if;
  select p.display_name into display_name from public.profiles p where p.id=uid;
  if display_name is null then raise exception 'Customer profile missing'; end if;
  insert into public.orders(customer_id,customer_name,total,order_type) values(uid,display_name,0,p_order_type) returning id into oid;
  for line in select * from jsonb_to_recordset(p_items) as x(product_id uuid, quantity integer, expected_price integer) loop
    if line.product_id is null or line.quantity is null or line.quantity not between 1 and 99 then raise exception 'Invalid item'; end if;
    select * into item from public.products where id=line.product_id for share;
    if not found or item.status <> 'Available' then raise exception 'A product is no longer available'; end if;
    if line.expected_price is distinct from item.price then raise exception 'A product price has changed; review your cart'; end if;
    insert into public.order_items(order_id,product_id,product_name,unit_price,quantity) values(oid,item.id,item.name,item.price,line.quantity);
    total_amount := total_amount + item.price::bigint * line.quantity;
  end loop;
  update public.orders set total=total_amount where id=oid;
  return jsonb_build_object('id',oid,'total',total_amount);
end; $$;
revoke all on function public.place_matcha_order(jsonb,text) from public,anon,authenticated;
grant execute on function public.place_matcha_order(jsonb,text) to authenticated;

create function public.submit_matcha_booking(p_occasion text,p_details text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); bid uuid; display_name text;
begin
  if uid is null or (select matcha_private.is_admin()) then raise exception 'Sign in as a customer'; end if;
  if p_occasion is null or char_length(trim(p_occasion)) not between 1 and 200 or p_details is null or char_length(p_details)>500 then raise exception 'Invalid inquiry'; end if;
  select p.display_name into display_name from public.profiles p where p.id=uid;
  if display_name is null then raise exception 'Customer profile missing'; end if;
  insert into public.bookings(customer_id,customer_name,occasion,details) values(uid,display_name,trim(p_occasion),trim(p_details)) returning id into bid;
  return bid;
end; $$;
revoke all on function public.submit_matcha_booking(text,text) from public,anon,authenticated;
grant execute on function public.submit_matcha_booking(text,text) to authenticated;

insert into public.categories(name) values('Matcha'),('Tea'),('Pastries');
insert into public.products(name,category,price,description,image) values
('Ceremonial Matcha Latte','Matcha',165,'Ceremonial matcha whisked with silky milk.','https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=500&q=80'),
('Iced Strawberry Matcha','Matcha',185,'Fresh strawberry sweetness layered with creamy milk and matcha.','https://i.pinimg.com/736x/2f/54/1a/2f541a46d086d366dd3f226a6eec7291.jpg'),
('Matcha Espresso Fusion','Matcha',195,'Earthy matcha and bold espresso layered over creamy milk.','https://i.pinimg.com/736x/96/a1/9d/96a19d4353c8eebf2c96dbb023a9fd1a.jpg'),
('Hojicha Latte','Tea',160,'Rich roasted Japanese green tea blended with creamy milk.','https://i.pinimg.com/1200x/f8/4b/e7/f84be7206baddc3d0132d0aa61a62adb.jpg'),
('Yuzu Green Tea','Tea',155,'Refreshing green tea brightened with fragrant Japanese yuzu.','https://i.pinimg.com/1200x/24/e7/f1/24e7f1797bcdc99d67ba297fe8d90435.jpg'),
('Matcha Basque Cheesecake','Pastries',190,'Creamy matcha cheesecake with a caramelized Basque-style top.','https://i.pinimg.com/736x/55/ad/76/55ad76687970be4e4d4fc7ca81086029.jpg'),
('Matcha White Chocolate Cookie','Pastries',95,'Soft-baked matcha cookie with creamy white chocolate.','https://i.pinimg.com/1200x/ff/5b/40/ff5b407faff74f628c146d87ceacd45d.jpg'),
('Butter Croissant','Pastries',105,'Flaky, buttery golden croissant.','https://i.pinimg.com/736x/30/98/b3/3098b37993867ed5b37bd686d463ca4b.jpg');
commit;
