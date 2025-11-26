import { query } from '../config/database.js';
import { sendTicketEmail } from '../utils/emailService.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';

// Get all seat categories
export const getSeatCategories = async (req, res) => {
  try {
    const result = await query('SELECT * FROM seat_categories ORDER BY name');
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Get seat categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seat categories'
    });
  }
};

// Create a new seat category
export const createSeatCategory = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    
    const result = await query(
      'INSERT INTO seat_categories (name, color, description) VALUES ($1, $2, $3) RETURNING *',
      [name, color, description]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Create seat category error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Seat category with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create seat category'
      });
    }
  }
};

// Get seat layout for an event
export const getSeatLayout = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const layoutResult = await query(`
      SELECT 
        sl.*,
        sc.name as category_name,
        sc.color as category_color
      FROM seat_layouts sl
      LEFT JOIN seat_categories sc ON sl.id = sc.id
      WHERE sl.event_id = $1 AND sl.is_active = TRUE
    `, [eventId]);
    
    if (layoutResult.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No seat layout found for this event'
      });
    }
    
    const layout = layoutResult.rows[0];
    
    // Get all seats for this layout
    const seatsResult = await query(`
      SELECT 
        s.*,
        sc.name as category_name,
        sc.color as category_color,
        sc.description as category_description
      FROM seats s
      LEFT JOIN seat_categories sc ON s.category_id = sc.id
      WHERE s.layout_id = $1
      ORDER BY s.row_number, s.column_number
    `, [layout.id]);
    
    // Get seat categories
    const categoriesResult = await query('SELECT * FROM seat_categories ORDER BY name');
    
    res.json({
      success: true,
      data: {
        layout: layout,
        seats: seatsResult.rows,
        categories: categoriesResult.rows
      }
    });
  } catch (error) {
    console.error('Get seat layout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seat layout'
    });
  }
};

// Create or update seat layout for an event
export const createSeatLayout = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      venueType,
      layoutName,
      totalRows,
      totalColumns,
      bookingType,
      maxBookingsPerSeat,
      layoutConfig,
      seats
    } = req.body;
    
    // Validate input
    if (!venueType || !layoutName || !totalRows || !totalColumns) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: venueType, layoutName, totalRows, totalColumns'
      });
    }
    
    if (venueType !== 'simple_counter' && (!seats || seats.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Seats configuration is required for non-simple-counter layouts'
      });
    }
    
    // Check if event exists
    const eventResult = await query('SELECT id FROM events WHERE id = $1', [eventId]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Start transaction
    await query('BEGIN');
    
    try {
      // Deactivate existing layouts for this event
      await query(
        'UPDATE seat_layouts SET is_active = FALSE WHERE event_id = $1',
        [eventId]
      );
      
      // Create new layout
      const layoutResult = await query(`
        INSERT INTO seat_layouts (
          event_id, venue_type, layout_name, total_rows, total_columns,
          booking_type, max_bookings_per_seat, layout_config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [
        eventId, venueType, layoutName, totalRows, totalColumns,
        bookingType, maxBookingsPerSeat || 1, JSON.stringify(layoutConfig || {})
      ]);
      
      const layout = layoutResult.rows[0];
      
      // Create seats if not simple_counter
      if (venueType !== 'simple_counter' && seats) {
        for (const seat of seats) {
          await query(`
            INSERT INTO seats (
              layout_id, row_number, column_number, seat_number,
              category_id, price, max_capacity, seat_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            layout.id,
            seat.rowNumber,
            seat.columnNumber,
            seat.seatNumber,
            seat.categoryId,
            seat.price,
            seat.maxCapacity || 1,
            seat.seatType || 'standard'
          ]);
        }
      }
      
      await query('COMMIT');
      
      res.status(201).json({
        success: true,
        data: layout,
        message: 'Seat layout created successfully'
      });
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Create seat layout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create seat layout'
    });
  }
};

// Update seat layout
export const updateSeatLayout = async (req, res) => {
  try {
    const { layoutId } = req.params;
    const {
      venueType,
      layoutName,
      totalRows,
      totalColumns,
      bookingType,
      maxBookingsPerSeat,
      layoutConfig,
      seats
    } = req.body;
    
    // Check if layout exists
    const layoutResult = await query('SELECT * FROM seat_layouts WHERE id = $1', [layoutId]);
    if (layoutResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seat layout not found'
      });
    }
    
    // Start transaction
    await query('BEGIN');
    
    try {
      // Update layout
      const updateResult = await query(`
        UPDATE seat_layouts SET
          venue_type = $1,
          layout_name = $2,
          total_rows = $3,
          total_columns = $4,
          booking_type = $5,
          max_bookings_per_seat = $6,
          layout_config = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `, [
        venueType, layoutName, totalRows, totalColumns,
        bookingType, maxBookingsPerSeat, JSON.stringify(layoutConfig || {}),
        layoutId
      ]);
      
      // Delete existing seats and recreate them
      await query('DELETE FROM seats WHERE layout_id = $1', [layoutId]);
      
      if (venueType !== 'simple_counter' && seats) {
        for (const seat of seats) {
          await query(`
            INSERT INTO seats (
              layout_id, row_number, column_number, seat_number,
              category_id, price, max_capacity, seat_type
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `, [
            layoutId,
            seat.rowNumber,
            seat.columnNumber,
            seat.seatNumber,
            seat.categoryId,
            seat.price,
            seat.maxCapacity || 1,
            seat.seatType || 'standard'
          ]);
        }
      }
      
      await query('COMMIT');
      
      res.json({
        success: true,
        data: updateResult.rows[0],
        message: 'Seat layout updated successfully'
      });
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Update seat layout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update seat layout'
    });
  }
};

