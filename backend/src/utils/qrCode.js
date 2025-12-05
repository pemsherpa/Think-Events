import QRCode from 'qrcode';
import logger from './logger.js';

export const generateTicketQR = async (bookingData) => {
  try {
    // Create a secure payload for the QR code
    // In a real app, this might be a signed JWT or a unique ticket ID hash
    const payload = JSON.stringify({
      booking_id: bookingData.id,
      event_id: bookingData.event_id,
      user_id: bookingData.user_id,
      seats: bookingData.seat_numbers,
      timestamp: new Date().toISOString()
    });

    // Generate QR code as a Data URL (base64 image)
    const qrCodeDataUrl = await QRCode.toDataURL(payload);
    return qrCodeDataUrl;
  } catch (error) {
    logger.error('Error generating QR code:', error);
    throw error;
  }
};
