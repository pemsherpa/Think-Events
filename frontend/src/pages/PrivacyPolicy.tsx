import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Globe } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = 'December 5, 2024';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-purple-600 hover:text-purple-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
          <div className="flex items-center space-x-3 mb-8">
            <Shield className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Privacy Policy
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Introduction
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Think Events ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our event booking platform. Please read this policy carefully to understand our practices regarding your personal data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Database className="h-6 w-6 mr-2 text-purple-600" />
                1. Information We Collect
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                <div>
                  <p className="font-semibold mb-2">1.1 Personal Information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Account Information:</strong> Name, email address, phone number, username, password (hashed)</li>
                    <li><strong>Profile Information:</strong> Date of birth, gender, address, city, state, zip code, profile picture</li>
                    <li><strong>Payment Information:</strong> Payment method details (processed securely through third-party payment gateways)</li>
                    <li><strong>Booking Information:</strong> Event bookings, seat selections, ticket details, transaction history</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">1.2 Automatically Collected Information:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Device Information:</strong> IP address, browser type, device type, operating system</li>
                    <li><strong>Usage Data:</strong> Pages visited, time spent on pages, clicks, search queries</li>
                    <li><strong>Location Data:</strong> General location based on IP address (if permitted)</li>
                    <li><strong>Cookies and Tracking:</strong> See our Cookie Policy section below</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">1.3 Information from Third Parties:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Google OAuth:</strong> If you sign in with Google, we receive your Google profile information (name, email, profile picture)</li>
                    <li><strong>Payment Processors:</strong> Transaction confirmations and payment status from eSewa, Khalti, and other payment gateways</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Eye className="h-6 w-6 mr-2 text-purple-600" />
                2. How We Use Your Information
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>We use your information for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Service Provision:</strong> To process bookings, manage your account, and provide customer support</li>
                  <li><strong>Communication:</strong> To send booking confirmations, event updates, important service notifications, and respond to your inquiries</li>
                  <li><strong>Payment Processing:</strong> To process payments, verify transactions, and prevent fraud</li>
                  <li><strong>Personalization:</strong> To customize your experience, recommend events, and show relevant content</li>
                  <li><strong>Marketing:</strong> To send promotional emails about events and special offers (with your consent)</li>
                  <li><strong>Analytics:</strong> To analyze usage patterns, improve our services, and develop new features</li>
                  <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
                  <li><strong>Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Globe className="h-6 w-6 mr-2 text-purple-600" />
                3. Information Sharing and Disclosure
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                <p>We do not sell your personal information. We may share your information in the following circumstances:</p>
                <div>
                  <p className="font-semibold mb-2">3.1 With Event Organizers:</p>
                  <p>When you book an event, we share necessary information (name, email, phone, booking details) with the event organizer to facilitate the event.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">3.2 With Service Providers:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Payment Processors:</strong> eSewa, Khalti, and other payment gateways to process transactions</li>
                    <li><strong>Email Services:</strong> To send transactional and marketing emails</li>
                    <li><strong>SMS Services:</strong> To send OTP codes and booking confirmations via SMS</li>
                    <li><strong>Cloud Hosting:</strong> To store and process data securely</li>
                    <li><strong>Analytics Providers:</strong> To analyze website usage and improve services</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">3.3 Legal Requirements:</p>
                  <p>We may disclose information if required by law, court order, or government regulation, or to protect our rights, property, or safety.</p>
                </div>
                <div>
                  <p className="font-semibold mb-2">3.4 Business Transfers:</p>
                  <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Lock className="h-6 w-6 mr-2 text-purple-600" />
                4. Data Security
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>We implement industry-standard security measures to protect your information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Encryption:</strong> Data transmitted over the internet is encrypted using SSL/TLS</li>
                  <li><strong>Password Security:</strong> Passwords are hashed using bcrypt before storage</li>
                  <li><strong>Access Controls:</strong> Limited access to personal data on a need-to-know basis</li>
                  <li><strong>Secure Storage:</strong> Data stored in secure databases with regular backups</li>
                  <li><strong>Payment Security:</strong> Payment information is processed through PCI-DSS compliant payment gateways</li>
                  <li><strong>Regular Audits:</strong> Security assessments and vulnerability testing</li>
                </ul>
                <p className="mt-4">
                  However, no method of transmission over the internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Your Privacy Rights
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information through your account settings</li>
                  <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
                  <li><strong>Data Portability:</strong> Request your data in a portable format</li>
                  <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time</li>
                  <li><strong>Cookie Preferences:</strong> Manage cookie settings in your browser</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact us at <strong>support@thinkevents.com</strong> or through your account settings.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. Cookies and Tracking Technologies
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>We use cookies and similar technologies to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Authenticate your account</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Enable social media features</li>
                </ul>
                <p className="mt-4">
                  <strong>Types of Cookies:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for the Platform to function</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the Platform</li>
                  <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
                <p className="mt-4">
                  You can control cookies through your browser settings. However, disabling cookies may affect Platform functionality.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Third-Party Services
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>Our Platform integrates with third-party services that have their own privacy policies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Google OAuth:</strong> For authentication. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">Google's Privacy Policy</a></li>
                  <li><strong>Payment Gateways:</strong> eSewa, Khalti process payments. They handle payment data according to their privacy policies</li>
                  <li><strong>Email Services:</strong> For sending transactional and marketing emails</li>
                  <li><strong>SMS Services:</strong> For sending OTP codes and notifications</li>
                </ul>
                <p className="mt-4">
                  We are not responsible for the privacy practices of third-party services. We encourage you to review their privacy policies.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Data Retention
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>We retain your personal information for as long as necessary to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain security and prevent fraud</li>
                </ul>
                <p className="mt-4">
                  When you delete your account, we will delete or anonymize your personal data within 30 days, except where we are required to retain it for legal purposes.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our Platform is not intended for children under 18 years of age. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. International Data Transfers
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Your information may be transferred to and processed in countries other than Nepal. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Mail className="h-6 w-6 mr-2 text-purple-600" />
                11. Contact Us
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
                <p>If you have questions, concerns, or requests regarding this Privacy Policy, please contact us:</p>
                <p>
                  <strong>Email:</strong> support@thinkevents.com<br />
                  <strong>Website:</strong> www.thinkevents.com<br />
                  <strong>Address:</strong> Kathmandu, Nepal
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. Material changes will be notified via email or Platform notification. The "Last updated" date at the top indicates when changes were made. Continued use of the Platform after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <div className="mt-12 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By using Think Events, you acknowledge that you have read and understood this Privacy Policy and consent to the collection and use of your information as described herein.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

