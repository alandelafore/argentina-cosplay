import { Router } from "express";
import { productMetrics, searchMetrics } from "../controllers/analytics.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/products", authenticate, productMetrics);
router.get("/search", authenticate, searchMetrics);

export default router;
