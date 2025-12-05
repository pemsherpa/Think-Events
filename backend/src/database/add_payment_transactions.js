import { query } from '../config/database.js';

/**
 * Migration: Create payment_transactions table
 * For logging all payment transactions
 */

const createPaymentTransactionsTable = async () => {
  console.log('🔄 Creating payment_transactions table...');

  try {
    // Create table
    await query(`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        transaction_uuid VARCHAR(255) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        gateway_response JSONB,
        error_message TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ payment_transactions table created');

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id 
      ON payment_transactions(booking_id)
    `);
    console.log('✅ Created index on booking_id');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_uuid 
      ON payment_transactions(transaction_uuid)
    `);
    console.log('✅ Created index on transaction_uuid');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_transactions_status 
      ON payment_transactions(status)
    `);
    console.log('✅ Created index on status');

    console.log('✅ Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
createPaymentTransactionsTable();

