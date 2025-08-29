import { query } from '../config/database.js';

const createTables = async () => {
  try {
    console.log('Starting database migration...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        avatar_url TEXT,
        google_id VARCHAR(255) UNIQUE,
        is_verified BOOLEAN DEFAULT FALSE,
        is_organizer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Categories table
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Categories table created');

    // Venues table
    await query(`
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100),
        country VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20),
        capacity INTEGER,
        description TEXT,
        amenities TEXT[],
        images TEXT[],
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Venues table created');

    // Events table
    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category_id INTEGER REFERENCES categories(id),
        venue_id INTEGER REFERENCES venues(id),
        organizer_id INTEGER REFERENCES users(id),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME,
        price DECIMAL(10, 2),
        currency VARCHAR(3) DEFAULT 'NPR',
        total_seats INTEGER NOT NULL,
        available_seats INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'upcoming',
        images TEXT[],
        tags TEXT[],
        rating DECIMAL(3, 2) DEFAULT 0,
        review_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Events table created');

    // Bookings table
    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        event_id INTEGER REFERENCES events(id),
        seat_numbers TEXT[] NOT NULL,
        quantity INTEGER NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'NPR',
        status VARCHAR(20) DEFAULT 'pending',
        payment_status VARCHAR(20) DEFAULT 'pending',
        payment_method VARCHAR(50),
        transaction_id VARCHAR(255),
        booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Bookings table created');

    // Reviews table
    await query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        event_id INTEGER REFERENCES events(id),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, event_id)
      )
    `);
    console.log('✓ Reviews table created');

    // Event images table for better image management
    await query(`
      CREATE TABLE IF NOT EXISTS event_images (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Event images table created');

    // User sessions table for better session management
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ User sessions table created');

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_events_category ON events(category_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_events_date ON events(start_date)');
    await query('CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_bookings_event ON bookings(event_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_reviews_event ON reviews(event_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)');

    console.log('✓ Database indexes created');
    console.log('Database migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTables();
}

export default createTables;
