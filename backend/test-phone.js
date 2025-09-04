import { formatPhoneNumber, validatePhoneNumber } from './src/utils/twilio.js';

console.log('Testing Phone Number Formatting for India and Nepal\n');

// Test Indian numbers
console.log('🇮🇳 Indian Numbers:');
const indianTests = [
  '9876543210',           // 10 digits
  '919876543210',         // 91 + 10 digits
  '+919876543210',        // +91 + 10 digits
  '9876543210',           // 10 digits (default to India)
];

indianTests.forEach(phone => {
  const formatted = formatPhoneNumber(phone);
  const validation = validatePhoneNumber(phone);
  console.log(`Input: ${phone} -> Formatted: ${formatted} -> Valid: ${validation.valid} (${validation.country})`);
});

console.log('\n🇳🇵 Nepalese Numbers:');
const nepaleseTests = [
  '9841234567',           // 10 digits
  '9779841234567',        // 977 + 10 digits
  '+9779841234567',       // +977 + 10 digits
];

nepaleseTests.forEach(phone => {
  const formatted = formatPhoneNumber(phone);
  const validation = validatePhoneNumber(phone);
  console.log(`Input: ${phone} -> Formatted: ${formatted} -> Valid: ${validation.valid} (${validation.country})`);
});

console.log('\n❌ Invalid Numbers:');
const invalidTests = [
  '123',                  // Too short
  '1234567890123456',     // Too long
  'abc123def',            // Contains letters
  '+1234567890',          // Wrong country code
];

invalidTests.forEach(phone => {
  const formatted = formatPhoneNumber(phone);
  const validation = validatePhoneNumber(phone);
  console.log(`Input: ${phone} -> Formatted: ${formatted} -> Valid: ${validation.valid} (${validation.message})`);
});

console.log('\n✅ Phone number formatting tests completed!');
