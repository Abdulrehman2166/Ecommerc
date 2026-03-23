import express from "express";
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getCategories,
    compareBrandsAI,
    aiSmartSearch,
    getExternalTrending,
    analyzeReviewAI,
    getProductDeals
} from "../controllers/productController.js";
import aiController from "../controllers/aiController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();
router.get("/trending", getExternalTrending); // FakestoreAPI endpoint
router.get("/", getProducts);
router.get("/categories", getCategories);
router.post("/ai-compare", compareBrandsAI);
router.post("/ai-search", aiSmartSearch);
router.get("/:id", getProduct);
router.post("/analyze-review", analyzeReviewAI);
router.get("/deals/best", getProductDeals);
router.post("/:id/analyze-quality", aiController.analyzeProductQuality);
router.get("/detect-locale", aiController.detectUserLocale);
router.get("/search-external", aiController.searchExternalShopping);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
