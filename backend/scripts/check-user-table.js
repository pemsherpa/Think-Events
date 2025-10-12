import { query } from '../src/config/database.js';

async function checkUserTable() {
  try {
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('Users table columns:');
    console.table(result.rows);
    
    // Also check a sample user
    const userResult = await query('SELECT * FROM users LIMIT 1');
    if (userResult.rows.length > 0) {
      console.log('\nSample user data:');
      console.log(userResult.rows[0]);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUserTable().then(() => process.exit(0)).catch(() => process.exit(1));
