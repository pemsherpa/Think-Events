import nodemailer from 'nodemailer';
import config from '../config/config.js';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
});

export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: 'Think Events - Verify Your Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email Address</h2>
        <p>Thank you for signing up with Think Events! Please use the following OTP to verify your account:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP is valid for 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    logger.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

export const sendTicketEmail = async (email, ticketDetails, pdfBuffer) => {
  const mailOptions = {
    from: config.email.user,
    to: email,
    subject: `Think Events - Ticket Confirmation: ${ticketDetails.event_title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Your Ticket is Confirmed!</h2>
        <p>Hi ${ticketDetails.user_name},</p>
        <p>Your booking for <strong>${ticketDetails.event_title}</strong> has been confirmed.</p>
        <p>Please find your ticket attached as a PDF.</p>
        
        <div style="border: 1px solid #ddd; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Date:</strong> ${new Date(ticketDetails.start_date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${ticketDetails.start_time}</p>
          <p><strong>Venue:</strong> ${ticketDetails.venue_name}, ${ticketDetails.venue_city}</p>
          <p><strong>Seats:</strong> ${ticketDetails.seat_numbers.join(', ')}</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `Ticket-${ticketDetails.event_title.replace(/\s+/g, '-')}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    logger.error('Error sending ticket email:', error);
    return { success: false, error: error.message };
  }
};
