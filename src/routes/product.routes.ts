import { Router } from "express";
import { listProducts, getProduct, createProduct } from "../controllers/product.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", authenticate, createProduct);

export default router;
