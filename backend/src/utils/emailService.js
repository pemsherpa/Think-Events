import nodemailer from 'nodemailer';
import config from '../config/config.js';
import logger from './logger.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email.user,
    pass: config.email.pass,
  },
  tls: {
    rejectUnauthorized: false
  }
});

export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Think Events" <${config.email.user}>`,
    to: email,
    replyTo: config.email.user,
    subject: 'Think Events - Verify Your Account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Think Events</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Verify Your Email Address</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0;">Thank you for signing up with Think Events! Please use the following OTP to verify your account:</p>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
              <h1 style="color: #667eea; letter-spacing: 8px; margin: 0; font-size: 36px; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #666; line-height: 1.6; margin: 0 0 10px 0;">This OTP is valid for 10 minutes.</p>
            <p style="color: #999; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">If you didn't request this, please ignore this email.</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">© 2024 Think Events. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
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
    from: `"Think Events" <${config.email.user}>`,
    to: email,
    replyTo: config.email.user,
    subject: `Think Events - Booking Confirmation for ${ticketDetails.event_title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Booking Confirmed</h1>
          </div>
          <div style="padding: 40px 30px;">
            <p style="color: #333; font-size: 18px; margin: 0 0 10px 0;">Hi ${ticketDetails.user_name},</p>
            <p style="color: #666; line-height: 1.6; margin: 0 0 30px 0;">Great news! Your booking for <strong>${ticketDetails.event_title}</strong> has been confirmed. Your ticket is attached to this email as a PDF.</p>
            
            <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #667eea; margin: 0 0 15px 0; font-size: 18px;">Event Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                  <td style="padding: 8px 0; color: #333;">${new Date(ticketDetails.start_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Time:</td>
                  <td style="padding: 8px 0; color: #333;">${ticketDetails.start_time}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Venue:</td>
                  <td style="padding: 8px 0; color: #333;">${ticketDetails.venue_name}, ${ticketDetails.venue_city}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Seats:</td>
                  <td style="padding: 8px 0; color: #333;">${ticketDetails.seat_numbers.join(', ')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: bold;">Amount Paid:</td>
                  <td style="padding: 8px 0; color: #333; font-weight: bold;">${ticketDetails.currency} ${ticketDetails.total_amount}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #856404; margin: 0; font-size: 14px;"><strong>Important:</strong> Please bring your ticket (PDF attached) to the venue. You can show it on your phone or print it out.</p>
            </div>

            <p style="color: #666; line-height: 1.6; margin: 20px 0 0 0;">We're excited to see you at the event! If you have any questions, feel free to reply to this email.</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0 0 5px 0;">© 2024 Think Events. All rights reserved.</p>
            <p style="color: #999; font-size: 11px; margin: 0;">This is an automated confirmation email for your booking.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    attachments: [
      {
        filename: `Ticket-${ticketDetails.event_title.replace(/\s+/g, '-')}-${ticketDetails.id}.pdf`,
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
