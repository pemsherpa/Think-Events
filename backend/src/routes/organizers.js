import express from 'express';
import * as organizerController from '../controllers/organizerController.js';

const router = express.Router();

// Public routes
router.get('/', organizerController.getOrganizers);
router.get('/:id', organizerController.getOrganizerById);
router.get('/:id/events', organizerController.getOrganizerEvents);

export default router;
