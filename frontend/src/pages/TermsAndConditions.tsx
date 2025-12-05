import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Shield, CreditCard, Users, AlertCircle } from 'lucide-react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

const TermsAndConditions = () => {
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
            <FileText className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Terms and Conditions
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-2 text-purple-600" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By accessing and using Think Events ("the Platform", "we", "us", or "our"), you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all users, including event attendees, organizers, and visitors.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Users className="h-6 w-6 mr-2 text-purple-600" />
                2. User Accounts and Registration
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>
                  <strong>2.1 Account Creation:</strong> To use certain features of the Platform, you must create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and update your account information to keep it accurate</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p>
                  <strong>2.2 Account Eligibility:</strong> You must be at least 18 years old or have parental consent to use our services. By creating an account, you represent that you meet this requirement.
                </p>
                <p>
                  <strong>2.3 Account Termination:</strong> We reserve the right to suspend or terminate your account if you violate these terms or engage in fraudulent, abusive, or illegal activity.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <CreditCard className="h-6 w-6 mr-2 text-purple-600" />
                3. Event Bookings and Payments
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>
                  <strong>3.1 Booking Process:</strong> When you book an event through our Platform:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You enter into a contract directly with the event organizer</li>
                  <li>We act as an intermediary platform facilitating the transaction</li>
                  <li>All bookings are subject to availability and organizer approval</li>
                  <li>You must provide accurate booking information</li>
                </ul>
                <p>
                  <strong>3.2 Payment Terms:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All prices are displayed in Nepalese Rupees (NPR) and include applicable taxes (13% VAT)</li>
                  <li>Payment must be completed at the time of booking</li>
                  <li>We accept payments through eSewa, Khalti, and other authorized payment gateways</li>
                  <li>All transactions are processed securely through third-party payment processors</li>
                  <li>You will receive a confirmation email upon successful payment</li>
                </ul>
                <p>
                  <strong>3.3 Pricing:</strong> Event organizers set ticket prices. We are not responsible for pricing errors. If a pricing error is discovered, we reserve the right to cancel your booking and refund your payment.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertCircle className="h-6 w-6 mr-2 text-purple-600" />
                4. Cancellations and Refunds
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>
                  <strong>4.1 Cancellation by Attendee:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cancellation policies are set by individual event organizers</li>
                  <li>Refund eligibility depends on the organizer's cancellation policy</li>
                  <li>Processing fees may apply to refunds</li>
                  <li>Refunds, if approved, will be processed within 7-14 business days</li>
                  <li>To cancel, contact us at support@thinkevents.com or through your account dashboard</li>
                </ul>
                <p>
                  <strong>4.2 Cancellation by Organizer:</strong> If an event is cancelled by the organizer:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You will be notified via email and/or SMS</li>
                  <li>Full refunds will be processed automatically</li>
                  <li>Refunds will be credited to your original payment method</li>
                  <li>We are not liable for any additional costs incurred (travel, accommodation, etc.)</li>
                </ul>
                <p>
                  <strong>4.3 Event Changes:</strong> Organizers may modify event details (date, time, venue). We will notify you of significant changes. You may be entitled to a refund if changes are substantial.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                5. Organizer Responsibilities
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>If you create events on our Platform as an organizer, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete event information</li>
                  <li>Honor all bookings and deliver events as described</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Obtain necessary permits and licenses for your events</li>
                  <li>Maintain appropriate insurance coverage</li>
                  <li>Respond promptly to attendee inquiries and issues</li>
                  <li>Process refunds according to your stated cancellation policy</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                6. User Conduct and Prohibited Activities
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the Platform for any illegal purpose or in violation of any laws</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation</li>
                  <li>Interfere with or disrupt the Platform or servers</li>
                  <li>Attempt to gain unauthorized access to any portion of the Platform</li>
                  <li>Use automated systems (bots, scrapers) to access the Platform</li>
                  <li>Resell tickets or engage in ticket scalping</li>
                  <li>Create fake events or provide false information</li>
                  <li>Harass, abuse, or harm other users</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                7. Intellectual Property
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>
                  <strong>7.1 Platform Content:</strong> All content on the Platform, including text, graphics, logos, and software, is the property of Think Events or its licensors and is protected by copyright and trademark laws.
                </p>
                <p>
                  <strong>7.2 User Content:</strong> By posting content on the Platform, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content for Platform operations.
                </p>
                <p>
                  <strong>7.3 Event Content:</strong> Event organizers retain ownership of their event content but grant us a license to display and promote it on the Platform.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                8. Limitation of Liability
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>
                  <strong>8.1 Platform Role:</strong> Think Events is a platform that connects event organizers with attendees. We are not responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The quality, safety, or legality of events listed on the Platform</li>
                  <li>The accuracy of event information provided by organizers</li>
                  <li>The ability of organizers to deliver events as described</li>
                  <li>Disputes between attendees and organizers</li>
                </ul>
                <p>
                  <strong>8.2 Limitation:</strong> To the maximum extent permitted by law, Think Events shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                9. Dispute Resolution
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-3">
                <p>
                  <strong>9.1 Governing Law:</strong> These terms are governed by the laws of Nepal. Any disputes shall be subject to the exclusive jurisdiction of the courts of Nepal.
                </p>
                <p>
                  <strong>9.2 Dispute Process:</strong> In case of disputes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contact us first at support@thinkevents.com to attempt resolution</li>
                  <li>We will work with both parties to resolve the issue</li>
                  <li>If resolution cannot be reached, disputes may be resolved through mediation or arbitration</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                10. Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. Material changes will be notified via email or Platform notification. Continued use of the Platform after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                11. Contact Information
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed space-y-2">
                <p>If you have questions about these Terms and Conditions, please contact us:</p>
                <p>
                  <strong>Email:</strong> support@thinkevents.com<br />
                  <strong>Website:</strong> www.thinkevents.com<br />
                  <strong>Address:</strong> Kathmandu, Nepal
                </p>
              </div>
            </section>

            <div className="mt-12 p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By using Think Events, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;

