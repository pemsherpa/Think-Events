import { query } from '../config/database.js';

const createSeatLayoutTables = async () => {
  try {
    console.log('🚀 Creating seat layout tables...');

    // Seat categories table
    await query(`
      CREATE TABLE IF NOT EXISTS seat_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        color VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Seat categories table created');

    // Seat layouts table
    await query(`
      CREATE TABLE IF NOT EXISTS seat_layouts (
        id SERIAL PRIMARY KEY,
        event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
        venue_type VARCHAR(20) NOT NULL CHECK (venue_type IN ('theater', 'open_ground', 'simple_counter')),
        layout_name VARCHAR(100) NOT NULL,
        total_rows INTEGER NOT NULL DEFAULT 0,
        total_columns INTEGER NOT NULL DEFAULT 0,
        booking_type VARCHAR(20) NOT NULL DEFAULT 'one_time' CHECK (booking_type IN ('one_time', 'multiple')),
        max_bookings_per_seat INTEGER DEFAULT 1,
        layout_config JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Seat layouts table created');

    // Individual seats table
    await query(`
      CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        layout_id INTEGER REFERENCES seat_layouts(id) ON DELETE CASCADE,
        row_number INTEGER NOT NULL,
        column_number INTEGER NOT NULL,
        seat_number VARCHAR(10) NOT NULL,
        category_id INTEGER REFERENCES seat_categories(id),
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        is_available BOOLEAN DEFAULT TRUE,
        max_capacity INTEGER DEFAULT 1,
        current_bookings INTEGER DEFAULT 0,
        seat_type VARCHAR(20) DEFAULT 'standard' CHECK (seat_type IN ('standard', 'aisle', 'disabled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(layout_id, row_number, column_number)
      )
    `);
    console.log('✓ Seats table created');

    // Seat bookings table (for tracking individual seat bookings)
    await query(`
      CREATE TABLE IF NOT EXISTS seat_bookings (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        seat_id INTEGER REFERENCES seats(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        unit_price DECIMAL(10, 2) NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        booking_status VARCHAR(20) DEFAULT 'confirmed' CHECK (booking_status IN ('pending', 'confirmed', 'cancelled')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Seat bookings table created');

    // Insert default seat categories
    const defaultCategories = [
      { name: 'VIP', color: '#F59E0B', description: 'Premium VIP seating' },
      { name: 'Premium', color: '#3B82F6', description: 'Premium seating' },
      { name: 'Standard', color: '#10B981', description: 'Standard seating' },
      { name: 'Economy', color: '#6B7280', description: 'Economy seating' },
      { name: 'Disabled', color: '#EF4444', description: 'Disabled/Unavailable seats' }
    ];

    for (const category of defaultCategories) {
      await query(`
        INSERT INTO seat_categories (name, color, description) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (name) DO NOTHING
      `, [category.name, category.color, category.description]);
    }
    console.log('✓ Default seat categories inserted');

    // Create indexes for performance (after all tables are created)
    await query('CREATE INDEX IF NOT EXISTS idx_seat_layouts_event_id ON seat_layouts(event_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_seats_layout_id ON seats(layout_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_seats_row_col ON seats(layout_id, row_number, column_number)');
    await query('CREATE INDEX IF NOT EXISTS idx_seat_bookings_booking_id ON seat_bookings(booking_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_seat_bookings_seat_id ON seat_bookings(seat_id)');
    console.log('✓ Indexes created');

    console.log('✅ Seat layout tables created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating seat layout tables:', error);
    throw error;
  }
};

// Function to drop seat layout tables (for testing/reset)
const dropSeatLayoutTables = async () => {
  try {
    console.log('🗑️  Dropping seat layout tables...');
    
    await query('DROP TABLE IF EXISTS seat_bookings CASCADE');
    await query('DROP TABLE IF EXISTS seats CASCADE');
    await query('DROP TABLE IF EXISTS seat_layouts CASCADE');
    await query('DROP TABLE IF EXISTS seat_categories CASCADE');
    
    console.log('✅ Seat layout tables dropped successfully!');
    
  } catch (error) {
    console.error('❌ Error dropping seat layout tables:', error);
    throw error;
  }
};

// Main execution
const main = async () => {
  const action = process.argv[2];
  
  try {
    if (action === 'drop') {
      await dropSeatLayoutTables();
    } else {
      await createSeatLayoutTables();
    }
    
    console.log('🎉 Migration completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
main();
