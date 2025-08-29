import { query } from '../config/database.js';

const resetDatabase = async () => {
  try {
    console.log('Starting database reset...');

    // Drop all tables
    await query('DROP TABLE IF EXISTS user_sessions CASCADE');
    await query('DROP TABLE IF EXISTS event_images CASCADE');
    await query('DROP TABLE IF EXISTS reviews CASCADE');
    await query('DROP TABLE IF EXISTS bookings CASCADE');
    await query('DROP TABLE IF EXISTS events CASCADE');
    await query('DROP TABLE IF EXISTS venues CASCADE');
    await query('DROP TABLE IF EXISTS categories CASCADE');
    await query('DROP TABLE IF EXISTS users CASCADE');

    console.log('✓ All tables dropped');

    // Recreate tables
    console.log('Recreating tables...');
    
    // Users table
    await query(`
      CREATE TABLE users (
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

    // Categories table
    await query(`
      CREATE TABLE categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Venues table
    await query(`
      CREATE TABLE venues (
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

    // Events table
    await query(`
      CREATE TABLE events (
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

    // Bookings table
    await query(`
      CREATE TABLE bookings (
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

    // Reviews table
    await query(`
      CREATE TABLE reviews (
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

    // Event images table
    await query(`
      CREATE TABLE event_images (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        alt_text VARCHAR(255),
        is_primary BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User sessions table
    await query(`
      CREATE TABLE user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes
    await query('CREATE INDEX idx_events_category ON events(category_id)');
    await query('CREATE INDEX idx_events_venue ON events(venue_id)');
    await query('CREATE INDEX idx_events_organizer ON events(organizer_id)');
    await query('CREATE INDEX idx_events_date ON events(start_date)');
    await query('CREATE INDEX idx_bookings_user ON bookings(user_id)');
    await query('CREATE INDEX idx_bookings_event ON bookings(event_id)');
    await query('CREATE INDEX idx_reviews_event ON reviews(event_id)');
    await query('CREATE INDEX idx_users_email ON users(email)');
    await query('CREATE INDEX idx_users_google_id ON users(google_id)');

    console.log('✓ Database reset completed successfully!');

  } catch (error) {
    console.error('Database reset failed:', error);
    process.exit(1);
  }
};

// Run reset if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  resetDatabase();
}

export default resetDatabase;
