import express from 'express';
import {
    getAvailableSlots,
    getSettings,
    saveSettings,
} from '../controllers/deliveryController.js';

const router = express.Router();

router.post('/slots', getAvailableSlots);       // For frontend
router.get('/settings', getSettings);          // For admin UI
router.post('/settings', saveSettings);        // For admin UI

export default router;
