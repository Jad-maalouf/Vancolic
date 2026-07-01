-- Vancolic staff ordering system — schema.
-- Run this once in the Supabase SQL editor (or via `psql`) against a fresh project.
-- This project uses Supabase purely as a hosted Postgres database: no Supabase Auth,
-- no RLS, no Realtime. Access control is enforced entirely in the Express backend.

create extension if not exists pgcrypto;

create type user_role as enum ('manager', 'bartender', 'waiter');
create type order_status as enum ('open', 'paid', 'cancelled');
create type order_item_status as enum ('pending', 'preparing', 'served', 'cancelled');

create table users (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role user_role not null default 'waiter',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('spirits','wine_bubbles','cocktails','shots','beer','non_alcoholic')),
  subcategory text not null,
  name text not null,
  description text,
  bottle_price numeric(10,2),
  glass_price numeric(10,2),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint at_least_one_price check (bottle_price is not null or glass_price is not null)
);
create index menu_items_category_idx on menu_items (category, subcategory, sort_order);
create index menu_items_active_idx on menu_items (active);

create table restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  label text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references restaurant_tables(id) on delete restrict,
  client_name text,
  opened_by uuid not null references users(id),
  status order_status not null default 'open',
  closed_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);
create index orders_table_status_idx on orders (table_id, status);
create unique index one_open_order_per_table on orders (table_id) where (status = 'open');

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  menu_item_id uuid not null references menu_items(id),
  price_type text not null check (price_type in ('bottle','glass')),
  unit_price numeric(10,2) not null,
  quantity integer not null default 1 check (quantity > 0),
  status order_item_status not null default 'pending',
  ordered_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  served_at timestamptz
);
create index order_items_order_idx on order_items (order_id);
create index order_items_status_idx on order_items (status);

-- Keep updated_at current on every UPDATE.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger users_set_updated_at before update on users
  for each row execute function set_updated_at();
create trigger menu_items_set_updated_at before update on menu_items
  for each row execute function set_updated_at();
create trigger orders_set_updated_at before update on orders
  for each row execute function set_updated_at();
create trigger order_items_set_updated_at before update on order_items
  for each row execute function set_updated_at();

-- Stamp served_at the moment an order item's status flips to 'served'.
create or replace function set_served_at()
returns trigger language plpgsql as $$
begin
  if new.status = 'served' and old.status is distinct from 'served' then
    new.served_at = now();
  end if;
  return new;
end;
$$;
create trigger order_items_set_served_at before update on order_items
  for each row execute function set_served_at();

-- Stamp closed_at the moment an order is marked paid or cancelled.
create or replace function set_closed_at()
returns trigger language plpgsql as $$
begin
  if new.status in ('paid', 'cancelled') and old.status is distinct from new.status then
    new.closed_at = now();
  end if;
  return new;
end;
$$;
create trigger orders_set_closed_at before update on orders
  for each row execute function set_closed_at();

-- Running totals per order, queried by the backend (not exposed directly to the frontend).
create view order_totals as
select
  o.id as order_id,
  o.table_id,
  o.status as order_status,
  coalesce(sum(oi.unit_price * oi.quantity) filter (where oi.status <> 'cancelled'), 0) as total,
  count(oi.id) filter (where oi.status = 'pending') as pending_count,
  count(oi.id) filter (where oi.status = 'preparing') as preparing_count,
  max(oi.created_at) as last_item_at
from orders o
left join order_items oi on oi.order_id = o.id
group by o.id, o.table_id, o.status;

-- One row per table: its open order (if any) and running total, for the manager's "all tables" view.
create view table_overview as
select
  rt.id as table_id,
  rt.label,
  rt.active,
  o.id as open_order_id,
  o.client_name,
  o.opened_by,
  ot.total as running_total,
  ot.pending_count,
  ot.preparing_count
from restaurant_tables rt
left join orders o on o.table_id = rt.id and o.status = 'open'
left join order_totals ot on ot.order_id = o.id;
