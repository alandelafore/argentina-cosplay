import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { suspendUser, updateProductStatus } from "../controllers/admin.controller";

const router = Router();

router.use(authenticate, authorize("ADMIN"));
router.post("/users/:id/suspend", suspendUser);
router.post("/products/:id/status", updateProductStatus);

export default router;
