# Argentina Cosplay

E-commerce de cosplays, props, calzado y artículos ñoños hechos por cosmakers independientes. Next.js + Supabase + envia.com.

## Stack

- **Next.js** (App Router) + **Tailwind** — frontend y rutas de API, deploy en Vercel.
- **Supabase** — Postgres (datos), Auth (login/sesión), Storage (imágenes). Un solo proveedor, free tier.
- **envia.com** — cotización de envíos.

## Backend (Supabase)

Ya existe un proyecto real creado y enlazado a este repo:

- Proyecto: **argentina-cosplay** (org "Argentina Cosplay"), región `sa-east-1` (São Paulo).
- Ref: `cdrdsfdggmiacojdlqlt` — dashboard: https://supabase.com/dashboard/project/cdrdsfdggmiacojdlqlt
- El esquema y las políticas de RLS viven como migraciones en [`supabase/migrations/`](supabase/migrations/) y ya están aplicadas en el proyecto remoto.

Para volver a aplicar el esquema (por ejemplo después de agregar una migración nueva) con la CLI de Supabase (ya instalada como dev dependency):

```bash
SUPABASE_ACCESS_TOKEN=<tu personal access token> npx supabase db push
```

El Personal Access Token se genera en https://supabase.com/dashboard/account/tokens y no debe commitearse — pasalo solo por variable de entorno al correr el comando. La contraseña de la base de datos se puede resetear desde **Project Settings → Database** si se pierde.

### Variables de entorno

`.env.local` ya tiene las credenciales reales del proyecto (URL, anon key, service role key) y el token de sandbox de envia.com — ese archivo está en `.gitignore` y nunca se commitea. `.env.example` queda como plantilla vacía para referencia.

La dirección de origen del envío **no** es una variable de entorno: cada vendedor la completa desde su propio panel (`/vendedor`), porque cada uno despacha desde su domicilio. Si un vendedor no la configuró todavía, la cotización de envío para sus productos falla con un mensaje claro en el carrito (y no afecta la cotización de los productos de otros vendedores en el mismo carrito).

### Correr en local

```bash
npm install
npm run dev
```

La app necesita las env vars completas para arrancar: el middleware (`src/proxy.ts`) valida la sesión en cada request, incluso en la home.

## Roles

Todo usuario se registra como `comprador` por defecto. Para convertir a alguien en `vendedor` (o `admin`), un admin existente puede hacerlo desde `/admin`. Para crear el primer admin: registrate normalmente y después cambiá tu propio rol a `admin` directamente en la tabla `profiles` desde el Table Editor de Supabase.

## Qué está armado

- Catálogo con filtro por categoría, franquicia/anime y talle (`/productos`).
- Ficha de producto con selector de talle y alta al carrito (`/productos/[slug]`).
- Carrito con cantidades, cotización de envío vía envia.com (un paquete por vendedor, cada uno desde su propio origen) y total (`/carrito`).
- Login / registro con Supabase Auth (`/login`, `/registro`).
- Perfil propio editable (nombre, bio, foto) + direcciones de envío (`/perfil`).
- Perfil público con rating y catálogo del vendedor (`/perfil/[id]`).
- Panel de vendedor: dirección de origen de envío + alta de productos con categoría, franquicia, talles y stock (`/vendedor`, `/vendedor/nuevo`).
- Panel de admin para asignar roles (`/admin`).
- Esquema de calificaciones (`ratings`) con trigger que actualiza el promedio del vendedor — falta la UI para calificar tras una compra.

## Qué falta (a propósito, fuera de este alcance inicial)

- Checkout real y cobro: el modelo de negocio va a retener un 15% de comisión por venta al vendedor; esa lógica de cobro/retención se definió explícitamente para una etapa posterior.
- Subida de imágenes de producto desde el panel de vendedor (la tabla `product_images` y el bucket `product-images` ya existen; falta el formulario).
- Dar de alta categorías/franquicias desde la UI (hoy se administran por SQL / Table Editor).
