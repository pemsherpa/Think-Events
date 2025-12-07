import cron from 'node-cron';
import { pool } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Cleanup expired seat reservations
 * Runs every minute to free up seats that weren't paid for
 */
export const cleanupExpiredReservations = async () => {
    try {
        const query = `
      UPDATE seat_reservations
      SET status = 'EXPIRED'
      WHERE status = 'PENDING'
        AND expires_at < NOW()
      RETURNING id, event_id, seat_number, user_id
    `;

        const result = await pool.query(query);

        if (result.rows.length > 0) {
            logger.info(`Cleaned up ${result.rows.length} expired reservations:`,
                result.rows.map(r => `Reservation ${r.id} (Event ${r.event_id}, Seat ${r.seat_number})`).join(', ')
            );
        }

        return result.rows.length;
    } catch (error) {
        logger.error('Error cleaning up expired reservations:', error);
        throw error;
    }
};

/**
 * Start the cron job
 * Runs every minute: '* * * * *'
 */
export const startReservationCleanupJob = () => {
    // Run every minute
    cron.schedule('* * * * *', async () => {
        try {
            await cleanupExpiredReservations();
        } catch (error) {
            logger.error('Reservation cleanup job failed:', error);
        }
    });

    logger.info('Seat reservation cleanup cron job started (runs every minute)');
};

/**
 * Manual cleanup function for testing or admin use
 */
export const manualCleanup = async (req, res) => {
    try {
        const count = await cleanupExpiredReservations();

        return res.status(200).json({
            success: true,
            message: `Cleaned up ${count} expired reservations`,
            count
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to cleanup expired reservations'
        });
    }
};
