# Database Seeders

Este directorio contiene los scripts para poblar la base de datos con datos dummy para desarrollo y testing.

## Archivos

- `index.ts` - Script principal que ejecuta todos los seeders
- `users.seeder.ts` - Crea usuarios de prueba (admin, vendedores, compradores)
- `categories.seeder.ts` - Crea categorías y subcategorías de productos
- `products.seeder.ts` - Crea productos con imágenes dummy
- `clear.seeder.ts` - Limpia la base de datos

## Cómo usar

### Ejecutar seeders (agrega datos sin borrar existentes)

```bash
npm run db:seed
```

### Ejecutar seeders con base de datos limpia (recomendado)

```bash
npm run db:seed:fresh
```

## Datos creados

### 👥 Usuarios (6 total)

**Admin:**
- Email: `admin@cosplay.com`
- Password: `password123`
- Roles: ADMIN, VENDEDOR

**Vendedores (2):**
- `vendedor1@cosplay.com` - María García
- `vendedor2@cosplay.com` - Carlos López
- Password: `password123`

**Compradores (3):**
- `comprador1@cosplay.com` - Ana Martínez
- `comprador2@cosplay.com` - Juan Pérez
- `comprador3@cosplay.com` - Laura Rodríguez
- Password: `password123`

### 📂 Categorías (6 principales + subcategorías)

- Pelucas (Largas, Cortas, Anime, Color)
- Lentes de Contacto (Color, Cosplay, Anime)
- Vestuario (Trajes Completos, Blusas, Faldas, Accesorios)
- Calzado (Botas, Zapatillas, Sandalias, Especial)
- Accesorios (Joyas, Aretes, Pulseras, Otros)
- Props y Armas (Espadas, Varitas, Escudos, Otros)

### 🛍️ Productos (10 productos variados)

Productos realistas de cosplay con:
- Precios en pesos argentinos
- Condiciones (NUEVO/USADO)
- Stock variable
- Imágenes desde Unsplash (URLs externas)
- Tags relevantes
- Descripciones detalladas

## Imágenes

Las imágenes de productos usan URLs de Unsplash para evitar archivos grandes en el repositorio. En producción, estas serían reemplazadas por imágenes subidas por los usuarios.

## Notas importantes

1. **Ejecuta primero las migraciones de Prisma** antes de los seeders:
   ```bash
   npm run prisma:migrate
   ```

2. **Las contraseñas están hasheadas** con bcrypt, pero todas usan la misma contraseña de prueba.

3. **Los seeders son idempotentes** - puedes ejecutarlos múltiples veces sin crear duplicados.

4. **Para desarrollo local**, ejecuta `npm run db:seed:fresh` para tener una base de datos limpia con datos de prueba.

## Testing

Con estos datos puedes probar:
- Login con diferentes roles
- Navegación del catálogo
- Creación de productos (como vendedor)
- Sistema de carrito (como comprador)
- Funcionalidades de admin