import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { listDisputes, openDispute, resolveDispute } from "../controllers/dispute.controller";

const router = Router();

router.use(authenticate);
router.get("/", listDisputes);
router.post("/", openDispute);
router.patch("/:id", authorize("ADMIN"), resolveDispute);

export default router;
