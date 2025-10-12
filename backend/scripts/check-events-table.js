import { query } from '../src/config/database.js';

async function checkEventsTable() {
  try {
    const result = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      ORDER BY ordinal_position
    `);
    
    console.log('Events table columns:');
    console.table(result.rows);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkEventsTable().then(() => process.exit(0)).catch(() => process.exit(1));
