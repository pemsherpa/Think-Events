import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { APP_CONFIG, formatCurrency, calculateServiceFee, calculateTax, calculateTotal } from '@/config/appConfig';

interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'VIP' | 'Premium' | 'Standard' | 'GA' | 'FanPit';
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
  section?: string;
}

interface OrderSummaryProps {
  selectedSeats: Seat[];
  totalPrice: number;
  eventTitle?: string;
  eventDate?: string;
  eventTime?: string;
  eventVenue?: string;
  promoCode?: string | null;
  discountAmount?: number;
  finalPrice?: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  selectedSeats,
  totalPrice,
  eventTitle,
  eventDate,
  eventTime,
  eventVenue,
  promoCode,
  discountAmount = 0,
  finalPrice
}) => {
  const getSeatTypeColor = (type: string) => {
    switch (type) {
      case 'VIP': return 'bg-yellow-100 text-yellow-800';
      case 'Premium': return 'bg-blue-100 text-blue-800';
      case 'FanPit': return 'bg-orange-100 text-orange-800';
      case 'GA': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeatTypeIcon = (type: string) => {
    switch (type) {
      case 'VIP': return '👑';
      case 'Premium': return '⭐';
      case 'FanPit': return '🎪';
      case 'GA': return '🎫';
      default: return '💺';
    }
  };

  if (selectedSeats.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Seats Selected</h3>
        <p className="text-gray-600">Select seats to see your order summary</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
      
      {/* Event Details */}
      {eventTitle && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">{eventTitle}</h3>
          <div className="space-y-1 text-sm text-gray-600">
            {eventDate && <p>📅 {eventDate}</p>}
            {eventTime && <p>🕒 {eventTime}</p>}
            {eventVenue && <p>📍 {eventVenue}</p>}
          </div>
        </div>
      )}

      <Separator className="my-4" />

      {/* Selected Seats */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-3">Selected Seats</h3>
        <div className="space-y-2">
          {selectedSeats.map((seat) => (
            <div key={seat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{getSeatTypeIcon(seat.type)}</span>
                <div>
                  <p className="font-medium text-gray-900">{seat.id}</p>
                  <Badge className={`text-xs ${getSeatTypeColor(seat.type)}`}>
                    {seat.type}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">रु {seat.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* Price Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Seats ({selectedSeats.length})</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Service Fee</span>
          <span>{formatCurrency(calculateServiceFee(totalPrice))}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>{formatCurrency(calculateTax(totalPrice + calculateServiceFee(totalPrice)))}</span>
        </div>
        {promoCode && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Promo Code ({promoCode})</span>
            <span>-{formatCurrency(discountAmount)}</span>
          </div>
        )}
      </div>

      <Separator className="my-4" />

      {/* Total */}
      <div className="flex justify-between items-center text-lg font-bold">
        <span>Total Amount</span>
        <div className="text-right">
          {promoCode && finalPrice === 0 ? (
            <div>
              <div className="text-green-600 text-xl">FREE</div>
              <div className="text-sm text-gray-500 line-through">{formatCurrency(calculateTotal(totalPrice))}</div>
            </div>
          ) : (
            <span className="text-purple-600">{formatCurrency(finalPrice || calculateTotal(totalPrice))}</span>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 Your booking will be confirmed once payment is completed
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