// Delete seat layout
export const deleteSeatLayout = async (req, res) => {
  try {
    const { layoutId } = req.params;
    
    // Check if layout exists
    const layoutResult = await query('SELECT * FROM seat_layouts WHERE id = $1', [layoutId]);
    if (layoutResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Seat layout not found'
      });
    }
    
    // Check if there are any bookings for this layout
    const bookingsResult = await query(`
      SELECT COUNT(*) as booking_count
      FROM seat_bookings sb
      JOIN seats s ON sb.seat_id = s.id
      WHERE s.layout_id = $1
    `, [layoutId]);
    
    if (parseInt(bookingsResult.rows[0].booking_count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete layout with existing bookings'
      });
    }
    
    // Delete layout (cascade will delete seats)
    await query('DELETE FROM seat_layouts WHERE id = $1', [layoutId]);
    
    res.json({
      success: true,
      message: 'Seat layout deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete seat layout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete seat layout'
    });
  }
};

// Get available seats for booking
export const getAvailableSeats = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Get seat layout
    const layoutResult = await query(`
      SELECT * FROM seat_layouts 
      WHERE event_id = $1 AND is_active = TRUE
    `, [eventId]);
    
    if (layoutResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          layout: null,
          seats: [],
          categories: []
        },
        message: 'No seat layout found for this event'
      });
    }
    
    const layout = layoutResult.rows[0];
    
    // Get seats with availability information
    const seatsResult = await query(`
      SELECT 
        s.*,
        sc.name as category_name,
        sc.color as category_color,
        sc.description as category_description,
        CASE 
          WHEN s.seat_type = 'disabled' THEN FALSE
          WHEN sl.booking_type = 'one_time' THEN 
            CASE WHEN s.current_bookings >= s.max_capacity THEN FALSE ELSE TRUE END
          ELSE 
            CASE WHEN s.current_bookings >= s.max_capacity THEN FALSE ELSE TRUE END
        END as is_available
      FROM seats s
      LEFT JOIN seat_categories sc ON s.category_id = sc.id
      LEFT JOIN seat_layouts sl ON s.layout_id = sl.id
      WHERE s.layout_id = $1
      ORDER BY s.row_number, s.column_number
    `, [layout.id]);
    
    // Get seat categories
    const categoriesResult = await query('SELECT * FROM seat_categories ORDER BY name');
    
    res.json({
      success: true,
      data: {
        layout: layout,
        seats: seatsResult.rows,
        categories: categoriesResult.rows
      }
    });
    
  } catch (error) {
    console.error('Get available seats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available seats'
    });
  }
};

