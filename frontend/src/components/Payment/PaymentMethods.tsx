
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PaymentMethodsProps {
  totalAmount: number;
  onPaymentComplete?: () => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ totalAmount, onPaymentComplete }) => {
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

  return (
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
            ))}
          </div>
        </RadioGroup>
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

      {/* Payment Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
          onClick={onPaymentComplete}
        >
          Pay रु {totalAmount.toLocaleString()}
        </Button>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
