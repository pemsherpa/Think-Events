
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const PaymentMethods = () => {
  const [selectedMethod, setSelectedMethod] = useState('esewa');
  const [promoCode, setPromoCode] = useState('');

  const paymentMethods = [
    {
      id: 'esewa',
      name: 'eSewa',
      logo: '/api/placeholder/80/40',
      description: 'Pay with your eSewa wallet',
      color: 'border-green-500'
    },
    {
      id: 'khalti',
      name: 'Khalti',
      logo: '/api/placeholder/80/40',
      description: 'Pay with Khalti digital wallet',
      color: 'border-purple-500'
    },
    {
      id: 'ime',
      name: 'IME Pay',
      logo: '/api/placeholder/80/40',
      description: 'Pay with IME Pay',
      color: 'border-red-500'
    }
  ];

  const orderSummary = {
    tickets: [
      { type: 'VIP', quantity: 2, price: 2000, total: 4000 },
      { type: 'Standard', quantity: 1, price: 500, total: 500 }
    ],
    subtotal: 4500,
    serviceFee: 225,
    discount: 0,
    total: 4725
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Payment Methods */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
        
        <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <div key={method.id} className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedMethod === method.id ? method.color : 'border-gray-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{method.name}</div>
                        <div className="text-sm text-gray-600">{method.description}</div>
                      </div>
                      <div className="w-20 h-10 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">{method.name}</span>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* Promo Code */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Promo Code</h3>
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Button variant="outline">Apply</Button>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
        
        <div className="space-y-4">
          {orderSummary.tickets.map((ticket, index) => (
            <div key={index} className="flex justify-between items-center py-2">
              <div>
                <span className="font-medium">{ticket.type} Ticket</span>
                <span className="text-gray-600 ml-2">x{ticket.quantity}</span>
              </div>
              <span className="font-medium">रु {ticket.total.toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>रु {orderSummary.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Service Fee</span>
            <span>रु {orderSummary.serviceFee.toLocaleString()}</span>
          </div>
          {orderSummary.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>-रु {orderSummary.discount.toLocaleString()}</span>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>रु {orderSummary.total.toLocaleString()}</span>
          </div>
        </div>

        <Button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 h-12 text-lg">
          Pay रु {orderSummary.total.toLocaleString()}
        </Button>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
