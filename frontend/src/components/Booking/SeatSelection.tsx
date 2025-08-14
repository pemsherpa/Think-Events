
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'VIP' | 'Premium' | 'Standard';
  price: number;
  isAvailable: boolean;
  isSelected: boolean;
}

const SeatSelection = () => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // Mock seat data
  const generateSeats = (): Seat[] => {
    const seats: Seat[] = [];
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const seatsPerRow = 10;

    rows.forEach((row, rowIndex) => {
      for (let i = 1; i <= seatsPerRow; i++) {
        let type: 'VIP' | 'Premium' | 'Standard' = 'Standard';
        let price = 500;

        if (rowIndex < 2) {
          type = 'VIP';
          price = 2000;
        } else if (rowIndex < 4) {
          type = 'Premium';
          price = 1200;
        }

        seats.push({
          id: `${row}${i}`,
          row,
          number: i,
          type,
          price,
          isAvailable: Math.random() > 0.3, // 70% available
          isSelected: false,
        });
      }
    });

    return seats;
  };

  const [seats] = useState<Seat[]>(generateSeats());

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || !seat.isAvailable) return;

    setSelectedSeats(prev => {
      const isAlreadySelected = prev.some(s => s.id === seatId);
      if (isAlreadySelected) {
        return prev.filter(s => s.id !== seatId);
      } else {
        return [...prev, seat];
      }
    });
  };

  const getSeatColor = (seat: Seat) => {
    if (!seat.isAvailable) return 'bg-gray-300 cursor-not-allowed';
    if (selectedSeats.some(s => s.id === seat.id)) return 'bg-purple-600 text-white';
    
    switch (seat.type) {
      case 'VIP': return 'bg-yellow-200 hover:bg-yellow-300 cursor-pointer';
      case 'Premium': return 'bg-blue-200 hover:bg-blue-300 cursor-pointer';
      default: return 'bg-green-200 hover:bg-green-300 cursor-pointer';
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Seats</h2>
        <p className="text-gray-600">Click on available seats to select them</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span className="text-sm">VIP (रु 2,000)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-200 rounded"></div>
          <span className="text-sm">Premium (रु 1,200)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span className="text-sm">Standard (रु 500)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-purple-600 rounded"></div>
          <span className="text-sm">Selected</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-sm">Unavailable</span>
        </div>
      </div>

      {/* Stage */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-lg inline-block">
          🎭 STAGE
        </div>
      </div>

      {/* Seat Map */}
      <div className="overflow-x-auto">
        <div className="min-w-max mx-auto">
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(row => (
            <div key={row} className="flex items-center justify-center mb-2">
              <div className="w-8 text-center font-semibold text-gray-600 mr-4">
                {row}
              </div>
              <div className="flex space-x-1">
                {seats
                  .filter(seat => seat.row === row)
                  .map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat.id)}
                      className={`w-8 h-8 text-xs font-medium rounded transition-all ${getSeatColor(seat)}`}
                      disabled={!seat.isAvailable}
                      title={`${seat.id} - ${seat.type} - रु ${seat.price}`}
                    >
                      {seat.number}
                    </button>
                  ))}
              </div>
              <div className="w-8 text-center font-semibold text-gray-600 ml-4">
                {row}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className="mt-8 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Selected Seats</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSeats.map(seat => (
              <Badge key={seat.id} variant="secondary" className="bg-purple-100 text-purple-800">
                {seat.id} ({seat.type})
              </Badge>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold text-gray-900">
                Total: रु {totalPrice.toLocaleString()}
              </span>
              <span className="text-gray-600 ml-2">
                ({selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''})
              </span>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              Proceed to Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
