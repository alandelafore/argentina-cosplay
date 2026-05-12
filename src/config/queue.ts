import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { SearchLog, ProductView } from "../models/mongo/analytics.models";

export const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

export const searchLogQueue = new Queue("searchLogs", { connection });
export const analyticsQueue = new Queue("analytics", { connection });

export async function registerQueues() {
  console.log("Queues registradas:", ["searchLogs", "analytics"].join(", "));
}

export function startQueueWorkers() {
  new Worker(
    "searchLogs",
    async (job: Job) => {
      if (job.name === "logSearch") {
        await SearchLog.create({
          query: job.data.query,
          filters: job.data.filters,
          results: job.data.results,
          userId: job.data.userId,
          ip: job.data.ip || "",
          createdAt: job.data.timestamp || new Date(),
        });
      }
    },
    { connection }
  );

  new Worker(
    "analytics",
    async (job: Job) => {
      if (job.name === "productView") {
        await ProductView.create({
          productId: job.data.productId,
          userId: job.data.userId,
          ip: job.data.ip || "",
          userAgent: job.data.userAgent || "",
          createdAt: job.data.createdAt || new Date(),
        });
      }
    },
    { connection }
  );

  console.log("Workers de analítica iniciados");
}
