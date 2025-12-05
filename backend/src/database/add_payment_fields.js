import { query } from '../config/database.js';

/**
 * Migration script to add payment-related fields to bookings table
 * - transaction_uuid: Unique transaction identifier for payment gateway
 * - payment_reference: Reference ID from payment gateway after successful payment
 */

const addPaymentFields = async () => {
  console.log('🔄 Starting migration: Adding payment fields to bookings table...');

  try {
    // Check if columns already exist
    const checkColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name IN ('transaction_uuid', 'payment_reference')
    `);

    const existingColumns = checkColumns.rows.map(row => row.column_name);
    
    // Add transaction_uuid column if it doesn't exist
    if (!existingColumns.includes('transaction_uuid')) {
      await query(`
        ALTER TABLE bookings 
        ADD COLUMN transaction_uuid VARCHAR(255) UNIQUE
      `);
      console.log('✅ Added transaction_uuid column');
    } else {
      console.log('ℹ️  transaction_uuid column already exists');
    }

    // Add payment_reference column if it doesn't exist
    if (!existingColumns.includes('payment_reference')) {
      await query(`
        ALTER TABLE bookings 
        ADD COLUMN payment_reference VARCHAR(255)
      `);
      console.log('✅ Added payment_reference column');
    } else {
      console.log('ℹ️  payment_reference column already exists');
    }

    // Create index on transaction_uuid for faster lookups
    try {
      await query(`
        CREATE INDEX IF NOT EXISTS idx_bookings_transaction_uuid 
        ON bookings(transaction_uuid)
      `);
      console.log('✅ Created index on transaction_uuid');
    } catch (indexError) {
      console.log('ℹ️  Index on transaction_uuid already exists or failed to create');
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration
addPaymentFields();

