import { query } from '../src/config/database.js';

async function cleanupEvents() {
  try {
    console.log('🔍 Checking current events in database...');
    
    // Get current events
    const eventsResult = await query('SELECT id, title, organizer_id, created_at FROM events ORDER BY created_at DESC');
    
    console.log(`\n📊 Found ${eventsResult.rows.length} events in database:`);
    console.table(eventsResult.rows);
    
    if (eventsResult.rows.length === 0) {
      console.log('✅ No events to clean up.');
      return;
    }
    
    console.log('\n🗑️  Cleaning up all events...');
    
    // Start transaction
    await query('BEGIN');
    
    try {
      // Delete related data first (foreign key constraints)
      
      // Delete seat bookings
      await query(`
        DELETE FROM seat_bookings 
        WHERE booking_id IN (
          SELECT b.id FROM bookings b 
          WHERE b.event_id IN (SELECT id FROM events)
        )
      `);
      console.log('✅ Deleted seat bookings');
      
      // Delete bookings
      await query('DELETE FROM bookings WHERE event_id IN (SELECT id FROM events)');
      console.log('✅ Deleted bookings');
      
      // Delete seats
      await query(`
        DELETE FROM seats 
        WHERE layout_id IN (
          SELECT sl.id FROM seat_layouts sl 
          WHERE sl.event_id IN (SELECT id FROM events)
        )
      `);
      console.log('✅ Deleted seats');
      
      // Delete seat layouts
      await query('DELETE FROM seat_layouts WHERE event_id IN (SELECT id FROM events)');
      console.log('✅ Deleted seat layouts');
      
      // Delete events
      await query('DELETE FROM events');
      console.log('✅ Deleted events');
      
      // Commit transaction
      await query('COMMIT');
      
      console.log('\n🎉 Successfully cleaned up all events and related data!');
      
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error cleaning up events:', error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupEvents().then(() => {
  console.log('✅ Cleanup completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
