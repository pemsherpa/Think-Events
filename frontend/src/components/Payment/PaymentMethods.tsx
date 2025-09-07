
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePromoCode } from '@/contexts/PromoCodeContext';
import { toast } from '@/hooks/use-toast';
import { Check, X } from 'lucide-react';

interface PaymentMethodsProps {
  totalAmount: number;
  eventId: string;
  onPaymentComplete?: () => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ totalAmount, eventId, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState('esewa');
  const [promoCode, setPromoCode] = useState('');
  const { activePromoCode, activeEventId, applyPromoCode, clearPromoCode, getFinalPrice } = usePromoCode();

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

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      toast({
        title: "Enter a promo code",
        description: "Please enter a valid promo code.",
        variant: "destructive",
      });
      return;
    }

    if (applyPromoCode(promoCode, eventId)) {
      toast({
        title: "Promo code applied!",
        description: "Your promo code has been successfully applied to this event.",
      });
      setPromoCode('');
    } else {
      toast({
        title: "Invalid promo code",
        description: "The promo code you entered is not valid.",
        variant: "destructive",
      });
    }
  };

  const handleClearPromoCode = () => {
    clearPromoCode();
    toast({
      title: "Promo code removed",
      description: "Your promo code has been removed.",
    });
  };

  const finalAmount = getFinalPrice(totalAmount, eventId);
  const isPromoActive = activePromoCode && activeEventId === eventId;

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
            </div>
          ))}
        </div>
      </RadioGroup>

      {/* Promo Code */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Promo Code</h3>
        {isPromoActive ? (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Promo code: {activePromoCode}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearPromoCode}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <Input 
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyPromoCode()}
            />
            <Button variant="outline" onClick={handleApplyPromoCode}>
              Apply
            </Button>
          </div>
        )}
      </div>

      {/* Payment Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        {isPromoActive && activePromoCode === 'KNP25' ? (
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-green-600 mb-1">FREE</div>
            <div className="text-sm text-gray-500 line-through">रु {totalAmount.toLocaleString()}</div>
            <div className="text-xs text-green-600">with KNP25 promo</div>
          </div>
        ) : (
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-gray-900">रु {finalAmount.toLocaleString()}</div>
          </div>
        )}
        
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700 h-12 text-lg"
          onClick={onPaymentComplete}
        >
          {isPromoActive && activePromoCode === 'KNP25' ? 'Complete Booking (FREE)' : `Pay रु ${finalAmount.toLocaleString()}`}
        </Button>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
