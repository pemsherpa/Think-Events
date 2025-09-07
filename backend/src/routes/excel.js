import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as excelController from '../controllers/excelController.js';

const router = express.Router();

// All Excel sync routes require authentication (admin/organizer only)
router.use(authenticateToken);

// Manual sync endpoint
router.post('/sync', excelController.manualSync);

// Get sync status
router.get('/status', excelController.getSyncStatus);

// Start watching Excel file
router.post('/watch/start', excelController.startWatching);

// Stop watching Excel file
router.post('/watch/stop', excelController.stopWatching);

export default router;
