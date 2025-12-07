import express from 'express';
import {
    reserveSeat,
    confirmBooking,
    cancelReservation,
    getAvailableSeats
} from '../controllers/seatReservationController.js';
import { manualCleanup } from '../jobs/cleanupExpiredReservations.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Reserve a seat (requires authentication)
router.post('/reserve', authenticateToken, reserveSeat);

// Confirm booking after payment (can be called by webhook or authenticated user)
router.post('/confirm', confirmBooking);

// Cancel a reservation
router.delete('/:reservation_id', authenticateToken, cancelReservation);

// Get available seats for an event
router.get('/available/:event_id', getAvailableSeats);

// Manual cleanup endpoint (for admin/testing)
router.post('/cleanup', manualCleanup);

export default router;
