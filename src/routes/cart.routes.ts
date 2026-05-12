import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { addCartItem, clearCart, getCart, removeCartItem } from "../controllers/cart.controller";

const router = Router();

router.use(authenticate);
router.get("/", getCart);
router.post("/items", addCartItem);
router.delete("/items/:itemId", removeCartItem);
router.delete("/clear", clearCart);

export default router;
