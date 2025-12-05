import { query } from '../config/database.js';
import { eventImageUpload } from '../utils/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { successResponse, errorResponse } from '../utils/response.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';

// Get all events with filters
export const getEvents = async (req, res) => {
  try {
    const { 
      category, 
      search, 
      minPrice, 
      maxPrice, 
      date, 
      page = 1, 
      limit = 20,
      sortBy = 'start_date',
      sortOrder = 'ASC'
    } = req.query;

    let whereConditions = ['e.status IN ($1, $2)'];
    let queryParams = ['upcoming', 'published'];
    let paramIndex = 3;

    // Category filter
    if (category) {
      const categories = category.split(',');
      if (categories.length === 1) {
        whereConditions.push(`c.name = $${paramIndex}`);
        queryParams.push(categories[0]);
        paramIndex++;
      } else {
        const categoryPlaceholders = categories.map((_, index) => `$${paramIndex + index}`).join(',');
        whereConditions.push(`c.name IN (${categoryPlaceholders})`);
        queryParams.push(...categories);
        paramIndex += categories.length;
      }
    }

    // Location filter
    if (req.query.location) {
      whereConditions.push(`v.city ILIKE $${paramIndex}`);
      queryParams.push(`%${req.query.location}%`);
      paramIndex++;
    }

    // Search filter
    if (search) {
      whereConditions.push(`(e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Price filters
    if (req.query.price_range) {
      const priceRange = req.query.price_range;
      if (priceRange === 'free') {
        whereConditions.push(`e.price = 0`);
      } else if (priceRange === '0-500') {
        whereConditions.push(`e.price >= 0 AND e.price <= 500`);
      } else if (priceRange === '500-1000') {
        whereConditions.push(`e.price >= 500 AND e.price <= 1000`);
      } else if (priceRange === '1000-2500') {
        whereConditions.push(`e.price >= 1000 AND e.price <= 2500`);
      } else if (priceRange === '2500+') {
        whereConditions.push(`e.price >= 2500`);
      }
    } else {
      if (minPrice) {
        whereConditions.push(`e.price >= $${paramIndex}`);
        queryParams.push(parseFloat(minPrice));
        paramIndex++;
      }

      if (maxPrice) {
        whereConditions.push(`e.price <= $${paramIndex}`);
        queryParams.push(parseFloat(maxPrice));
        paramIndex++;
      }
    }

    // Date filter
    if (date) {
      whereConditions.push(`e.start_date >= $${paramIndex}`);
      queryParams.push(date);
      paramIndex++;
    }

    // Build the WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total events for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM events e 
      LEFT JOIN categories c ON e.category_id = c.id 
      LEFT JOIN venues v ON e.venue_id = v.id 
      ${whereClause}
    `;
    
    const countResult = await query(countQuery, queryParams);
    const totalEvents = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalEvents / limit);
    const offset = (page - 1) * limit;

    // Get events with pagination - optimized query
    const eventsQuery = `
      SELECT 
        e.id, e.title, e.description, e.start_date, e.start_time, e.end_time,
        e.price, e.currency, e.total_seats, e.available_seats, e.status,
        e.images, e.tags, e.created_at,
        c.name as category_name,
        v.name as venue_name, v.city as venue_city,
        u.username as organizer_name
      FROM events e 
      LEFT JOIN categories c ON e.category_id = c.id 
      LEFT JOIN venues v ON e.venue_id = v.id 
      LEFT JOIN users u ON e.organizer_id = u.id 
      ${whereClause}
      ORDER BY e.${sortBy} ${sortOrder}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const eventsResult = await query(eventsQuery, [...queryParams, limit, offset]);
    const events = eventsResult.rows;

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalEvents,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get single event by ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const eventResult = await query(`
      SELECT 
        e.*,
        c.name as category_name, c.description as category_description, c.color as category_color,
        v.name as venue_name, v.address as venue_address, v.city as venue_city, 
        v.state as venue_state, v.country as venue_country, v.postal_code as venue_postal_code,
        v.capacity as venue_capacity, v.description as venue_description, v.amenities as venue_amenities,
        v.images as venue_images, v.latitude as venue_latitude, v.longitude as venue_longitude,
        u.username as organizer_name, u.first_name as organizer_first_name, u.last_name as organizer_last_name
      FROM events e 
      LEFT JOIN categories c ON e.category_id = c.id 
      LEFT JOIN venues v ON e.venue_id = v.id 
      LEFT JOIN users u ON e.organizer_id = u.id 
      WHERE e.id = $1
    `, [id]);

    if (eventResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = eventResult.rows[0];

    // Get reviews for this event
    const reviewsResult = await query(`
      SELECT r.rating, r.comment, r.created_at,
             u.username, u.first_name, u.last_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);

    event.reviews = reviewsResult.rows;

    res.json({
      success: true,
      data: event
    });

  } catch (error) {
    logger.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categoriesResult = await query(`
      SELECT id, name, description, icon, color, created_at
      FROM categories
      ORDER BY name
    `);

    res.json({
      success: true,
      data: categoriesResult.rows
    });

  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get all venues
export const getVenues = async (req, res) => {
  try {
    const { city, search, page = 1, limit = 12 } = req.query;

    let whereConditions = [];
    let queryParams = [];
    let paramIndex = 1;

    if (city) {
      whereConditions.push(`city ILIKE $${paramIndex}`);
      queryParams.push(`%${city}%`);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Count total venues
    const countQuery = `SELECT COUNT(*) FROM venues ${whereClause}`;
    const countResult = await query(countQuery, queryParams);
    const totalVenues = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalVenues / limit);
    const offset = (page - 1) * limit;

    // Get venues with pagination
    const venuesQuery = `
      SELECT id, name, address, city, state, country, postal_code, capacity, 
             description, amenities, images, latitude, longitude, created_at
      FROM venues 
      ${whereClause}
      ORDER BY name
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const venuesResult = await query(venuesQuery, [...queryParams, limit, offset]);

    res.json({
      success: true,
      data: {
        venues: venuesResult.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalVenues,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    logger.error('Get venues error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get venue by ID
export const getVenueById = async (req, res) => {
  try {
    const { id } = req.params;

    const venueResult = await query(`
      SELECT id, name, address, city, state, country, postal_code, capacity, 
             description, amenities, images, latitude, longitude, created_at
      FROM venues 
      WHERE id = $1
    `, [id]);

    if (venueResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found'
      });
    }

    // Get events at this venue
    const eventsResult = await query(`
      SELECT id, title, start_date, start_time, price, currency, status
      FROM events 
      WHERE venue_id = $1 AND status = 'upcoming'
      ORDER BY start_date
      LIMIT 5
    `, [id]);

    const venue = venueResult.rows[0];
    venue.upcoming_events = eventsResult.rows;

    res.json({
      success: true,
      data: venue
    });

  } catch (error) {
    logger.error('Get venue by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new event (organizer only)
export const createEvent = async (req, res) => {
  try {
    const {
      title, description, category_id, venue_id, venue_name, venue_address, venue_city,
      start_date, end_date, start_time, end_time, price, currency, total_seats, tags, image_url
    } = req.body;

    // Parse optional fields
    const parsedPrice = price !== undefined && price !== null ? parseFloat(price) : null;
    const parsedSeats = parseInt(total_seats, 10);
    
    // Handle image URL - store directly in database
    let imageData = null;
    if (image_url) {
      imageData = image_url;
    }

    let finalVenueId = venue_id;

    // If venue details are provided instead of venue_id, create a new venue
    if (venue_name && venue_city && !venue_id) {
      const venueQuery = `
        INSERT INTO venues (name, address, city, country, capacity, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        RETURNING id
      `;
      const venueResult = await query(venueQuery, [
        venue_name, 
        venue_address || '', 
        venue_city, 
        'Nepal', 
        parsedSeats || 100
      ]);
      finalVenueId = venueResult.rows[0].id;
    }

    // Insert into events, mirror available_seats to total_seats
    const insertEventQuery = `
      INSERT INTO events (
        title, description, category_id, venue_id, organizer_id,
        start_date, end_date, start_time, end_time, price, currency,
        total_seats, available_seats, images, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;

    const newEvent = await query(insertEventQuery, [
      title, description, category_id, finalVenueId, req.user.id,
      start_date, end_date, start_time.includes(':') && start_time.length === 5 ? `${start_time}:00` : start_time,
      end_time ? (end_time.includes(':') && end_time.length === 5 ? `${end_time}:00` : end_time) : null,
      parsedPrice, currency || 'NPR',
      parsedSeats, parsedSeats, imageData ? [imageData] : null, Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : null)
    ]);

    const created = newEvent.rows[0];

    // Track in created_events table as well
    await query(`
      INSERT INTO created_events (
        event_id, organizer_id, title, description, category_id, venue_id,
        start_date, end_date, start_time, end_time, price, currency,
        total_seats, image_url, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `, [
      created.id, req.user.id, title, description, category_id, venue_id,
      start_date, end_date, start_time, end_time, parsedPrice, currency || 'NPR',
      parsedSeats, imageData, 'created'
    ]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: created
    });

  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update event (organizer only)
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;

    // Check if user is the organizer of this event
    const eventCheck = await query(
      'SELECT organizer_id FROM events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (eventCheck.rows[0].organizer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the event organizer can update this event'
      });
    }

    // Build dynamic update query
    const allowedFields = [
      'title', 'description', 'category_id', 'venue_id', 'start_date', 
      'end_date', 'start_time', 'end_time', 'price', 'currency', 
      'total_seats', 'tags', 'status'
    ];

    const updates = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, value] of Object.entries(updateFields)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updates.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const updateQuery = `
      UPDATE events 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const updatedEvent = await query(updateQuery, values);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: updatedEvent.rows[0]
    });

  } catch (error) {
    logger.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete event (organizer only)
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is the organizer of this event
    const eventCheck = await query(
      'SELECT organizer_id FROM events WHERE id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (eventCheck.rows[0].organizer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the event organizer can delete this event'
      });
    }

    // Check if there are any bookings for this event
    const bookingsCheck = await query(
      'SELECT COUNT(*) FROM bookings WHERE event_id = $1',
      [id]
    );

    if (parseInt(bookingsCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete event with existing bookings'
      });
    }

    await query('DELETE FROM events WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    logger.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get events created by the authenticated user
export const getMyEvents = async (req, res) => {
  try {
    const eventsResult = await query(`
      SELECT 
        id, title, description, start_date, start_time, end_time, price, currency,
        total_seats, available_seats, status, images, tags, created_at
      FROM events
      WHERE organizer_id = $1
      ORDER BY created_at DESC
    `, [req.user.id]);

    res.json({
      success: true,
      data: eventsResult.rows
    });
  } catch (error) {
    logger.error('Get my events error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const uploadEventImage = asyncHandler(async (req, res) => {
  return new Promise((resolve) => {
    eventImageUpload.single('eventImage')(req, res, async (err) => {
      if (err) {
        return resolve(errorResponse(res, err.message, 400));
      }

      if (!req.file) {
        return resolve(errorResponse(res, 'No file uploaded', 400));
      }

      const imageUrl = `${config.baseUrl}/uploads/events/${req.file.filename}`;

      return resolve(successResponse(res, { image_url: imageUrl }, 'Event image uploaded successfully'));
    });
  });
});
