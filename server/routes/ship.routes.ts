import { Router } from 'express';
import * as shipController from '../controllers/ship.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', shipController.getShips);
router.post('/analyze', shipController.analyzeShip);
router.post('/predict-future', shipController.predictFuture);

export default router;
