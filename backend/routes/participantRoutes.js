import express from 'express';
import { getDashboardData, registerSport, getTieSheet } from '../controllers/participantController.js';

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.use(isAuthenticated);

router.get('/dashboard', getDashboardData);
router.post('/register', registerSport);
router.get('/tiesheet', getTieSheet);

export default router;
