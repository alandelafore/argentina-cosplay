import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379");

export const searchLogQueue = new Queue("searchLogs", { connection });
export const analyticsQueue = new Queue("analytics", { connection });

export async function registerQueues() {
  console.log("Queues registradas:", ["searchLogs", "analytics"].join(", "));
}
