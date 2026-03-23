import express from "express";
import { register, login, getProfile, getWishlist, addToWishlist, removeFromWishlist } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.get("/wishlist", protect, getWishlist);
router.post("/wishlist/add", protect, addToWishlist);
router.post("/wishlist/remove", protect, removeFromWishlist);

export default router;
