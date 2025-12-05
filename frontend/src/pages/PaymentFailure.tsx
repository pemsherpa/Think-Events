import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Layout/Header';

const PaymentFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);

  useEffect(() => {
    const booking_id = searchParams.get('booking_id');
    const event_id = searchParams.get('event_id');
    
    setBookingId(booking_id);
    setEventId(event_id);

    // Notify backend about the failure (to restore seats)
    if (booking_id) {
      notifyFailure(booking_id);
    }
  }, []);

  const notifyFailure = async (booking_id: string) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      
      await fetch(
        `${API_URL}/api/payment/esewa/failure?booking_id=${booking_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Failed to notify payment failure:', error);
    }
  };

  const handleRetry = () => {
    if (eventId) {
      navigate(`/booking/${eventId}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 bg-red-50">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="h-20 w-20 text-red-600" />
              </div>
              <CardTitle className="text-3xl text-red-900">Payment Cancelled</CardTitle>
              <CardDescription className="text-lg text-red-700">
                Your payment was not completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 mb-2">What happened?</h3>
                <p className="text-gray-700">
                  Your payment transaction was either cancelled or failed during the process. 
                  Don't worry, no money has been deducted from your eSewa account.
                </p>
                
                {bookingId && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Booking Reference:</strong> #{bookingId}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      The selected seats have been released and are now available for booking again.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Common reasons for payment failure:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                  <li>Payment was cancelled by user</li>
                  <li>Insufficient balance in eSewa wallet</li>
                  <li>Session timeout (payment not completed within 5 minutes)</li>
                  <li>Network connectivity issues</li>
                  <li>Incorrect eSewa credentials</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  💡 <strong>Tip:</strong> Make sure you have sufficient balance in your eSewa account and complete the payment within 5 minutes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/')}
                >
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={handleRetry}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;

