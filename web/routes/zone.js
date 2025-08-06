import express from 'express';
import { getZones, saveZone, deleteZone } from '../controllers/zoneController.js';

const router = express.Router();

router.get('/', getZones);
router.post('/', saveZone);
router.delete('/:id', deleteZone);

export default router;
