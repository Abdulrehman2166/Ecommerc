import express from 'express';
import * as reviewCtrl from '../controllers/reviewController.js';
import * as auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', reviewCtrl.createReview);
router.get('/brand/:brandId', reviewCtrl.getBrandReviews);

export default router;
