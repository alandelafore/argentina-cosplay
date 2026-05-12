import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { createCategory, getCategory, listCategories } from "../controllers/category.controller";

const router = Router();

router.get("/", listCategories);
router.get("/:id", getCategory);
router.post("/", authenticate, authorize("ADMIN"), createCategory);

export default router;
