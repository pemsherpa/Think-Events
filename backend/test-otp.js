import { generateOTP, sendOTP, verifyOTP } from './src/utils/twilio.js';

// Test OTP generation
console.log('Testing OTP generation...');
const otp = generateOTP();
console.log('Generated OTP:', otp);

// Test OTP verification
console.log('\nTesting OTP verification...');
const testOTP = '123456';
const testExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

const verificationResult = verifyOTP(testOTP, testExpires, '123456');
console.log('Verification result:', verificationResult);

const expiredVerification = verifyOTP(testOTP, new Date(Date.now() - 10 * 60 * 1000), '123456');
console.log('Expired OTP verification:', expiredVerification);

const wrongOTPVerification = verifyOTP(testOTP, testExpires, '654321');
console.log('Wrong OTP verification:', wrongOTPVerification);

console.log('\nOTP tests completed!');
