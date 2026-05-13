import express from "express";
import cors from "cors";
import path from "path";
import "express-async-errors";
import routes from "./routes";
import { ensureUploadDirectory } from "./controllers/upload.controller";

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";

export const app = express();

ensureUploadDirectory();

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.use("/api", routes);

app.use((err: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});
