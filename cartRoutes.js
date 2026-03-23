import express from "express";
import {
    getCart,
    addToCart,
    updateCart,
    removeFromCart,
    clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.get("/", protect, getCart);
router.post("/", protect, addToCart);
router.put("/", protect, updateCart);
router.delete("/clear", protect, clearCart);
router.delete("/:id", protect, removeFromCart);

export default router;
