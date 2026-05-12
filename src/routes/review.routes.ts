import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createReview } from "../controllers/review.controller";

const router = Router();

router.use(authenticate);
router.post("/", createReview);

export default router;
