-- Bucket público para fotos de producto y de perfil.
-- Correr después de schema.sql.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Lectura pública de imágenes de producto"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "El vendedor sube sus propias imágenes de producto"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "El vendedor borra sus propias imágenes de producto"
  on storage.objects for delete
  using (bucket_id = 'product-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Lectura pública de avatares"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "El usuario sube su propio avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "El usuario reemplaza su propio avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
