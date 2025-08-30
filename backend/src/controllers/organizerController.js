import { query } from '../config/database.js';

// Get all organizers
export const getOrganizers = async (req, res) => {
  try {
    const organizersResult = await query(`
      SELECT 
        u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
        u.is_verified, u.is_organizer, u.created_at,
        COUNT(e.id) as total_events,
        AVG(e.rating) as average_rating
      FROM users u
      LEFT JOIN events e ON u.id = e.organizer_id
      WHERE u.is_organizer = true
      GROUP BY u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
               u.is_verified, u.is_organizer, u.created_at
      ORDER BY total_events DESC, u.created_at DESC
    `);

    res.json({
      success: true,
      data: organizersResult.rows
    });

  } catch (error) {
    console.error('Get organizers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get organizer by ID
export const getOrganizerById = async (req, res) => {
  try {
    const { id } = req.params;

    const organizerResult = await query(`
      SELECT 
        u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
        u.is_verified, u.is_organizer, u.created_at,
        COUNT(e.id) as total_events,
        AVG(e.rating) as average_rating
      FROM users u
      LEFT JOIN events e ON u.id = e.organizer_id
      WHERE u.id = $1 AND u.is_organizer = true
      GROUP BY u.id, u.username, u.first_name, u.last_name, u.email, u.phone,
               u.is_verified, u.is_organizer, u.created_at
    `, [id]);

    if (organizerResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    res.json({
      success: true,
      data: organizerResult.rows[0]
    });

  } catch (error) {
    console.error('Get organizer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get events by organizer
export const getOrganizerEvents = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 12 } = req.query;

    // Check if organizer exists
    const organizerCheck = await query(
      'SELECT id FROM users WHERE id = $1 AND is_organizer = true',
      [id]
    );

    if (organizerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Organizer not found'
      });
    }

    // Count total events
    const countResult = await query(
      'SELECT COUNT(*) FROM events WHERE organizer_id = $1',
      [id]
    );
    const totalEvents = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalEvents / limit);
    const offset = (page - 1) * limit;

    // Get events with pagination
    const eventsResult = await query(`
      SELECT 
        e.id, e.title, e.description, e.start_date, e.start_time, e.end_time,
        e.price, e.currency, e.total_seats, e.available_seats, e.status,
        e.images, e.tags, e.rating, e.review_count,
        c.name as category_name, c.color as category_color,
        v.name as venue_name, v.city as venue_city
      FROM events e 
      LEFT JOIN categories c ON e.category_id = c.id 
      LEFT JOIN venues v ON e.venue_id = v.id 
      WHERE e.organizer_id = $1
      ORDER BY e.start_date DESC
      LIMIT $2 OFFSET $3
    `, [id, limit, offset]);

    res.json({
      success: true,
      data: eventsResult.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalEvents,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
