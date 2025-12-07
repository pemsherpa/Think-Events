// This is a debug version with enhanced logging
// Copy the sendTicketEmailAsync function from this file to paymentService.js

const sendTicketEmailAsync = async (booking_id) => {
    try {
        console.log('=== SEND TICKET EMAIL STARTED ===');
        console.log('Booking ID:', booking_id);

        // Step 1: Fetch booking details
        console.log('Step 1: Fetching booking details...');
        const bookingDetails = await query(`
      SELECT 
        b.id, b.event_id, b.seat_numbers, b.quantity, b.total_amount, b.currency,
        e.title as event_title, e.start_date, e.start_time, e.end_time,
        v.name as venue_name, v.city as venue_city, v.address as venue_address,
        u.email, u.first_name, u.last_name, u.id as user_id
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      JOIN venues v ON e.venue_id = v.id
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1
    `, [booking_id]);

        if (bookingDetails.rows.length === 0) {
            console.error('ERROR: Booking not found');
            throw new Error('Booking not found');
        }

        const booking = bookingDetails.rows[0];
        console.log('✓ Booking found:', booking.id, booking.email);

        // Step 2: Prepare ticket details
        console.log('Step 2: Preparing ticket details...');
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
            venue_address: booking.venue_address,
            seat_numbers: booking.seat_numbers,
            quantity: booking.quantity,
            total_amount: booking.total_amount,
            currency: booking.currency,
            user_name: `${booking.first_name} ${booking.last_name}`.trim() || 'Guest',
        };
        console.log('✓ Ticket details prepared');

        // Step 3: Generate PDF
        console.log('Step 3: Generating PDF...');
        const pdfBuffer = await generateTicketPDF(ticketDetails);
        console.log('✓ PDF generated, size:', pdfBuffer.length, 'bytes');

        // Step 4: Send email
        console.log('Step 4: Sending email to:', booking.email);
        const emailResult = await sendTicketEmail(booking.email, ticketDetails, pdfBuffer);

        if (emailResult.success) {
            console.log('✅ EMAIL SENT SUCCESSFULLY');
            logger.info(`Ticket email sent successfully to ${booking.email} for booking ${booking_id}`);
        } else {
            console.error('❌ EMAIL FAILED:', emailResult.error);
            logger.error(`Failed to send ticket email to ${booking.email}:`, emailResult.error);
        }

        return emailResult;
    } catch (error) {
        console.error('=== ERROR IN SEND TICKET EMAIL ===');
        console.error('Error type:', typeof error);
        console.error('Error message:', error?.message || 'No message');
        console.error('Error stack:', error?.stack || 'No stack');
        console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        logger.error('Error in sendTicketEmailAsync:', error);
        throw error;
    }
};
