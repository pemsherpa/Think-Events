import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { seatLayoutAPI } from '@/services/api';
import { Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/config/appConfig';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  seatType: 'standard' | 'aisle' | 'disabled' | 'dance_floor';
  isAvailable: boolean;
  categoryName: string;
  categoryColor: string;
}

interface SeatLayout {
  id: number;
  venueType: 'theater' | 'open_ground' | 'simple_counter';
  bookingType: 'one_time' | 'multiple';
  maxBookingsPerSeat: number;
  layoutConfig?: any;
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

  // Dance Floor state
  const [showDanceFloorCounter, setShowDanceFloorCounter] = useState(false);
  const [danceFloorQuantity, setDanceFloorQuantity] = useState(0);
  const [danceFloorSeat, setDanceFloorSeat] = useState<Seat | null>(null);

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
          maxBookingsPerSeat: response.data.layout.max_bookings_per_seat,
          layoutConfig: response.data.layout.layout_config
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
        
        // Set simple counter price if applicable
        if (layoutData.venueType === 'simple_counter' && response.data.event) {
             setSimpleCounterPrice(parseFloat(response.data.event.price) || 0);
        }

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
        seatId: 0, // Simple counter uses 0 as seatId
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

    if (seat.categoryName === 'Dance Floor') {
      setDanceFloorSeat(seat);
      const currentSelection = selectedSeats.get(seat.id);
      setDanceFloorQuantity(currentSelection ? currentSelection.quantity : 0);
      setShowDanceFloorCounter(true);
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

  const handleDanceFloorConfirm = () => {
    if (danceFloorSeat && danceFloorQuantity > 0) {
      const newSelection: SelectedSeat = {
        seatId: danceFloorSeat.id,
        seatNumber: 'Dance Floor', // Display name
        categoryName: danceFloorSeat.categoryName,
        price: danceFloorSeat.price,
        quantity: danceFloorQuantity,
        maxQuantity: 8 // Max 8 as requested
      };
      setSelectedSeats(new Map(selectedSeats).set(danceFloorSeat.id, newSelection));
    } else if (danceFloorSeat && danceFloorQuantity === 0) {
      const newSelectedSeats = new Map(selectedSeats);
      newSelectedSeats.delete(danceFloorSeat.id);
      setSelectedSeats(newSelectedSeats);
    }
    setShowDanceFloorCounter(false);
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

  const renderLODLayout = () => {
    // Helper to find seat by number
    const getSeat = (num: string) => seats.find(s => s.seatNumber === num);

    // Helper to render a seat button
    const renderSeat = (seatNumber: string, label?: string, className?: string) => {
      const seat = getSeat(seatNumber);
      
      // Placeholder for missing seats to maintain layout structure
      if (!seat) {
        return <div className={`w-12 h-10 bg-gray-800/30 rounded-t-xl rounded-b-md border border-gray-700/30 ${className}`} />;
      }

      const isSelected = selectedSeats.has(seat.id);
      const status = getSeatStatus(seat);

      // Custom colors and glow effects based on section/price
      let bgColor = '';
      let borderColor = '';
      let glowClass = '';
      let textColor = 'text-black';
      
      if (seat.categoryName === 'VVIP') {
        bgColor = 'bg-cyan-400';
        borderColor = 'border-cyan-300';
        glowClass = 'shadow-[0_0_10px_rgba(34,211,238,0.6)]';
        textColor = 'text-black';
      } else if (seat.categoryName === 'Wings') {
        bgColor = 'bg-yellow-500';
        borderColor = 'border-yellow-400';
        glowClass = 'shadow-[0_0_10px_rgba(234,179,8,0.6)]';
        textColor = 'text-black';
      } else if (seat.categoryName === 'Standard') {
        bgColor = 'bg-orange-500';
        borderColor = 'border-orange-400';
        glowClass = 'shadow-[0_0_10px_rgba(249,115,22,0.6)]';
        textColor = 'text-black';
      }

      if (isSelected) {
        bgColor = 'bg-purple-600';
        borderColor = 'border-purple-400';
        glowClass = 'shadow-[0_0_15px_rgba(147,51,234,0.8)] scale-110 z-10';
        textColor = 'text-white';
      } else if (status === 'unavailable') {
        bgColor = 'bg-gray-700';
        borderColor = 'border-gray-600';
        glowClass = '';
        textColor = 'text-gray-500';
      }

      return (
        <div
          key={seat.id}
          className={`
            w-12 h-10 
            rounded-t-xl rounded-b-md 
            flex items-center justify-center 
            text-[10px] font-bold 
            cursor-pointer transition-all duration-300
            border-b-4 border-r-2 ${borderColor}
            ${bgColor} ${textColor} ${glowClass}
            hover:scale-110 hover:brightness-110
            ${className}
          `}
          onClick={() => handleSeatClick(seat)}
          title={`${seat.seatNumber} - ${formatCurrency(seat.price)}`}
        >
          {label || seat.seatNumber}
        </div>
      );
    };

    const danceFloorSeat = seats.find(s => s.categoryName === 'Dance Floor');
    const isDFSelected = danceFloorSeat && selectedSeats.has(danceFloorSeat.id);

    // Handle direct Dance Floor click (add 1 ticket)
    const handleDanceFloorClick = () => {
      if (!danceFloorSeat) return;
      
      const currentSelection = selectedSeats.get(danceFloorSeat.id);
      const currentQuantity = currentSelection ? currentSelection.quantity : 0;
      
      if (currentQuantity < 8) {
        const newQuantity = currentQuantity + 1;
        const newSelection: SelectedSeat = {
          seatId: danceFloorSeat.id,
          seatNumber: 'Dance Floor',
          categoryName: danceFloorSeat.categoryName,
          price: danceFloorSeat.price,
          quantity: newQuantity,
          maxQuantity: 8
        };
        setSelectedSeats(new Map(selectedSeats).set(danceFloorSeat.id, newSelection));
      }
    };

    return (
      <div className="bg-[#0B1120] p-10 rounded-2xl min-w-[900px] overflow-x-auto shadow-2xl border border-gray-800">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 tracking-wider">LOD CLUB LAYOUT</h2>
          <p className="text-gray-400 mt-2 font-light">Select your seats or join the Dance Floor</p>
        </div>

        {/* Main Stage */}
        <div className="flex justify-center mb-16 perspective-1000">
          <div className="w-3/4 h-32 bg-black border-t-4 border-cyan-500/50 flex items-center justify-center rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-90"></div>
            <div className="absolute bottom-0 w-full h-1 bg-cyan-500 shadow-[0_0_20px_#06b6d4]"></div>
            <span className="relative z-10 text-4xl font-black tracking-[0.5em] text-gray-200 group-hover:text-cyan-400 transition-colors duration-500">MAIN STAGE</span>
            
            {/* Stage Lights Effect */}
            <div className="absolute top-0 left-1/4 w-20 h-40 bg-cyan-500/10 blur-3xl transform -rotate-12"></div>
            <div className="absolute top-0 right-1/4 w-20 h-40 bg-purple-500/10 blur-3xl transform rotate-12"></div>
          </div>
        </div>

        {/* Top Section: VVIP */}
        <div className="flex justify-between px-16 mb-20">
          {/* VVIP Left */}
          <div className="flex gap-4 items-end">
            <div className="flex flex-col items-center gap-2">
              <div className="border-l-2 border-t-2 border-cyan-500/30 w-6 h-6 rounded-tl-lg"></div>
              {renderSeat('A14')}
              <div className="border-l-2 border-b-2 border-cyan-500/30 w-6 h-6 rounded-bl-lg"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
               <div className="border-t-2 border-cyan-500/30 w-full h-6"></div>
               {renderSeat('A15')}
               <div className="border-b-2 border-cyan-500/30 w-full h-6"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="border-r-2 border-t-2 border-cyan-500/30 w-6 h-6 rounded-tr-lg"></div>
              {renderSeat('A16')}
              <div className="border-r-2 border-b-2 border-cyan-500/30 w-6 h-6 rounded-br-lg"></div>
            </div>
            <div className="text-cyan-400 font-black text-xl tracking-widest ml-4 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">VVIP</div>
          </div>

          {/* VVIP Right */}
          <div className="flex gap-4 items-end">
             <div className="text-cyan-400 font-black text-xl tracking-widest mr-4 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">VVIP</div>
             <div className="flex flex-col items-center gap-2">
              <div className="border-l-2 border-t-2 border-cyan-500/30 w-6 h-6 rounded-tl-lg"></div>
              {renderSeat('B15')}
              <div className="border-l-2 border-b-2 border-cyan-500/30 w-6 h-6 rounded-bl-lg"></div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="border-r-2 border-t-2 border-cyan-500/30 w-6 h-6 rounded-tr-lg"></div>
              {renderSeat('B14')}
              <div className="border-r-2 border-b-2 border-cyan-500/30 w-6 h-6 rounded-br-lg"></div>
            </div>
          </div>
        </div>

        {/* Middle Section: Wings & Dance Floor */}
        <div className="flex justify-between gap-12 mb-16">
          {/* Left Wing (Bar A) */}
          <div className="flex gap-6">
            {/* Bar Label */}
            <div className="w-16 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-black flex flex-col items-center justify-center rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              <span className="transform -rotate-90 whitespace-nowrap text-2xl tracking-[0.2em]">BAR A</span>
            </div>

            {/* Wing A Seats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Row X6 */}
              {renderSeat('A-12', '12')} {renderSeat('A-5', '5')} {renderSeat('A-4', '4')}
              {/* Row X5 */}
              {renderSeat('A-11', '11')} {renderSeat('A-6', '6')} {renderSeat('A-3', '3')}
              {/* Row X4 */}
              {renderSeat('A-10', '10')} {renderSeat('A-7', '7')} {renderSeat('A-2', '2')}
              {/* Row X3 */}
              {renderSeat('A-9', '9')} {renderSeat('A-8', '8')} {renderSeat('A-1', '1')}
              {/* Row X2 */}
              {renderSeat('A-X2-1', 'X2')} {renderSeat('A-X2-2', 'X2')} <div className="w-12 h-10" />
              {/* Row X1 */}
              {renderSeat('A-X1-1', 'X1')} <div className="w-12 h-10" /> <div className="w-12 h-10" />
            </div>
          </div>

          {/* Center: Dance Floor */}
          <div className="flex-1 bg-[#fef9c3] rounded-xl relative min-h-[450px] flex flex-col items-center p-6 border-4 border-yellow-300 shadow-[0_0_30px_rgba(253,224,71,0.2)] overflow-hidden">
             {/* Background Pattern */}
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500 to-transparent"></div>
             
             <div className="absolute top-0 left-0 bg-purple-600 text-white px-4 py-1 text-xs font-bold rounded-br-lg shadow-md">RESTROOM</div>
             <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg shadow-md">EXIT</div>
             
             <h3 className="text-3xl font-black text-black mt-8 mb-2 tracking-widest">DANCE</h3>
             <h3 className="text-3xl font-black text-black mb-16 tracking-widest">FLOOR</h3>

             {/* Island Bar - Reduced Size */}
             <div className="w-40 h-40 bg-black flex items-center justify-center mb-auto shadow-2xl border border-gray-800 transform rotate-45 rounded-lg">
               <div className="text-center transform -rotate-45">
                 <div className="text-white font-black text-xl tracking-wider">ISLAND</div>
                 <div className="text-white font-black text-xl tracking-wider">BAR</div>
               </div>
             </div>

             {/* Clickable Dance Floor Area */}
             {danceFloorSeat && (
               <div 
                 className={`absolute inset-0 bg-yellow-400/0 hover:bg-yellow-400/10 cursor-pointer transition-all duration-300 flex items-center justify-center z-10 ${isDFSelected ? 'ring-4 ring-purple-600 ring-inset bg-yellow-400/10' : ''}`}
                 onClick={handleDanceFloorClick}
               >
                 {isDFSelected && (
                   <div className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-bounce border-2 border-white">
                     {selectedSeats.get(danceFloorSeat.id)?.quantity} Tickets Selected
                   </div>
                 )}
               </div>
             )}

             {/* Section C Label */}
             <div className="mt-auto mb-2 w-full border-t-2 border-black pt-2 text-center relative z-20">
               <span className="font-bold text-black tracking-wider">SECTION 'C'</span>
             </div>
             
             {/* Entry Label */}
             <div className="absolute bottom-0 right-0 bg-green-600 text-white px-4 py-1 text-xs font-bold rounded-tl-lg shadow-md z-20">ENTRY</div>
          </div>

          {/* Right Wing (Bar B) */}
          <div className="flex gap-6">
            {/* Wing B Seats Grid */}
            <div className="grid grid-cols-3 gap-3">
              {/* Row Y6 */}
              {renderSeat('B-4', '4')} {renderSeat('B-5', '5')} {renderSeat('B-12', '12')}
              {/* Row Y5 */}
              {renderSeat('B-3', '3')} {renderSeat('B-6', '6')} {renderSeat('B-11', '11')}
              {/* Row Y4 */}
              {renderSeat('B-2', '2')} {renderSeat('B-7', '7')} {renderSeat('B-10', '10')}
              {/* Row Y3 */}
              {renderSeat('B-1', '1')} {renderSeat('B-8', '8')} {renderSeat('B-9', '9')}
              {/* Row Y2 */}
              <div className="w-12 h-10" /> {renderSeat('B-Y2-1', 'Y2')} {renderSeat('B-Y2-2', 'Y2')}
              {/* Row Y1 */}
              <div className="w-12 h-10" /> <div className="w-12 h-10" /> {renderSeat('B-Y1-1', 'Y1')}
            </div>

            {/* Bar Label */}
            <div className="w-16 bg-gradient-to-b from-yellow-400 to-yellow-600 text-black font-black flex flex-col items-center justify-center rounded-lg shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              <span className="transform rotate-90 whitespace-nowrap text-2xl tracking-[0.2em]">BAR B</span>
            </div>
          </div>
        </div>

        {/* Bottom Section: C & D */}
        <div className="flex flex-col items-center gap-6">
          {/* Section C Seats */}
          <div className="flex gap-4 justify-center bg-orange-500/10 p-4 rounded-xl border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
             {renderSeat('D6')} {renderSeat('D7')}
             <div className="w-12" /> {/* Aisle */}
             {renderSeat('D8')} {renderSeat('D9')}
          </div>

          {/* Section D Label */}
          <div className="text-orange-500 font-black text-lg tracking-[0.2em] drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]">SECTION 'D'</div>

          {/* Section D Seats */}
          <div className="flex gap-4 justify-center bg-orange-500/10 p-4 rounded-xl border border-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
            {renderSeat('D5')} {renderSeat('D4')} {renderSeat('D3')} {renderSeat('D2')} {renderSeat('D1')}
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

  if (layout.layoutConfig?.type === 'lod') {
    return (
      <div className="space-y-6">
        {renderLODLayout()}
        {renderSelectedSeats()}
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
