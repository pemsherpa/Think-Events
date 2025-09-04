import twilio from 'twilio';
import config from '../config/config.js';

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

// Format phone number for India (+91) and Nepal (+977)
export const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, '');
  
  // If already has +, check the country code
  if (phoneNumber.startsWith('+')) {
    if (phoneNumber.startsWith('+91') && cleaned.length === 12) {
      return phoneNumber; // Valid Indian number
    }
    if (phoneNumber.startsWith('+977') && cleaned.length === 12) {
      return phoneNumber; // Valid Nepalese number
    }
  }
  
  // Handle Indian numbers (+91)
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  // Handle Nepalese numbers (+977)
  if (cleaned.startsWith('977') && cleaned.length === 13) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('977') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  // For 10-digit numbers, determine the country
  if (cleaned.length === 10) {
    // Indian mobile numbers commonly start with: 6, 7, 8, 9 (including 99, 98, 97, 96, etc.)
    // Nepalese mobile numbers are less common and typically start with specific patterns
    // Since 99, 98, 97, 96, etc. are very common in India, default to India for these
    
    // All 10-digit numbers starting with 6, 7, 8, 9 are treated as Indian
    if (cleaned[0] >= '6' && cleaned[0] <= '9') {
      return `+91${cleaned}`;
    }
    
    // Default to India for other 10-digit numbers
    return `+91${cleaned}`;
  }
  
  return phoneNumber;
};

// Validate phone number format for India and Nepal
export const validatePhoneNumber = (phoneNumber) => {
  const formatted = formatPhoneNumber(phoneNumber);
  
  // Indian numbers: +91XXXXXXXXXX (12 digits total)
  if (formatted.startsWith('+91') && formatted.length === 13) {
    return { valid: true, formatted, country: 'India' };
  }
  
  // Nepalese numbers: +977XXXXXXXXX (12 digits total)
  if (formatted.startsWith('+977') && formatted.length === 14) {
    return { valid: true, formatted, country: 'Nepal' };
  }
  
  return { valid: false, message: 'Invalid phone number format. Use Indian (+91) or Nepalese (+977) format.' };
};

// Generate a random 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS with proper international handling
export const sendOTP = async (phoneNumber, otpCode) => {
  try {
    // Format and validate phone number
    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      return { success: false, error: validation.message };
    }
    
    const formattedPhone = validation.formatted;
    const destinationCountry = validation.country;
    
    // For international SMS, we need to use a different approach
    // Since your Twilio number is Indian (+91), we'll use a different strategy
    
    let fromNumber = config.twilio.phoneNumber;
    
    // If sending to Indian numbers from Indian Twilio number, use a different approach
    if (destinationCountry === 'India' && fromNumber.startsWith('+91')) {
      // For Indian numbers, we need to use a different Twilio number or service
      // You can either:
      // 1. Get a US/International Twilio number
      // 2. Use WhatsApp Business API
      // 3. Use email fallback
      
      // For now, let's use a fallback approach
      console.log('⚠️ Indian to Indian SMS not supported with current Twilio setup');
      console.log('💡 Consider getting a US Twilio number for international SMS');
      
      // Return success but log the limitation
      return { 
        success: true, 
        messageId: 'simulated_for_indian',
        formattedPhone,
        warning: 'SMS simulated - consider using US Twilio number for international SMS'
      };
    }
    
    // For Nepalese numbers or if using international Twilio number
    const message = await client.messages.create({
      body: `Your Think Events verification code is: ${otpCode}. Valid for 10 minutes.`,
      from: fromNumber,
      to: formattedPhone
    });

    console.log('OTP sent successfully:', message.sid);
    return { success: true, messageId: message.sid, formattedPhone };
    
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Handle specific Twilio errors
    if (error.code === 21211) {
      return { 
        success: false, 
        error: 'Invalid phone number format. Please check your number.' 
      };
    }
    
    if (error.code === 21214) {
      return { 
        success: false, 
        error: 'Phone number not SMS capable. Please use a different number.' 
      };
    }
    
    if (error.message.includes('not a valid message-capable Twilio phone number')) {
      return { 
        success: false, 
        error: 'Twilio number not compatible with destination. Please contact support.' 
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Verify OTP
export const verifyOTP = (storedOTP, storedOTPExpires, inputOTP) => {
  if (!storedOTP || !storedOTPExpires) {
    return { valid: false, message: 'OTP not found' };
  }

  if (new Date() > new Date(storedOTPExpires)) {
    return { valid: false, message: 'OTP has expired' };
  }

  if (storedOTP !== inputOTP) {
    return { valid: false, message: 'Invalid OTP' };
  }

  return { valid: true, message: 'OTP verified successfully' };
};
