import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';

export const generateTicketPDF = async (ticketDetails) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Generate QR Code
      const qrPayload = JSON.stringify({
        booking_id: ticketDetails.id,
        event_id: ticketDetails.event_id,
        user_id: ticketDetails.user_id,
        seats: ticketDetails.seat_numbers,
        timestamp: new Date().toISOString()
      });
      const qrCodeDataUrl = await QRCode.toDataURL(qrPayload);

      // --- PDF Content ---

      // Header
      doc.fillColor('#444444')
         .fontSize(20)
         .text('Think Events', 110, 57)
         .fontSize(10)
         .text('Think Events', 200, 50, { align: 'right' })
         .text('Ticket Confirmation', 200, 65, { align: 'right' })
         .moveDown();

      // Horizontal Line
      doc.strokeColor('#aaaaaa')
         .lineWidth(1)
         .moveTo(50, 90)
         .lineTo(550, 90)
         .stroke();

      // Event Title
      doc.fontSize(25)
         .text(ticketDetails.event_title, 50, 110);

      // Event Details
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Date:', 50, 160)
         .font('Helvetica')
         .text(new Date(ticketDetails.start_date).toLocaleDateString(), 150, 160)
         
         .font('Helvetica-Bold')
         .text('Time:', 50, 180)
         .font('Helvetica')
         .text(ticketDetails.start_time, 150, 180)
         
         .font('Helvetica-Bold')
         .text('Venue:', 50, 200)
         .font('Helvetica')
         .text(`${ticketDetails.venue_name}, ${ticketDetails.venue_city}`, 150, 200);

      // Booking Details
      doc.moveDown();
      doc.font('Helvetica-Bold')
         .text('Booking ID:', 50, 240)
         .font('Helvetica')
         .text(ticketDetails.id, 150, 240)
         
         .font('Helvetica-Bold')
         .text('Name:', 50, 260)
         .font('Helvetica')
         .text(ticketDetails.user_name, 150, 260)
         
         .font('Helvetica-Bold')
         .text('Seats:', 50, 280)
         .font('Helvetica')
         .text(ticketDetails.seat_numbers.join(', '), 150, 280)
         
         .font('Helvetica-Bold')
         .text('Quantity:', 50, 300)
         .font('Helvetica')
         .text(ticketDetails.quantity, 150, 300)
         
         .font('Helvetica-Bold')
         .text('Total Amount:', 50, 320)
         .font('Helvetica')
         .text(`${ticketDetails.currency} ${ticketDetails.total_amount}`, 150, 320);

      // QR Code
      doc.image(qrCodeDataUrl, 400, 150, { width: 150, height: 150 });
      doc.fontSize(10)
         .text('Scan at entrance', 400, 310, { width: 150, align: 'center' });

      // Footer
      doc.fontSize(10)
         .text(
           'Thank you for booking with Think Events. Please present this ticket at the venue entrance.',
           50,
           700,
           { align: 'center', width: 500 }
         );

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
};
