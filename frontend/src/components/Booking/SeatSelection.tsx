
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiGet } from '@/lib/api';

interface Seat {
  id: number;
  row_label: string;
  seat_number: number;
  seat_type: 'VIP' | 'Premium' | 'Standard';
  price: number;
  is_available: boolean;
}

interface Props {
  eventId: string;
  onChange?: (selectedSeatIds: number[], totalPrice: number) => void;
}

const SeatSelection: React.FC<Props> = ({ eventId, onChange }) => {
  const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    apiGet<Seat[]>(`/events/${eventId}/seats/`).then(setSeats).catch(() => setSeats([]));
  }, [eventId]);

  const handleSeatClick = (sid: number) => {
    const seat = seats.find(s => s.id === sid);
    if (!seat || !seat.is_available) return;
    setSelectedSeatIds(prev => {
      const exists = prev.includes(sid);
      const next = exists ? prev.filter(id => id !== sid) : [...prev, sid];
      const total = next.reduce((sum, id) => {
        const s = seats.find(x => x.id === id);
        return sum + (s ? Number(s.price) : 0);
      }, 0);
      onChange?.(next, total);
      return next;
    });
  };

  const getSeatColor = (seat: Seat) => {
    if (!seat.is_available) return 'bg-gray-300 cursor-not-allowed';
    if (selectedSeatIds.includes(seat.id)) return 'bg-purple-600 text-white';
    switch (seat.seat_type) {
      case 'VIP': return 'bg-yellow-200 hover:bg-yellow-300 cursor-pointer';
      case 'Premium': return 'bg-blue-200 hover:bg-blue-300 cursor-pointer';
      default: return 'bg-green-200 hover:bg-green-300 cursor-pointer';
    }
  };

  const rows = Array.from(new Set(seats.map(s => s.row_label))).sort();

  const totalPrice = selectedSeatIds.reduce((sum, id) => {
    const s = seats.find(x => x.id === id);
    return sum + (s ? Number(s.price) : 0);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Seats</h2>
        <p className="text-gray-600">Click on available seats to select them</p>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-200 rounded"></div>
          <span className="text-sm">VIP</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-blue-200 rounded"></div>
          <span className="text-sm">Premium</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span className="text-sm">Standard</span>
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

      <div className="overflow-x-auto">
        <div className="min-w-max mx-auto">
          {rows.map(row => (
            <div key={row} className="flex items-center justify-center mb-2">
              <div className="w-8 text-center font-semibold text-gray-600 mr-4">{row}</div>
              <div className="flex space-x-1">
                {seats.filter(s => s.row_label === row).sort((a,b)=>a.seat_number-b.seat_number).map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat.id)}
                    className={`w-8 h-8 text-xs font-medium rounded transition-all ${getSeatColor(seat)}`}
                    disabled={!seat.is_available}
                    title={`${row}${seat.seat_number} - ${seat.seat_type} - रु ${seat.price}`}
                  >
                    {seat.seat_number}
                  </button>
                ))}
              </div>
              <div className="w-8 text-center font-semibold text-gray-600 ml-4">{row}</div>
            </div>
          ))}
        </div>
      </div>

      {selectedSeatIds.length > 0 && (
        <div className="mt-8 p-4 bg-purple-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Selected Seats</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSeatIds.map(id => {
              const s = seats.find(x => x.id === id)!;
              return <Badge key={id} variant="secondary" className="bg-purple-100 text-purple-800">{s.row_label}{s.seat_number} ({s.seat_type})</Badge>;
            })}
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-lg font-semibold text-gray-900">Total: रु {totalPrice.toLocaleString()}</span>
              <span className="text-gray-600 ml-2">({selectedSeatIds.length} seat{selectedSeatIds.length !== 1 ? 's' : ''})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
