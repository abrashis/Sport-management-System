import express from 'express';
import { getNotifications, saveToken } from '../controllers/notificationController.js';

const router = express.Router();

const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
};

router.get('/', isAuthenticated, getNotifications);
router.post('/token', isAuthenticated, saveToken);

export default router;
