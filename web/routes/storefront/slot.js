import express from 'express';
import { getAvailableSlots } from '../../controllers/deliveryController.js';


const router = express.Router();

router.get('/', getAvailableSlots);

export default router;