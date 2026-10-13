-- Dirección de origen de envío de cada vendedor (desde dónde despacha sus pedidos).
-- Vive en profiles porque es 1:1 con el vendedor; en compradores queda en null.

alter table profiles
  add column origin_nombre_contacto text,
  add column origin_calle text,
  add column origin_numero text,
  add column origin_ciudad text,
  add column origin_provincia text,
  add column origin_codigo_postal text,
  add column origin_telefono text;
