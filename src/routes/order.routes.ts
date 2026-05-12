import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { createOrder, getOrder, listOrders, updateOrderStatus } from "../controllers/order.controller";

const router = Router();

router.use(authenticate);
router.post("/", createOrder);
router.get("/", listOrders);
router.get("/:id", getOrder);
router.patch("/:id/status", authorize("ADMIN", "VENDEDOR"), updateOrderStatus);

export default router;
