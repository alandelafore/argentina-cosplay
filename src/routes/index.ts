import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import analyticsRoutes from "./analytics.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/analytics", analyticsRoutes);

router.get("/health", (_, res) => res.json({ status: "ok" }));

export default router;
