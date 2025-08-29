import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Database connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  max: 10, // Reduced max connections
  idleTimeoutMillis: 60000, // Increased idle timeout
  connectionTimeoutMillis: 10000, // Increased connection timeout
  acquireTimeoutMillis: 10000, // Timeout for acquiring connection
  reapIntervalMillis: 1000, // Check for dead connections every second
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to Neon Database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  // Don't exit the process, just log the error
});

// Test the connection immediately
const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connection test successful:', result.rows[0]);
    client.release();
  } catch (error) {
    console.error('❌ Database connection test failed:', error.message);
    // Don't exit, just log the error
  }
};

testConnection();

// Helper function to run queries
export const query = (text, params) => pool.query(text, params);

// Helper function to get a client from the pool
export const getClient = () => pool.connect();

// Export the pool for direct access if needed
export default pool;
