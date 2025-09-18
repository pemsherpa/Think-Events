import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { seatLayoutAPI } from '@/services/api';
import { Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import { APP_CONFIG, getSeatCategoryConfig, formatCurrency } from '@/config/appConfig';

interface SeatCategory {
  id: number;
  name: string;
  color: string;
  description: string;
}

interface Seat {
  id: number;
  rowNumber: number;
  columnNumber: number;
  seatNumber: string;
  categoryId: number;
  price: number;
  maxCapacity: number;
  currentBookings: number;
  seatType: 'standard' | 'aisle' | 'disabled';
  isAvailable: boolean;
  categoryName: string;
  categoryColor: string;
}

interface SeatLayout {
  id: number;
  venueType: 'theater' | 'open_ground' | 'simple_counter';
  bookingType: 'one_time' | 'multiple';
  maxBookingsPerSeat: number;
}

interface SelectedSeat {
  seatId: number;
  seatNumber: string;
  categoryName: string;
  price: number;
  quantity: number;
  maxQuantity: number;
}

interface DynamicSeatGridProps {
  eventId: number;
  onSeatsSelected: (seats: SelectedSeat[]) => void;
  onTotalPriceChange: (price: number) => void;
}

const DynamicSeatGrid: React.FC<DynamicSeatGridProps> = ({
  eventId,
  onSeatsSelected,
  onTotalPriceChange
}) => {
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Map<number, SelectedSeat>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple counter state
  const [simpleCounterQuantity, setSimpleCounterQuantity] = useState(0);
  const [simpleCounterPrice, setSimpleCounterPrice] = useState(0);

  useEffect(() => {
    fetchSeatLayout();
  }, [eventId]);

  useEffect(() => {
    updateParent();
  }, [selectedSeats, simpleCounterQuantity, simpleCounterPrice]);

  const fetchSeatLayout = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching seat layout for event:', eventId);
      const response = await seatLayoutAPI.getAvailableSeats(eventId);
      
      console.log('Seat layout response:', response);
      
      if (response.success && response.data.layout) {
        // Map layout data to ensure proper property names
        const layoutData = {
          id: response.data.layout.id,
          venueType: response.data.layout.venue_type,
          bookingType: response.data.layout.booking_type,
          maxBookingsPerSeat: response.data.layout.max_bookings_per_seat
        };
        setLayout(layoutData);
        
        // Map seat data from snake_case to camelCase
        const mappedSeats = (response.data.seats || []).map((seat: any) => ({
          id: seat.id,
          rowNumber: seat.row_number,
          columnNumber: seat.column_number,
          seatNumber: seat.seat_number,
          categoryId: seat.category_id,
          price: parseFloat(seat.price) || 0,
          maxCapacity: seat.max_capacity,
          currentBookings: seat.current_bookings,
          seatType: seat.seat_type,
          isAvailable: seat.is_available,
          categoryName: seat.category_name,
          categoryColor: seat.category_color
        }));
        
        setSeats(mappedSeats);
        setCategories(response.data.categories || []);
        console.log('Layout loaded:', response.data.layout);
        console.log('Seats loaded:', mappedSeats.length);
        console.log('Mapped seats:', mappedSeats);
      } else {
        console.log('No layout found for event:', eventId);
        setLayout(null);
        setSeats([]);
        setCategories([]);
      }
    } catch (error: any) {
      console.error('Error fetching seat layout:', error);
      setError(error.message || 'Failed to load seat layout');
    } finally {
      setLoading(false);
    }
  };

  const updateParent = () => {
    if (layout?.venueType === 'simple_counter') {
      const totalPrice = simpleCounterQuantity * simpleCounterPrice;
      onSeatsSelected([{
        seatId: 0,
        seatNumber: 'SIMPLE',
        categoryName: 'General',
        price: simpleCounterPrice,
        quantity: simpleCounterQuantity,
        maxQuantity: 1000 // No limit for simple counter
      }]);
      onTotalPriceChange(totalPrice);
    } else {
      const selectedSeatsArray = Array.from(selectedSeats.values());
      const totalPrice = selectedSeatsArray.reduce((sum, seat) => sum + (seat.price * seat.quantity), 0);
      onSeatsSelected(selectedSeatsArray);
      onTotalPriceChange(totalPrice);
    }
  };

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isAvailable || seat.seatType === 'disabled') {
      return;
    }

    const currentSelection = selectedSeats.get(seat.id);
    const maxQuantity = layout?.bookingType === 'multiple' 
      ? seat.maxCapacity - seat.currentBookings 
      : 1;

    if (currentSelection) {
      // Remove seat from selection
      const newSelectedSeats = new Map(selectedSeats);
      newSelectedSeats.delete(seat.id);
      setSelectedSeats(newSelectedSeats);
    } else {
      // Add seat to selection
      const newSelection: SelectedSeat = {
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        categoryName: seat.categoryName,
        price: seat.price,
        quantity: 1,
        maxQuantity
      };
      setSelectedSeats(new Map(selectedSeats).set(seat.id, newSelection));
    }
  };

  const updateSeatQuantity = (seatId: number, newQuantity: number) => {
    const currentSelection = selectedSeats.get(seatId);
    if (currentSelection && newQuantity > 0 && newQuantity <= currentSelection.maxQuantity) {
      const updatedSelection = { ...currentSelection, quantity: newQuantity };
      setSelectedSeats(new Map(selectedSeats).set(seatId, updatedSelection));
    }
  };

  const getSeatStatus = (seat: Seat) => {
    if (seat.seatType === 'disabled') return 'disabled';
    if (!seat.isAvailable) return 'unavailable';
    if (selectedSeats.has(seat.id)) return 'selected';
    return 'available';
  };

  const getSeatColor = (seat: Seat) => {
    const status = getSeatStatus(seat);
    
    if (status === 'disabled') return 'bg-gray-300 cursor-not-allowed';
    if (status === 'unavailable') return 'bg-red-300 cursor-not-allowed';
    if (status === 'selected') return 'bg-purple-600 text-white hover:bg-purple-700';
    
    // Available seat with category color
    return `hover:opacity-80 cursor-pointer transition-all hover:scale-105`;
  };

  const renderSeatGrid = () => {
    if (!layout || layout.venueType === 'simple_counter') {
      return null;
    }

    const maxRow = Math.max(...seats.map(s => s.rowNumber));
    const maxCol = Math.max(...seats.map(s => s.columnNumber));

    const grid = [];
    for (let row = 1; row <= maxRow; row++) {
      const rowSeats = [];
      for (let col = 1; col <= maxCol; col++) {
        const seat = seats.find(s => s.rowNumber === row && s.columnNumber === col);
        
        if (seat) {
          const status = getSeatStatus(seat);
          const isSelected = selectedSeats.has(seat.id);
          
          rowSeats.push(
            <div
              key={`${row}-${col}`}
              className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${getSeatColor(seat)}`}
              style={{
                backgroundColor: status === 'available' ? seat.categoryColor : undefined,
                borderColor: isSelected ? '#7C3AED' : '#E5E7EB'
              }}
              onClick={() => handleSeatClick(seat)}
              title={`${seat.seatNumber} - ${seat.categoryName} - ${seat.price ? formatCurrency(seat.price) : 'Free'}${layout.bookingType === 'multiple' ? ` (${seat.currentBookings}/${seat.maxCapacity})` : ''}`}
            >
              {seat.seatNumber}
            </div>
          );
        } else {
          // Empty space
          rowSeats.push(
            <div key={`${row}-${col}`} className="w-10 h-10" />
          );
        }
      }
      grid.push(
        <div key={row} className="flex gap-1 mb-1">
          {rowSeats}
        </div>
      );
    }

    return (
      <div className="border rounded-lg p-6 bg-gray-50">
        <div className="mb-4">
          <h4 className="font-medium mb-2">Select Your Seats</h4>
          <div className="text-sm text-gray-600 mb-4">
            Click on seats to select them. {layout.bookingType === 'multiple' && 'Some seats allow multiple bookings.'}
          </div>
        </div>
        
        <div className="flex justify-center mb-6">
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            {grid}
          </div>
        </div>

        {/* Category Legend */}
        <div className="space-y-2">
          <h5 className="font-medium text-sm">Seat Categories</h5>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Badge key={category.id} variant="secondary" className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </Badge>
            ))}
          </div>
        </div>

        {/* Status Legend */}
        <div className="mt-4 space-y-2">
          <h5 className="font-medium text-sm">Status</h5>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-gray-300 bg-gray-300" />
              <span>Disabled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-red-300 bg-red-300" />
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-purple-600 bg-purple-600" />
              <span>Selected</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSimpleCounter = () => {
    return (
      <div className="border rounded-lg p-6 bg-gray-50">
        <div className="text-center">
          <h4 className="font-medium mb-4">Select Number of Tickets</h4>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimpleCounterQuantity(Math.max(0, simpleCounterQuantity - 1))}
              disabled={simpleCounterQuantity <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <div className="text-2xl font-bold min-w-[3rem] text-center">
              {simpleCounterQuantity}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSimpleCounterQuantity(simpleCounterQuantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Price per ticket: {formatCurrency(simpleCounterPrice)}
          </div>
        </div>
      </div>
    );
  };

  const renderSelectedSeats = () => {
    if (selectedSeats.size === 0) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Selected Seats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from(selectedSeats.values()).map(seat => (
              <div key={seat.seatId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{seat.seatNumber}</div>
                  <div className="text-sm text-gray-600">{seat.categoryName}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  {layout?.bookingType === 'multiple' && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSeatQuantity(seat.seatId, seat.quantity - 1)}
                        disabled={seat.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-[2rem] text-center">{seat.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateSeatQuantity(seat.seatId, seat.quantity + 1)}
                        disabled={seat.quantity >= seat.maxQuantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(seat.price * seat.quantity)}</div>
                    <div className="text-sm text-gray-600">{formatCurrency(seat.price)} each</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-2 text-gray-600">Loading seat layout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-2">Error loading seat layout</p>
        <p className="text-gray-600 text-sm">{error}</p>
        <Button variant="outline" onClick={fetchSeatLayout} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-2">No seat layout configured</p>
        <p className="text-gray-500 text-sm">This event doesn't have a custom seat layout.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {layout.venueType === 'simple_counter' ? renderSimpleCounter() : renderSeatGrid()}
      {renderSelectedSeats()}
    </div>
  );
};

export default DynamicSeatGrid;
