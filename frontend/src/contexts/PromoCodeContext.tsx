import React, { createContext, useContext, useState, useEffect } from 'react';

interface PromoCodeContextType {
  activePromoCode: string | null;
  activeEventId: string | null;
  setActivePromoCode: (code: string | null, eventId?: string) => void;
  isPromoCodeActive: (code: string, eventId: string) => boolean;
  applyPromoCode: (code: string, eventId: string) => boolean;
  clearPromoCode: () => void;
  getDiscountAmount: (originalPrice: number, eventId: string) => number;
  getFinalPrice: (originalPrice: number, eventId: string) => number;
}

const PromoCodeContext = createContext<PromoCodeContextType | undefined>(undefined);

export const usePromoCode = () => {
  const context = useContext(PromoCodeContext);
  if (context === undefined) {
    throw new Error('usePromoCode must be used within a PromoCodeProvider');
  }
  return context;
};

interface PromoCodeProviderProps {
  children: React.ReactNode;
}

export const PromoCodeProvider: React.FC<PromoCodeProviderProps> = ({ children }) => {
  const [activePromoCode, setActivePromoCodeState] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  // Load promo code from localStorage on mount
  useEffect(() => {
    const savedPromoCode = localStorage.getItem('activePromoCode');
    const savedEventId = localStorage.getItem('activeEventId');
    if (savedPromoCode && savedEventId) {
      setActivePromoCodeState(savedPromoCode);
      setActiveEventId(savedEventId);
    }
  }, []);

  // Save promo code to localStorage when it changes
  useEffect(() => {
    if (activePromoCode && activeEventId) {
      localStorage.setItem('activePromoCode', activePromoCode);
      localStorage.setItem('activeEventId', activeEventId);
    } else {
      localStorage.removeItem('activePromoCode');
      localStorage.removeItem('activeEventId');
    }
  }, [activePromoCode, activeEventId]);

  const setActivePromoCode = (code: string | null, eventId?: string) => {
    setActivePromoCodeState(code);
    if (eventId) {
      setActiveEventId(eventId);
    }
  };

  const isPromoCodeActive = (code: string, eventId: string) => {
    return activePromoCode === code.toUpperCase() && activeEventId === eventId;
  };

  const applyPromoCode = (code: string, eventId: string) => {
    const upperCode = code.toUpperCase();
    
    // Check if it's a valid promo code
    if (upperCode === 'KNP25') {
      setActivePromoCodeState(upperCode);
      setActiveEventId(eventId);
      return true;
    }
    
    return false;
  };

  const clearPromoCode = () => {
    setActivePromoCodeState(null);
    setActiveEventId(null);
  };

  const getDiscountAmount = (originalPrice: number, eventId: string) => {
    if (activePromoCode === 'KNP25' && activeEventId === eventId) {
      return originalPrice; // 100% discount (free)
    }
    return 0;
  };

  const getFinalPrice = (originalPrice: number, eventId: string) => {
    if (activePromoCode === 'KNP25' && activeEventId === eventId) {
      return 0; // Free
    }
    return originalPrice;
  };

  const value: PromoCodeContextType = {
    activePromoCode,
    activeEventId,
    setActivePromoCode,
    isPromoCodeActive,
    applyPromoCode,
    clearPromoCode,
    getDiscountAmount,
    getFinalPrice,
  };

  return (
    <PromoCodeContext.Provider value={value}>
      {children}
    </PromoCodeContext.Provider>
  );
};
