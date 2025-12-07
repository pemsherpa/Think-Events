// Updated test with better debugging
import { query } from './src/config/database.js';
import { sendTicketEmail } from './src/utils/emailService.js';
import { generateTicketPDF } from './src/utils/pdfGenerator.js';
import dotenv from 'dotenv';

dotenv.config();

const testTicketEmail = async () => {
    try {
        console.log('=== TESTING TICKET EMAIL ===\n');

        const booking_id = 98;

        console.log('Step 1: Checking if booking exists...');
        const simpleCheck = await query('SELECT * FROM bookings WHERE id = $1', [booking_id]);
        if (simpleCheck.rows.length === 0) {
            console.error('❌ Booking does not exist in database!');
            process.exit(1);
        }
        console.log('✓ Booking exists');
        console.log('  Booking data:', simpleCheck.rows[0]);
        console.log();

        console.log('Step 2: Fetching with JOINs...');
        const bookingDetails = await query(`
      SELECT 
        b.id, b.event_id, b.seat_numbers, b.quantity, b.total_amount, b.currency,
        e.title as event_title, e.start_date, e.start_time, e.end_time,
        v.name as venue_name, v.city as venue_city, v.address as venue_address,
        u.email, u.first_name, u.last_name, u.id as user_id
      FROM bookings b
      LEFT JOIN events e ON b.event_id = e.id
      LEFT JOIN venues v ON e.venue_id = v.id
      LEFT JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [booking_id]);

        if (bookingDetails.rows.length === 0) {
            console.error('❌ JOIN query returned no results!');
            console.error('This means one of the JOINs failed.');
            process.exit(1);
        }

        const booking = bookingDetails.rows[0];
        console.log('✓ Booking details fetched');
        console.log('  Email:', booking.email);
        console.log('  Event:', booking.event_title);
        console.log('  Venue:', booking.venue_name);
        console.log('  Seats:', booking.seat_numbers);
        console.log();

        console.log('Step 3: Preparing ticket details...');
        const ticketDetails = {
            id: booking.id,
            event_id: booking.event_id,
            user_id: booking.user_id,
            event_title: booking.event_title,
            start_date: booking.start_date,
            start_time: booking.start_time,
            end_time: booking.end_time,
            venue_name: booking.venue_name,
            venue_city: booking.venue_city,
            venue_address: booking.venue_address || '',
            seat_numbers: booking.seat_numbers,
            quantity: booking.quantity,
            total_amount: booking.total_amount,
            currency: booking.currency,
            user_name: `${booking.first_name} ${booking.last_name}`.trim() || 'Guest',
        };
        console.log('✓ Ticket details prepared');
        console.log();

        console.log('Step 4: Generating PDF...');
        const pdfBuffer = await generateTicketPDF(ticketDetails);
        console.log('✓ PDF generated');
        console.log('  Size:', pdfBuffer.length, 'bytes');
        console.log();

        console.log('Step 5: Sending email...');
        console.log('  To:', booking.email);
        console.log('  SMTP User:', process.env.SMTP_USER);
        console.log('  SMTP Pass:', process.env.SMTP_PASS ? '***set***' : 'NOT SET');
        console.log();

        const emailResult = await sendTicketEmail(booking.email, ticketDetails, pdfBuffer);

        if (emailResult.success) {
            console.log('✅ EMAIL SENT SUCCESSFULLY!');
            console.log('\nCheck your inbox at:', booking.email);
        } else {
            console.log('❌ EMAIL FAILED');
            console.log('Error:', emailResult.error);
        }

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR OCCURRED:');
        console.error('Message:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
};

testTicketEmail();
