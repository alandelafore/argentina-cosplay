# Cosplay Marketplace

Aplicación backend full-stack para compra/venta de cosplays, pelucas, calzado y props.

## Stack inicial
- Node.js + TypeScript
- Express
- PostgreSQL + Prisma
- MongoDB + Mongoose
- Redis + BullMQ
- JWT + Refresh tokens

## Instalación

1. Copia `.env.example` a `.env` y ajusta la configuración.
2. Instala dependencias:

```bash
npm install
```

3. Genera Prisma Client y migra la base de datos:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

4. Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

## Estructura relevante
- `prisma/schema.prisma` — modelo relacional de PostgreSQL
- `src/config/database.ts` — conexiones a PostgreSQL y MongoDB
- `src/routes` — rutas de API
- `src/controllers` — controladores base
- `src/models/mongo` — esquemas de logs y métricas

## Siguientes pasos
- Implementar búsquedas avanzadas y filtros EAV.
- Conectar integraciones de pasarelas de pago y envíos.
- Agregar clientes frontend o GraphQL según sea necesario.
