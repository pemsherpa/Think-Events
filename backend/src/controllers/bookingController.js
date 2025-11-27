import { query } from '../config/database.js';
import { sendTicketEmail } from '../utils/emailService.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';

// Create a new booking
export const createBooking = async (req, res) => {
  try {
    const { event_id, seat_numbers, quantity, total_amount, payment_method } = req.body;
    const user_id = req.user.id;

    // Validate seat availability
    const eventResult = await query(
      'SELECT available_seats, price, currency FROM events WHERE id = $1',
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = eventResult.rows[0];

    if (event.available_seats < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.available_seats} seats available`
      });
    }

    // Check if seats are already booked
    const existingBookings = await query(
      'SELECT seat_numbers FROM bookings WHERE event_id = $1 AND status != $2',
      [event_id, 'cancelled']
    );

    const bookedSeats = existingBookings.rows.flatMap(booking => booking.seat_numbers);
    const conflictingSeats = seat_numbers.filter(seat => bookedSeats.includes(seat));

    if (conflictingSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${conflictingSeats.join(', ')} are already booked`
      });
    }

    // Create booking
    const newBooking = await query(`
      INSERT INTO bookings (
        user_id, event_id, seat_numbers, quantity, total_amount, 
        currency, payment_method, status, payment_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      user_id, event_id, seat_numbers, quantity, total_amount,
      event.currency, payment_method, 'pending', 'pending'
    ]);

    // Update available seats
    await query(
      'UPDATE events SET available_seats = available_seats - $1 WHERE id = $2',
      [quantity, event_id]
    );

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking.rows[0]
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const user_id = req.user.id;

    let whereConditions = ['b.user_id = $1'];
    let queryParams = [user_id];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`b.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Count total bookings
    const countQuery = `
      SELECT COUNT(*) 
      FROM bookings b 
      WHERE ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const totalBookings = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalBookings / limit);
    const offset = (page - 1) * limit;

    // Get bookings with event details
    const bookingsQuery = `
      SELECT 
        b.*,
        e.title as event_title, e.start_date, e.start_time, e.end_time,
        e.images as event_images, e.organizer_id as event_organizer_id,
        v.name as venue_name, v.city as venue_city,
        c.name as category_name
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE ${whereClause}
      ORDER BY b.booking_date DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const bookingsResult = await query(bookingsQuery, [...queryParams, limit, offset]);

    res.json({
      success: true,
      data: {
        bookings: bookingsResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalBookings,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const bookingResult = await query(`
      SELECT 
        b.*,
        e.title as event_title, e.description as event_description,
        e.start_date, e.start_time, e.end_time, e.images as event_images,
        v.name as venue_name, v.address as venue_address, v.city as venue_city,
        c.name as category_name
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN categories c ON e.category_id = c.id
      WHERE b.id = $1 AND b.user_id = $2
    `, [id, user_id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: bookingResult.rows[0]
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;
    const user_id = req.user.id;

    // Check if booking exists and belongs to user
    const bookingCheck = await query(
      'SELECT id, event_id, quantity, status FROM bookings WHERE id = $1 AND user_id = $2',
      [id, user_id]
    );

    if (bookingCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookingCheck.rows[0];

    // Only allow certain status transitions
    const allowedStatuses = ['pending', 'confirmed', 'cancelled'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // If cancelling, restore seats to event
    if (status === 'cancelled' && booking.status !== 'cancelled') {
      await query(
        'UPDATE events SET available_seats = available_seats + $1 WHERE id = $2',
        [booking.quantity, booking.event_id]
      );
    }

    // Update booking
    const updateFields = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      updateFields.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }

    if (payment_status) {
      updateFields.push(`payment_status = $${paramIndex}`);
      values.push(payment_status);
      paramIndex++;
    }

    // If payment marked completed, auto-confirm the booking
    if (payment_status === 'completed' && booking.status === 'pending') {
      updateFields.push(`status = $${paramIndex}`);
      values.push('confirmed');
      paramIndex++;

      // Award Reward Points (100 points per ticket)
      const points = booking.quantity * 100;
      if (points > 0) {
        await query(
          'UPDATE users SET reward_points = COALESCE(reward_points, 0) + $1 WHERE id = $2',
          [points, user_id]
        );
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const updateQuery = `
      UPDATE bookings 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updatedBooking = await query(updateQuery, values);
    const bookingData = updatedBooking.rows[0];

    // If booking is confirmed, send ticket email
    if (bookingData.status === 'confirmed') {
      try {
        // Fetch full event and user details for the email
        const detailsQuery = `
          SELECT 
            b.*,
            e.title as event_title, e.description as event_description,
            e.start_date, e.start_time, e.end_time, e.images as event_images,
            v.name as venue_name, v.address as venue_address, v.city as venue_city,
            c.name as category_name,
            u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
          FROM bookings b
          JOIN events e ON b.event_id = e.id
          LEFT JOIN venues v ON e.venue_id = v.id
          LEFT JOIN categories c ON e.category_id = c.id
          JOIN users u ON b.user_id = u.id
          WHERE b.id = $1
        `;
        const detailsResult = await query(detailsQuery, [id]);
        
        if (detailsResult.rows.length > 0) {
          const ticketDetails = detailsResult.rows[0];
          const qrCode = await generateTicketQR(ticketDetails);
          
          await sendTicketEmail(ticketDetails.user_email, ticketDetails, qrCode);
          console.log(`Ticket email sent to ${ticketDetails.user_email}`);
        }
      } catch (emailError) {
        console.error('Failed to send ticket email:', emailError);
        // Don't fail the request, just log the error
      }
    }

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: bookingData
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Cancel booking
export const cancelBooking = async (req, res) => {
  try {
    return res.status(403).json({
      success: false,
      message: 'Customer-initiated booking cancellation is disabled'
    });

  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get available seats for an event
export const getAvailableSeats = async (req, res) => {
  try {
    const { event_id } = req.params;

    // Get event details
    const eventResult = await query(
      'SELECT total_seats, available_seats FROM events WHERE id = $1',
      [event_id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = eventResult.rows[0];

    // Get booked seats
    const bookedSeatsResult = await query(
      'SELECT seat_numbers FROM bookings WHERE event_id = $1 AND status != $2',
      [event_id, 'cancelled']
    );

    const bookedSeats = bookedSeatsResult.rows.flatMap(booking => booking.seat_numbers);
    const availableSeats = [];

    // Generate seat numbers (assuming simple numbering for now)
    for (let i = 1; i <= event.total_seats; i++) {
      const seatNumber = `A${i.toString().padStart(3, '0')}`;
      if (!bookedSeats.includes(seatNumber)) {
        availableSeats.push(seatNumber);
      }
    }

    res.json({
      success: true,
      data: {
        total_seats: event.total_seats,
        available_seats: event.available_seats,
        available_seat_numbers: availableSeats,
        booked_seat_numbers: bookedSeats
      }
    });

  } catch (error) {
    console.error('Get available seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get booking statistics for user
export const getBookingStats = async (req, res) => {
  try {
    const user_id = req.user.id;

    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        SUM(CASE WHEN status = 'confirmed' THEN total_amount ELSE 0 END) as total_spent
      FROM bookings 
      WHERE user_id = $1
    `, [user_id]);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        total_bookings: parseInt(stats.total_bookings),
        confirmed_bookings: parseInt(stats.confirmed_bookings),
        pending_bookings: parseInt(stats.pending_bookings),
        cancelled_bookings: parseInt(stats.cancelled_bookings),
        total_spent: parseFloat(stats.total_spent || 0)
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
