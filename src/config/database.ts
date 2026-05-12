import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";

export const prisma = new PrismaClient();

export async function connectDatabases() {
  const mongodbUri = process.env.MONGODB_URI;

  if (!mongodbUri) {
    throw new Error("MONGODB_URI no está definido en el entorno");
  }

  await prisma.$connect();
  await mongoose.connect(mongodbUri, {
    dbName: process.env.MONGODB_DB_NAME || "cosplay_analytics",
    autoIndex: true,
  });

  console.log("Conectado a PostgreSQL y MongoDB");
}
