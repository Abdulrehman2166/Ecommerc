import express from 'express';
import * as productCtrl from '../controllers/productController.js';
import * as auth from '../middleware/auth.js';

const router = express.Router();

// Import endpoint MUST come before /:id to avoid routing conflict
router.get('/import/dummy', productCtrl.importDummy);
router.get('/brands', productCtrl.getBrands);
router.get('/brands/:id', productCtrl.getBrand);
router.get('/compare', productCtrl.compareProducts);
router.get('/compare-search', productCtrl.compareSearch);

// General list endpoint
router.get('/', productCtrl.getProducts);

// Product by ID (must be last)
router.get('/:id', productCtrl.getProduct);

export default router;

