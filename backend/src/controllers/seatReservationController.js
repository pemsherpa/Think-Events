import { pool } from '../config/database.js';
import logger from '../utils/logger.js';

/**
 * Reserve a seat with transaction and row-level locking
 * Implements "Reserve-then-Commit" strategy to prevent race conditions
 */
export const reserveSeat = async (req, res) => {
    const { event_id, seat_number } = req.body;
    const user_id = req.user.id;

    // Validation
    if (!event_id || !seat_number) {
        return res.status(400).json({
            success: false,
            message: 'Event ID and seat number are required'
        });
    }

    const client = await pool.connect();

    try {
        // Start transaction
        await client.query('BEGIN');

        // CRITICAL: Lock the seat row to prevent concurrent bookings
        // This query will wait if another transaction has locked this seat
        const lockQuery = `
      SELECT id, status, expires_at
      FROM seat_reservations
      WHERE event_id = $1 
        AND seat_number = $2 
        AND status IN ('PENDING', 'BOOKED')
      FOR UPDATE NOWAIT
    `;

        let existingReservation;
        try {
            const lockResult = await client.query(lockQuery, [event_id, seat_number]);
            existingReservation = lockResult.rows[0];
        } catch (lockError) {
            // NOWAIT throws error if row is locked by another transaction
            if (lockError.code === '55P03') {
                await client.query('ROLLBACK');
                return res.status(409).json({
                    success: false,
                    message: 'This seat is currently being reserved by another user. Please try again.'
                });
            }
            throw lockError;
        }

        // Check if seat is already taken
        if (existingReservation) {
            const now = new Date();
            const expiresAt = new Date(existingReservation.expires_at);

            // If BOOKED or PENDING and not expired, seat is unavailable
            if (existingReservation.status === 'BOOKED' ||
                (existingReservation.status === 'PENDING' && expiresAt > now)) {
                await client.query('ROLLBACK');
                return res.status(409).json({
                    success: false,
                    message: 'This seat is already reserved or booked'
                });
            }

            // If PENDING and expired, we can proceed (will be cleaned up by cron)
        }

        // Calculate expiration time (10 minutes from now)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // Create the reservation
        const insertQuery = `
      INSERT INTO seat_reservations (
        event_id, seat_number, user_id, status, expires_at
      ) VALUES ($1, $2, $3, 'PENDING', $4)
      RETURNING id, expires_at
    `;

        const insertResult = await client.query(insertQuery, [
            event_id,
            seat_number,
            user_id,
            expiresAt
        ]);

        const reservation = insertResult.rows[0];

        // Commit transaction
        await client.query('COMMIT');

        logger.info(`Seat reserved: Event ${event_id}, Seat ${seat_number}, User ${user_id}, Reservation ${reservation.id}`);

        return res.status(201).json({
            success: true,
            message: 'Seat reserved successfully',
            data: {
                reservationId: reservation.id,
                eventId: event_id,
                seatNumber: seat_number,
                status: 'PENDING',
                expiresAt: reservation.expires_at,
                expiresIn: 600 // seconds
            }
        });

    } catch (error) {
        // Rollback on any error
        await client.query('ROLLBACK');

        logger.error('Error reserving seat:', error);

        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'This seat is already reserved or booked'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Failed to reserve seat. Please try again.'
        });
    } finally {
        client.release();
    }
};

/**
 * Confirm booking after successful payment
 * Called by payment webhook or payment confirmation endpoint
 */
export const confirmBooking = async (req, res) => {
    const { reservation_id, booking_id, payment_reference } = req.body;

    if (!reservation_id) {
        return res.status(400).json({
            success: false,
            message: 'Reservation ID is required'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Lock and fetch the reservation
        const selectQuery = `
      SELECT id, status, expires_at, user_id, event_id, seat_number
      FROM seat_reservations
      WHERE id = $1
      FOR UPDATE
    `;

        const result = await client.query(selectQuery, [reservation_id]);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: 'Reservation not found'
            });
        }

        const reservation = result.rows[0];

        // Check if reservation is still valid
        if (reservation.status !== 'PENDING') {
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: `Cannot confirm reservation with status: ${reservation.status}`
            });
        }

        // Check if reservation has expired
        const now = new Date();
        const expiresAt = new Date(reservation.expires_at);

        if (expiresAt < now) {
            // Mark as expired
            await client.query(
                'UPDATE seat_reservations SET status = $1 WHERE id = $2',
                ['EXPIRED', reservation_id]
            );
            await client.query('ROLLBACK');
            return res.status(400).json({
                success: false,
                message: 'Reservation has expired. Please reserve again.'
            });
        }

        // Update reservation to BOOKED
        const updateQuery = `
      UPDATE seat_reservations
      SET status = 'BOOKED', booking_id = $1
      WHERE id = $2
      RETURNING *
    `;

        const updateResult = await client.query(updateQuery, [booking_id, reservation_id]);

        await client.query('COMMIT');

        logger.info(`Booking confirmed: Reservation ${reservation_id}, Booking ${booking_id}`);

        return res.status(200).json({
            success: true,
            message: 'Booking confirmed successfully',
            data: updateResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Error confirming booking:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to confirm booking. Please contact support.'
        });
    } finally {
        client.release();
    }
};

/**
 * Cancel a reservation
 */
export const cancelReservation = async (req, res) => {
    const { reservation_id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            `UPDATE seat_reservations 
       SET status = 'CANCELLED' 
       WHERE id = $1 AND user_id = $2 AND status = 'PENDING'
       RETURNING *`,
            [reservation_id, user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reservation not found or cannot be cancelled'
            });
        }

        logger.info(`Reservation cancelled: ${reservation_id} by user ${user_id}`);

        return res.status(200).json({
            success: true,
            message: 'Reservation cancelled successfully'
        });

    } catch (error) {
        logger.error('Error cancelling reservation:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to cancel reservation'
        });
    }
};

/**
 * Get available seats for an event
 */
export const getAvailableSeats = async (req, res) => {
    const { event_id } = req.params;

    try {
        // Get all seats for the event and their reservation status
        const query = `
      SELECT 
        sl.seat_number,
        CASE 
          WHEN sr.status IN ('PENDING', 'BOOKED') AND sr.expires_at > NOW() THEN sr.status
          ELSE 'AVAILABLE'
        END as status,
        sr.expires_at
      FROM seat_layout sl
      LEFT JOIN seat_reservations sr 
        ON sl.event_id = sr.event_id 
        AND sl.seat_number = sr.seat_number
        AND sr.status IN ('PENDING', 'BOOKED')
      WHERE sl.event_id = $1
      ORDER BY sl.seat_number
    `;

        const result = await pool.query(query, [event_id]);

        return res.status(200).json({
            success: true,
            data: result.rows
        });

    } catch (error) {
        logger.error('Error fetching available seats:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch available seats'
        });
    }
};
