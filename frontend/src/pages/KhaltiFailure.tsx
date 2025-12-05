import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Layout/Header';

const KhaltiFailure = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status');
  const error = searchParams.get('error');

  const getMessage = () => {
    if (status === 'User canceled') return 'You cancelled the payment';
    if (error === 'invalid_pidx') return 'Invalid payment identifier';
    if (error === 'booking_not_found') return 'Booking not found';
    return 'Payment was not completed';
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
                {getMessage()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-white rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-gray-900 mb-2">What happened?</h3>
                <p className="text-gray-700">
                  Your payment was either cancelled or failed. No money has been deducted from your Khalti account.
                </p>
                
                {status && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Status:</strong> {status}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">Common reasons:</h4>
                <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                  <li>Payment was cancelled by user</li>
                  <li>Insufficient balance in Khalti wallet</li>
                  <li>Payment link expired (60 minutes)</li>
                  <li>Network connectivity issues</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => navigate('/events')}>
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

export default KhaltiFailure;

