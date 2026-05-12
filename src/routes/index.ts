import { Router } from "express";
import authRoutes from "./auth.routes";
import productRoutes from "./product.routes";
import analyticsRoutes from "./analytics.routes";
import categoryRoutes from "./category.routes";
import cartRoutes from "./cart.routes";
import orderRoutes from "./order.routes";
import reviewRoutes from "./review.routes";
import disputeRoutes from "./dispute.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/disputes", disputeRoutes);
router.use("/admin", adminRoutes);
router.use("/analytics", analyticsRoutes);

router.get("/health", (_, res) => res.json({ status: "ok" }));

export default router;
