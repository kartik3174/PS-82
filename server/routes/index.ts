import { Router } from 'express';
import shipRoutes from './ship.routes';
// import alertRoutes from './alert.routes';
// import reportRoutes from './report.routes';
// import userRoutes from './user.routes';

const router = Router();

router.use('/ships', shipRoutes);
// router.use('/alerts', alertRoutes);
// router.use('/reports', reportRoutes);
// router.use('/users', userRoutes);

export default router;
