import dotenv from "dotenv";
import { app } from "./app";
import { connectDatabases } from "./config/database";
// import { registerQueues, startQueueWorkers } from "./config/queue";
import { registerGraphQL } from "./graphql/server";

dotenv.config();

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  await connectDatabases();
  // await registerQueues();
  await registerGraphQL(app);
  // startQueueWorkers();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