// Book seats
export const bookSeats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { seatSelections } = req.body; // Array of {seatId, quantity}
    const userId = req.user.id;
    
    if (!seatSelections || seatSelections.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No seats selected for booking'
      });
    }
    
    // Get seat layout
    const layoutResult = await query(`
      SELECT * FROM seat_layouts 
      WHERE event_id = $1 AND is_active = TRUE
    `, [eventId]);
    
    if (layoutResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No seat layout found for this event'
      });
    }
    
    const layout = layoutResult.rows[0];
    
    // Start transaction
    await query('BEGIN');
    
    try {
      let totalAmount = 0;
      const seatBookings = [];
      
      // Handle simple_counter vs regular seat bookings
      if (layout.venue_type === 'simple_counter') {
        // For simple_counter, we don't have individual seats
        // Just process the quantity directly
        for (const selection of seatSelections) {
          const { quantity } = selection;
          
          // For simple counter, we need to get the price from the event or layout config
          const eventResult = await query('SELECT price FROM events WHERE id = $1', [eventId]);
          if (eventResult.rows.length === 0) {
            throw new Error('Event not found');
          }
          
          const unitPrice = eventResult.rows[0].price || 0;
          const seatTotal = unitPrice * quantity;
          totalAmount += seatTotal;
          
          seatBookings.push({
            seatId: 0, // Special ID for simple counter
            quantity,
            unitPrice,
            totalPrice: seatTotal,
            seatNumber: 'GENERAL',
            categoryName: 'General Admission'
          });
        }
      } else {
        // Regular seat booking logic
        for (const selection of seatSelections) {
          const { seatId, quantity } = selection;
          
          // Get seat details
          const seatResult = await query(`
            SELECT s.*, sc.name as category_name
            FROM seats s
            LEFT JOIN seat_categories sc ON s.category_id = sc.id
            WHERE s.id = $1 AND s.layout_id = $2
          `, [seatId, layout.id]);
          
          if (seatResult.rows.length === 0) {
            throw new Error(`Seat ${seatId} not found`);
          }
          
          const seat = seatResult.rows[0];
          
          // Check availability
          const availableCapacity = seat.max_capacity - seat.current_bookings;
          if (quantity > availableCapacity) {
            throw new Error(`Not enough capacity for seat ${seat.seat_number}. Available: ${availableCapacity}, Requested: ${quantity}`);
          }
          
          const seatTotal = seat.price * quantity;
          totalAmount += seatTotal;
          
          seatBookings.push({
            seatId,
            quantity,
            unitPrice: seat.price,
            totalPrice: seatTotal,
            seatNumber: seat.seat_number,
            categoryName: seat.category_name
          });
        }
      }
      
      // Create main booking
      const bookingResult = await query(`
        INSERT INTO bookings (
          user_id, event_id, seat_numbers, quantity, total_amount, 
          currency, payment_method, status, payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        userId, eventId, 
        seatBookings.map(sb => sb.seatNumber),
        seatBookings.reduce((sum, sb) => sum + sb.quantity, 0),
        totalAmount,
        'NPR', 'online', 'pending', 'pending'
      ]);
      
      const booking = bookingResult.rows[0];
      
      // Create seat bookings and update seat availability
      for (const seatBooking of seatBookings) {
        // Create seat booking record
        await query(`
          INSERT INTO seat_bookings (
            booking_id, seat_id, quantity, unit_price, total_price
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          booking.id,
          seatBooking.seatId,
          seatBooking.quantity,
          seatBooking.unitPrice,
          seatBooking.totalPrice
        ]);
        
        // Update seat availability (skip for simple_counter with seatId = 0)
        if (seatBooking.seatId !== 0) {
          await query(`
            UPDATE seats 
            SET current_bookings = current_bookings + $1
            WHERE id = $2
          `, [seatBooking.quantity, seatBooking.seatId]);
        }
      }
      
      // Update event available seats
      const totalQuantity = seatBookings.reduce((sum, sb) => sum + sb.quantity, 0);
      await query(
        'UPDATE events SET available_seats = available_seats - $1 WHERE id = $2',
        [totalQuantity, eventId]
      );
      
      await query('COMMIT');
      
      res.status(201).json({
        success: true,
        data: {
          booking: booking,
          seatBookings: seatBookings,
          totalAmount: totalAmount
        },
        message: 'Seats booked successfully'
      });

      // Fetch full event and venue details for the ticket
      const eventDetailsResult = await query(`
        SELECT 
          e.title as event_title, e.start_date, e.start_time,
          v.name as venue_name, v.city as venue_city,
          u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
        FROM events e
        LEFT JOIN venues v ON e.venue_id = v.id
        JOIN users u ON u.id = $1
        WHERE e.id = $2
      `, [userId, eventId]);

      if (eventDetailsResult.rows.length > 0) {
        const eventDetails = eventDetailsResult.rows[0];
        
        // Generate Ticket PDF
        try {
          const pdfBuffer = await generateTicketPDF({
            id: booking.id,
            event_id: eventId,
            user_id: userId,
            event_title: eventDetails.event_title,
            start_date: eventDetails.start_date,
            start_time: eventDetails.start_time,
            venue_name: eventDetails.venue_name || 'TBA',
            venue_city: eventDetails.venue_city || '',
            user_name: `${eventDetails.user_first_name} ${eventDetails.user_last_name}`,
            seat_numbers: seatBookings.map(sb => sb.seatNumber),
            quantity: seatBookings.reduce((sum, sb) => sum + sb.quantity, 0),
            total_amount: totalAmount,
            currency: 'NPR'
          });

          // Send confirmation email with PDF
          await sendTicketEmail(eventDetails.user_email, {
            event_title: eventDetails.event_title,
            user_name: `${eventDetails.user_first_name} ${eventDetails.user_last_name}`,
            start_date: eventDetails.start_date,
            start_time: eventDetails.start_time,
            venue_name: eventDetails.venue_name || 'TBA',
            venue_city: eventDetails.venue_city || '',
            seat_numbers: seatBookings.map(sb => sb.seatNumber),
            quantity: seatBookings.reduce((sum, sb) => sum + sb.quantity, 0),
            total_amount: totalAmount,
            currency: 'NPR'
          }, pdfBuffer);
          
          console.log(`Ticket email sent to ${eventDetails.user_email}`);
        } catch (emailError) {
          console.error('Failed to send ticket email:', emailError);
          // Don't fail the request if email fails, just log it
        }
      }
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Book seats error:', error);
    
    if (error.message.includes('Not enough capacity')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to book seats'
    });
  }
};
