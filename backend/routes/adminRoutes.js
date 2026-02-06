import express from 'express';
import {
    getDashboardStats, getSports, createSport, updateSport, deleteSport,
    getRegistrations, updateRegistrationStatus, generateTieSheet, getMatches, updateMatchVisibility
} from '../controllers/adminController.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.userId && req.session.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: Admin only' });
    }
};

router.use(isAdmin);

router.get('/stats', getDashboardStats);
router.get('/sports', getSports);
router.post('/sports', createSport);
router.put('/sports/:id', updateSport);
router.delete('/sports/:id', deleteSport);

router.get('/registrations', getRegistrations);
router.put('/registrations/:type/:id', updateRegistrationStatus);

router.post('/draw', generateTieSheet);
router.get('/matches', getMatches);
router.put('/matches/:id/visibility', updateMatchVisibility);

export default router;
