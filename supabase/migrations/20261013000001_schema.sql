-- Argentina Cosplay — esquema inicial
-- Pegar en el SQL editor de un proyecto nuevo de Supabase.

create type user_role as enum ('comprador', 'vendedor', 'admin');
create type product_status as enum ('draft', 'active', 'paused');
create type order_status as enum ('pending', 'paid', 'shipped', 'delivered', 'cancelled');

-- Perfiles (1:1 con auth.users). Se crea automáticamente via trigger al registrarse.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'comprador',
  display_name text not null,
  bio text,
  avatar_url text,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table franchises (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null
);

create table sizes (
  id uuid primary key default gen_random_uuid(),
  label text not null unique, -- incluye "Único" para props/accesorios sin talle
  sort_order integer not null default 0
);

create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references profiles(id) on delete cascade,
  category_id uuid not null references categories(id),
  franchise_id uuid references franchises(id),
  slug text not null unique,
  title text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  status product_status not null default 'draft',
  -- usados para cotizar el envío con envia.com
  weight_grams integer not null default 500,
  length_cm integer not null default 20,
  width_cm integer not null default 20,
  height_cm integer not null default 10,
  created_at timestamptz not null default now()
);

create table product_sizes (
  product_id uuid not null references products(id) on delete cascade,
  size_id uuid not null references sizes(id),
  stock integer not null default 0 check (stock >= 0),
  primary key (product_id, size_id)
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null, -- path dentro del bucket "product-images"
  position integer not null default 0
);

create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  nombre_completo text not null,
  calle text not null,
  numero text not null,
  ciudad text not null,
  provincia text not null,
  codigo_postal text not null,
  telefono text not null,
  created_at timestamptz not null default now()
);

create table cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  size_id uuid references sizes(id),
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id, size_id)
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references profiles(id),
  status order_status not null default 'pending',
  shipping_address_id uuid not null references addresses(id),
  subtotal_cents integer not null,
  shipping_cents integer not null,
  total_cents integer not null,
  envia_shipment_id text, -- id de la cotización/guía creada en envia.com
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  seller_id uuid not null references profiles(id),
  size_id uuid references sizes(id),
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null,
  -- comisión de la plataforma, calculada al momento de la venta (15% sobre el producto)
  commission_cents integer not null default 0
);

create table ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  rater_id uuid not null references profiles(id),
  seller_id uuid not null references profiles(id),
  score smallint not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (order_id, seller_id, rater_id)
);

-- Crea el perfil automáticamente cuando alguien se registra en auth.users
create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Mantiene rating_avg / rating_count en profiles al insertar una calificación
create function handle_new_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update profiles
  set
    rating_count = rating_count + 1,
    rating_avg = (rating_avg * rating_count + new.score) / (rating_count + 1)
  where id = new.seller_id;
  return new;
end;
$$;

create trigger on_rating_created
  after insert on ratings
  for each row execute procedure handle_new_rating();

-- Row Level Security
alter table profiles enable row level security;
alter table categories enable row level security;
alter table franchises enable row level security;
alter table sizes enable row level security;
alter table products enable row level security;
alter table product_sizes enable row level security;
alter table product_images enable row level security;
alter table addresses enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table ratings enable row level security;

create policy "Perfiles públicos de lectura" on profiles for select using (true);
create policy "El usuario edita su propio perfil" on profiles for update using (auth.uid() = id);
create policy "El admin edita cualquier perfil" on profiles for update
  using (exists (select 1 from profiles me where me.id = auth.uid() and me.role = 'admin'));

create policy "Catálogo público de lectura" on categories for select using (true);
create policy "Catálogo público de lectura" on franchises for select using (true);
create policy "Catálogo público de lectura" on sizes for select using (true);

create policy "Productos activos son públicos" on products for select
  using (status = 'active' or seller_id = auth.uid());
create policy "El vendedor gestiona sus productos" on products for all
  using (seller_id = auth.uid()) with check (seller_id = auth.uid());

create policy "Tallas visibles si el producto es visible" on product_sizes for select
  using (exists (select 1 from products p where p.id = product_id and (p.status = 'active' or p.seller_id = auth.uid())));
create policy "El vendedor gestiona el stock por talla" on product_sizes for all
  using (exists (select 1 from products p where p.id = product_id and p.seller_id = auth.uid()));

create policy "Imágenes visibles si el producto es visible" on product_images for select
  using (exists (select 1 from products p where p.id = product_id and (p.status = 'active' or p.seller_id = auth.uid())));
create policy "El vendedor gestiona sus imágenes" on product_images for all
  using (exists (select 1 from products p where p.id = product_id and p.seller_id = auth.uid()));

create policy "El usuario gestiona sus direcciones" on addresses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "El usuario gestiona su carrito" on cart_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "El comprador ve sus pedidos" on orders for select using (buyer_id = auth.uid());
create policy "El comprador crea sus pedidos" on orders for insert with check (buyer_id = auth.uid());

create policy "Comprador y vendedor ven sus líneas de pedido" on order_items for select
  using (
    seller_id = auth.uid()
    or exists (select 1 from orders o where o.id = order_id and o.buyer_id = auth.uid())
  );

create policy "Calificaciones públicas de lectura" on ratings for select using (true);
create policy "El comprador califica tras una compra" on ratings for insert
  with check (
    rater_id = auth.uid()
    and exists (
      select 1 from orders o
      join order_items oi on oi.order_id = o.id
      where o.id = order_id and o.buyer_id = auth.uid() and oi.seller_id = ratings.seller_id
    )
  );

-- Datos base para arrancar
insert into sizes (label, sort_order) values
  ('Único', 0), ('XS', 1), ('S', 2), ('M', 3), ('L', 4), ('XL', 5), ('XXL', 6);

insert into categories (slug, name) values
  ('calzado', 'Calzado'),
  ('buzos-remeras', 'Buzos y remeras'),
  ('props', 'Props'),
  ('accesorios', 'Accesorios'),
  ('pelucas', 'Pelucas'),
  ('cosplay-completo', 'Cosplay completo');
