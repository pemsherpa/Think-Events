import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePromoCode } from '@/contexts/PromoCodeContext';
import { toast } from '@/hooks/use-toast';
import { X, Check } from 'lucide-react';

const PromoCodeInput: React.FC = () => {
  const [code, setCode] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { activePromoCode, applyPromoCode, clearPromoCode } = usePromoCode();

  const handleApply = () => {
    if (!code.trim()) {
      toast({
        title: "Enter a promo code",
        description: "Please enter a valid promo code.",
        variant: "destructive",
      });
      return;
    }

    if (applyPromoCode(code)) {
      toast({
        title: "Promo code applied!",
        description: "Your promo code has been successfully applied.",
      });
      setCode('');
      setIsExpanded(false);
    } else {
      toast({
        title: "Invalid promo code",
        description: "The promo code you entered is not valid.",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    clearPromoCode();
    toast({
      title: "Promo code removed",
      description: "Your promo code has been removed.",
    });
  };

  if (activePromoCode) {
    return (
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
          onClick={handleClear}
          className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {!isExpanded ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="text-purple-600 border-purple-600 hover:bg-purple-50"
        >
          Have a promo code?
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter promo code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-32 h-8 text-sm"
            onKeyPress={(e) => e.key === 'Enter' && handleApply()}
          />
          <Button
            size="sm"
            onClick={handleApply}
            className="h-8 px-3 bg-purple-600 hover:bg-purple-700"
          >
            Apply
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsExpanded(false);
              setCode('');
            }}
            className="h-8 w-8 p-0"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
