
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { usePromoCode } from '@/contexts/PromoCodeContext';
import { toast } from '@/hooks/use-toast';
import { Check, X, Loader2 } from 'lucide-react';

interface PaymentMethodsProps {
  totalAmount: number;
  eventId: string;
  selectedSeats: any[];
  onPaymentComplete?: () => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({ totalAmount, eventId, selectedSeats, onPaymentComplete }) => {
  const [selectedMethod, setSelectedMethod] = useState('esewa');
  const [promoCode, setPromoCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { activePromoCode, activeEventId, applyPromoCode, clearPromoCode, getFinalPrice } = usePromoCode();

  const paymentMethods = [
    {
      id: 'esewa',
      name: 'eSewa',
      logo: '/api/placeholder/80/40',
      description: 'Pay with your eSewa wallet',
      color: 'border-green-500',
      enabled: true
    },
    {
      id: 'khalti',
      name: 'Khalti',
      logo: '/api/placeholder/80/40',
      description: 'Pay with Khalti digital wallet',
      color: 'border-purple-500',
      enabled: true
    },
    {
      id: 'ime',
      name: 'IME Pay',
      logo: '/api/placeholder/80/40',
      description: 'Pay with IME Pay (Coming Soon)',
      color: 'border-red-500',
      enabled: false
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

  const handlePaymentSubmit = async () => {
    if (isProcessing) return;

    // Check if payment method is enabled
    const selectedPaymentMethod = paymentMethods.find(m => m.id === selectedMethod);
    if (!selectedPaymentMethod?.enabled) {
      toast({
        title: "Payment method not available",
        description: "This payment method is coming soon. Please use eSewa.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('auth_token');

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue with payment.",
          variant: "destructive",
        });
        return;
      }

      const paymentData = {
        event_id: parseInt(eventId),
        seat_numbers: selectedSeats.map((seat: any) => seat.id || seat.seatNumber),
        quantity: selectedSeats.length,
        amount: finalAmount,
        customer_info: {},
      };

      const endpoint = selectedMethod === 'khalti' 
        ? '/api/payment/khalti/initiate' 
        : '/api/payment/esewa/initiate';

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Failed to initiate payment');
      }

      if (selectedMethod === 'khalti') {
        window.location.href = result.data.payment_url;
      } else {
        const { payment_url, payment_params } = result.data;
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = payment_url;

        Object.keys(payment_params).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = payment_params[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
      
      <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
        <div className="space-y-4">
          {paymentMethods.map(method => (
            <div 
              key={method.id} 
              className={`border-2 rounded-lg p-4 transition-all ${
                selectedMethod === method.id ? method.color : 'border-gray-200'
              } ${!method.enabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center space-x-3">
                <RadioGroupItem 
                  value={method.id} 
                  id={method.id} 
                  disabled={!method.enabled}
                />
                <Label htmlFor={method.id} className={`flex-1 ${method.enabled ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
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
          onClick={handlePaymentSubmit}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            isPromoActive && activePromoCode === 'KNP25' ? 'Complete Booking (FREE)' : `Pay रु ${finalAmount.toLocaleString()}`
          )}
        </Button>
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethods;
