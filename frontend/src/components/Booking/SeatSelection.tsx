
import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { bookingsAPI } from '@/services/api';

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

interface SeatSelectionProps {
  onSeatsSelected: (seats: Seat[]) => void;
  onTotalPriceChange: (price: number) => void;
  eventId?: number | string;
}

const SeatSelection: React.FC<SeatSelectionProps> = ({ onSeatsSelected, onTotalPriceChange, eventId }) => {
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [venueType, setVenueType] = useState<'theater' | 'stadium' | 'movie' | 'openground'>('theater');
  const [bookedSeatIds, setBookedSeatIds] = useState<string[]>([]);
  const [openGroundQty, setOpenGroundQty] = useState<number>(0);

  // Generate seats based on venue type
  const generateSeats = (type: string): Seat[] => {
    const seats: Seat[] = [];

    switch (type) {
      case 'theater':
        // Theater layout - traditional rows
        const theaterRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        theaterRows.forEach((row, rowIndex) => {
          const seatsPerRow = 12;
          for (let i = 1; i <= seatsPerRow; i++) {
            let type: 'VIP' | 'Premium' | 'Standard' = 'Standard';
            let price = 800;

            if (rowIndex < 2) {
              type = 'VIP';
              price = 2500;
            } else if (rowIndex < 4) {
              type = 'Premium';
              price = 1500;
            }

            seats.push({
              id: `${row}${i}`,
              row,
              number: i,
              type,
              price,
              isAvailable: true, // All seats are available
              isSelected: false,
            });
          }
        });
        break;

      case 'stadium':
        // Football stadium layout - multiple seats per section
        const stadiumSections = ['North Stand', 'South Stand', 'East Stand', 'West Stand'];
        stadiumSections.forEach((section, sectionIndex) => {
          let type: 'VIP' | 'Premium' | 'Standard' = 'Standard';
          let basePrice = 600;

          if (sectionIndex === 0 || sectionIndex === 1) { // North and South are VIP
            type = 'VIP';
            basePrice = 1800;
          } else { // East and West are Premium
            type = 'Premium';
            basePrice = 1200;
          }

          // Create multiple seats per section
          for (let seatNum = 1; seatNum <= 5; seatNum++) {
            seats.push({
              id: `${section}-${seatNum}`,
              row: section,
              number: seatNum,
              type,
              price: basePrice,
              isAvailable: true, // All seats are available
              isSelected: false,
              section,
            });
          }
        });
        break;

      case 'movie':
        // Movie hall layout - stadium seating
        const movieRows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
        movieRows.forEach((row, rowIndex) => {
          const seatsPerRow = 16;
          for (let i = 1; i <= seatsPerRow; i++) {
            let type: 'VIP' | 'Premium' | 'Standard' = 'Standard';
            let price = 400;

            if (rowIndex < 3) {
              type = 'VIP';
              price = 1200;
            } else if (rowIndex < 6) {
              type = 'Premium';
              price = 800;
            }

            seats.push({
              id: `${row}${i}`,
              row,
              number: i,
              type,
              price,
              isAvailable: true, // All seats are available
              isSelected: false,
            });
          }
        });
        break;

      case 'openground':
        // Open ground layout - multiple seats per section
        const groundSections = ['VIP Section', 'General Admission', 'Fan Pit'];
        groundSections.forEach((section, sectionIndex) => {
          let basePrice = 300;
          let type: 'VIP' | 'GA' | 'FanPit' = 'GA';

          if (sectionIndex === 0) { // VIP Section
            type = 'VIP';
            basePrice = 2000;
          } else if (sectionIndex === 2) { // Fan Pit
            type = 'FanPit';
            basePrice = 800;
          }

          // Create multiple seats per section
          const seatsPerSection = sectionIndex === 0 ? 3 : sectionIndex === 1 ? 8 : 5;
          for (let seatNum = 1; seatNum <= seatsPerSection; seatNum++) {
            seats.push({
              id: `${section}-${seatNum}`,
              row: section,
              number: seatNum,
              type,
              price: basePrice,
              isAvailable: true, // All seats are available
              isSelected: false,
              section,
            });
          }
        });
        break;
    }

    return seats;
  };

  const [baseSeats, setBaseSeats] = useState<Seat[]>(generateSeats(venueType));

  // Update seats when venue type changes
  useEffect(() => {
    setBaseSeats(generateSeats(venueType));
  }, [venueType]);

  // fetch booked seats for the event
  useEffect(() => {
    const loadBooked = async () => {
      if (!eventId) return;
      try {
        const res = await bookingsAPI.getAvailableSeats(eventId);
        const booked = res.data?.booked_seat_numbers || res.data?.bookedSeats || [];
        setBookedSeatIds(booked);
      } catch (e) {
        console.error('Failed to load booked seats', e);
      }
    };
    loadBooked();
  }, [eventId]);

  const seats = useMemo(() => {
    return baseSeats.map((s) => ({
      ...s,
      isAvailable: !bookedSeatIds.includes(s.id),
    }));
  }, [baseSeats, bookedSeatIds]);

  const handleSeatClick = (seatId: string) => {
    const seat = seats.find(s => s.id === seatId);
    if (!seat || !seat.isAvailable) return;

    setSelectedSeats(prev => {
      const isAlreadySelected = prev.some(s => s.id === seatId);
      if (isAlreadySelected) {
        const newSelection = prev.filter(s => s.id !== seatId);
        onSeatsSelected(newSelection);
        onTotalPriceChange(newSelection.reduce((sum, s) => sum + s.price, 0));
        return newSelection;
      } else {
        const newSelection = [...prev, seat];
        onSeatsSelected(newSelection);
        onTotalPriceChange(newSelection.reduce((sum, s) => sum + s.price, 0));
        return newSelection;
      }
    });
  };

  const getSeatColor = (seat: Seat) => {
    if (!seat.isAvailable) return 'bg-gray-300 cursor-not-allowed';
    if (selectedSeats.some(s => s.id === seat.id)) return 'bg-purple-600 text-white';
    
    switch (seat.type) {
      case 'VIP': return 'bg-yellow-200 hover:bg-yellow-300 cursor-pointer';
      case 'Premium': return 'bg-blue-200 hover:bg-blue-300 cursor-pointer';
      case 'FanPit': return 'bg-orange-200 hover:bg-orange-300 cursor-pointer';
      case 'GA': return 'bg-green-200 hover:bg-green-300 cursor-pointer';
      default: return 'bg-green-200 hover:bg-green-300 cursor-pointer';
    }
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);

  const renderTheaterLayout = () => (
    <div className="overflow-x-auto">
      <div className="min-w-max mx-auto">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map(row => (
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
  );

  const renderStadiumLayout = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-4 px-8 rounded-lg inline-block text-lg font-semibold">
          ⚽ FOOTBALL FIELD
        </div>
      </div>
      
      <div className="space-y-8">
        {['North Stand', 'South Stand', 'East Stand', 'West Stand'].map(section => (
          <div key={section} className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{section}</h3>
            <div className="grid grid-cols-5 gap-3">
              {seats
                .filter(seat => seat.section === section)
                .map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${getSeatColor(seat)} ${
                      !seat.isAvailable ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                    }`}
                    disabled={!seat.isAvailable}
                    title={`${seat.id} - ${seat.type} - रु ${seat.price}`}
                  >
                    <div className="text-center">
                      <p className="font-bold text-sm">{seat.number}</p>
                      <p className="text-xs mb-1">{seat.type}</p>
                      <p className="text-xs font-semibold">रु {seat.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderMovieLayout = () => (
    <div className="overflow-x-auto">
      <div className="min-w-max mx-auto">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].map(row => (
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
                    className={`w-7 h-7 text-xs font-medium rounded transition-all ${getSeatColor(seat)}`}
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
  );

  const renderOpenGroundLayout = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-8 rounded-lg inline-block text-lg font-semibold">
          🎪 OPEN GROUND STAGE
        </div>
      </div>
      
      <div className="space-y-8">
        {['VIP Section', 'General Admission', 'Fan Pit'].map(section => (
          <div key={section} className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{section}</h3>
            <div className="grid grid-cols-4 gap-3">
              {seats
                .filter(seat => seat.section === section)
                .map(seat => (
                  <button
                    key={seat.id}
                    onClick={() => handleSeatClick(seat.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${getSeatColor(seat)} ${
                      !seat.isAvailable ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                    }`}
                    disabled={!seat.isAvailable}
                    title={`${seat.id} - ${seat.type} - रु ${seat.price}`}
                  >
                    <div className="text-center">
                      <p className="font-bold text-sm">{seat.number}</p>
                      <p className="text-xs mb-1">{seat.type}</p>
                      <p className="text-xs font-semibold">रु {seat.price.toLocaleString()}</p>
                    </div>
                  </button>
                ))}
            </div>
            {/* Quantity selector for open ground (not seat-wise) */}
            {section !== 'VIP Section' && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <span className="text-sm text-gray-700">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setOpenGroundQty(q => Math.max(0, q - 1))}>-</Button>
                  <span className="w-8 text-center">{openGroundQty}</span>
                  <Button onClick={() => setOpenGroundQty(q => q + 1)}>+</Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderLayout = () => {
    switch (venueType) {
      case 'theater':
        return renderTheaterLayout();
      case 'stadium':
        return renderStadiumLayout();
      case 'movie':
        return renderMovieLayout();
      case 'openground':
        return renderOpenGroundLayout();
      default:
        return renderTheaterLayout();
    }
  };

  const getLegendItems = () => {
    const baseItems = [
      { color: 'bg-purple-600', label: 'Selected' },
      { color: 'bg-gray-300', label: 'Unavailable' }
    ];

    switch (venueType) {
      case 'theater':
        return [
          { color: 'bg-yellow-200', label: 'VIP (रु 2,500)' },
          { color: 'bg-blue-200', label: 'Premium (रु 1,500)' },
          { color: 'bg-green-200', label: 'Standard (रु 800)' },
          ...baseItems
        ];
      case 'stadium':
        return [
          { color: 'bg-yellow-200', label: 'VIP Stands (रु 1,800)' },
          { color: 'bg-blue-200', label: 'Premium Stands (रु 1,200)' },
          ...baseItems
        ];
      case 'movie':
        return [
          { color: 'bg-yellow-200', label: 'VIP (रु 1,200)' },
          { color: 'bg-blue-200', label: 'Premium (रु 800)' },
          { color: 'bg-green-200', label: 'Standard (रु 400)' },
          ...baseItems
        ];
      case 'openground':
        return [
          { color: 'bg-yellow-200', label: 'VIP Section (रु 2,000)' },
          { color: 'bg-orange-200', label: 'Fan Pit (रु 800)' },
          { color: 'bg-green-200', label: 'General Admission (रु 300)' },
          ...baseItems
        ];
      default:
        return baseItems;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Seats</h2>
        <p className="text-gray-600">Click on available seats to select them</p>
      </div>

      {/* Venue Type Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type</label>
        <Select value={venueType} onValueChange={(value: any) => setVenueType(value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select venue type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="theater">Theater</SelectItem>
            <SelectItem value="stadium">Football Stadium</SelectItem>
            <SelectItem value="movie">Movie Hall</SelectItem>
            <SelectItem value="openground">Open Ground</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        {getLegendItems().map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className={`w-4 h-4 ${item.color} rounded`}></div>
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Stage/Field */}
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-8 rounded-lg inline-block">
          {venueType === 'stadium' ? '⚽ FIELD' : 
           venueType === 'movie' ? '🎬 SCREEN' : 
           venueType === 'openground' ? '🎪 STAGE' : '🎭 STAGE'}
        </div>
      </div>

      {/* Seat Map */}
      {renderLayout()}

      {/* Open ground quantity summary */}
      {venueType === 'openground' && openGroundQty > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <span className="text-gray-800">Tickets (General/Fan Pit): </span>
          <Badge className="ml-2 bg-purple-100 text-purple-800">{openGroundQty}</Badge>
        </div>
      )}

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
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
