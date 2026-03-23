import express from "express";
import {
    getDashboard,
    getAllOrders,
    updateOrderStatus,
    getAllUsers,
    deleteUser,
    getAllProducts,
    createProduct,
    deleteProduct,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, adminOnly);

router.get("/dashboard", getDashboard);
router.get("/orders", getAllOrders);
router.put("/orders/:id", updateOrderStatus);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.get("/products", getAllProducts);
router.post("/products", createProduct);
router.delete("/products/:id", deleteProduct);

export default router;
