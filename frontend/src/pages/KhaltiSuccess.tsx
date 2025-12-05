import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, XCircle, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Layout/Header';
import { useAuth } from '@/contexts/AuthContext';

const KhaltiSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchBooking = async (bookingId: string, retries = 3) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setVerificationStatus('failed');
      setErrorMessage('Please log in to view your booking details.');
      return;
    }

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`${API_URL}/api/bookings/${bookingId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) throw new Error('Please log in again');
          if (response.status === 404 && attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          throw new Error(`Failed to fetch booking: ${response.status}`);
        }

        const { success, data } = await response.json();
        
        if (success && data && (data.payment_status === 'completed' || data.status === 'confirmed')) {
          setVerificationStatus('success');
          setBookingDetails(data);
          await refreshUser();
          return;
        }

        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        setVerificationStatus('failed');
        setErrorMessage('Payment is being processed. Please check your bookings.');
        
      } catch (error: any) {
        if (attempt === retries) {
          console.error('Booking fetch error:', error);
          setVerificationStatus('failed');
          setErrorMessage(error.message || 'Failed to retrieve booking');
        }
      }
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const bookingId = searchParams.get('booking_id');

        if (!bookingId) {
          setVerificationStatus('failed');
          setErrorMessage('Missing booking ID');
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchBooking(bookingId);

      } catch (error: any) {
        console.error('Payment verification error:', error);
        setVerificationStatus('failed');
        setErrorMessage('Failed to verify payment');
      }
    };

    verifyPayment();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {verificationStatus === 'verifying' && (
            <Card className="text-center py-12">
              <CardContent className="pt-6">
                <Loader2 className="h-16 w-16 text-purple-600 animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h2>
                <p className="text-gray-600">Please wait while we confirm your payment with Khalti...</p>
              </CardContent>
            </Card>
          )}

          {verificationStatus === 'success' && (
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-20 w-20 text-purple-600" />
                </div>
                <CardTitle className="text-3xl text-purple-900">Payment Successful!</CardTitle>
                <CardDescription className="text-lg text-purple-700">
                  Your booking has been confirmed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-gray-600">Booking ID</span>
                    <span className="font-semibold text-gray-900">#{bookingDetails?.id}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="font-mono text-sm text-gray-900">{bookingDetails?.payment_reference}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-gray-600">Number of Seats</span>
                    <span className="font-semibold text-gray-900">{bookingDetails?.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-bold text-lg text-gray-900">
                      रु {bookingDetails?.total_amount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-purple-900 text-center">
                    🎉 You've earned {bookingDetails?.quantity * 100} reward points!
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    📧 A confirmation email with your ticket details has been sent.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                    <Download className="mr-2 h-4 w-4" />
                    View My Bookings
                  </Button>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/')}>
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {verificationStatus === 'failed' && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <XCircle className="h-20 w-20 text-red-600" />
                </div>
                <CardTitle className="text-3xl text-red-900">Payment Verification Failed</CardTitle>
                <CardDescription className="text-lg text-red-700">
                  {errorMessage || 'We could not verify your payment'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-white rounded-lg p-6">
                  <p className="text-gray-700 mb-4">
                    If money was deducted, please don't worry. We will verify and confirm your booking shortly.
                  </p>
                  <p className="text-sm text-gray-600">
                    For assistance, contact support with your transaction details.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
                    View My Bookings
                  </Button>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/')}>
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default KhaltiSuccess;

