import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";

export const prisma = new PrismaClient();

export async function connectDatabases() {
  const mongodbUri = process.env.MONGODB_URI;

  await prisma.$connect();
  console.log("Conectado a PostgreSQL");

  if (!mongodbUri) {
    console.warn("MONGODB_URI no definido; se omite la conexión a MongoDB");
    return;
  }

  try {
    await mongoose.connect(mongodbUri, {
      dbName: process.env.MONGODB_DB_NAME || "cosplay_analytics",
      autoIndex: true,
    });
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.warn("No se pudo conectar a MongoDB; se continúa sin MongoDB:", error);
  }
}
