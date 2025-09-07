import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { seatLayoutAPI } from '@/services/api';
import { Plus, Trash2, Save, Eye, EyeOff } from 'lucide-react';

interface SeatCategory {
  id: number;
  name: string;
  color: string;
  description: string;
}

interface Seat {
  rowNumber: number;
  columnNumber: number;
  seatNumber: string;
  categoryId: number;
  price: number;
  maxCapacity: number;
  seatType: 'standard' | 'aisle' | 'disabled';
}

interface SeatLayoutCreatorProps {
  eventId: number;
  onLayoutCreated?: (layout: any) => void;
  onCancel?: () => void;
}

const SeatLayoutCreator: React.FC<SeatLayoutCreatorProps> = ({
  eventId,
  onLayoutCreated,
  onCancel
}) => {
  const [venueType, setVenueType] = useState<'theater' | 'open_ground' | 'simple_counter'>('theater');
  const [layoutName, setLayoutName] = useState('');
  const [totalRows, setTotalRows] = useState(4);
  const [totalColumns, setTotalColumns] = useState(4);
  const [bookingType, setBookingType] = useState<'one_time' | 'multiple'>('one_time');
  const [maxBookingsPerSeat, setMaxBookingsPerSeat] = useState(1);
  
  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedMaxCapacity, setSelectedMaxCapacity] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (venueType !== 'simple_counter') {
      generateSeats();
    } else {
      setSeats([]);
    }
  }, [venueType, totalRows, totalColumns]);

  const fetchCategories = async () => {
    try {
      const response = await seatLayoutAPI.getCategories();
      if (response.success) {
        setCategories(response.data);
        if (response.data.length > 0) {
          setSelectedCategory(response.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const generateSeats = () => {
    const newSeats: Seat[] = [];
    for (let row = 1; row <= totalRows; row++) {
      for (let col = 1; col <= totalColumns; col++) {
        const seatNumber = `${String.fromCharCode(64 + row)}${col}`;
        newSeats.push({
          rowNumber: row,
          columnNumber: col,
          seatNumber,
          categoryId: selectedCategory || categories[0]?.id || 1,
          price: selectedPrice,
          maxCapacity: selectedMaxCapacity,
          seatType: 'standard'
        });
      }
    }
    setSeats(newSeats);
  };

  const updateSeat = (rowNumber: number, columnNumber: number, updates: Partial<Seat>) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        seat.rowNumber === rowNumber && seat.columnNumber === columnNumber
          ? { ...seat, ...updates }
          : seat
      )
    );
  };

  const updateSeatsByCategory = (categoryId: number, updates: Partial<Seat>) => {
    setSeats(prevSeats => 
      prevSeats.map(seat => 
        seat.categoryId === categoryId
          ? { ...seat, ...updates }
          : seat
      )
    );
  };

  const getCategoryColor = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6B7280';
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const layoutData = {
        venueType,
        layoutName: layoutName || `${venueType} Layout`,
        totalRows,
        totalColumns,
        bookingType,
        maxBookingsPerSeat: bookingType === 'multiple' ? maxBookingsPerSeat : 1,
        layoutConfig: {
          gridSize: { rows: totalRows, columns: totalColumns },
          venueType,
          bookingType
        },
        seats: venueType !== 'simple_counter' ? seats : []
      };

      const response = await seatLayoutAPI.createLayout(eventId, layoutData);
      
      if (response.success) {
        onLayoutCreated?.(response.data);
      } else {
        setError(response.message || 'Failed to create seat layout');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create seat layout');
    } finally {
      setLoading(false);
    }
  };

  const renderSeatGrid = () => {
    if (venueType === 'simple_counter') {
      return (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <Plus className="h-12 w-12 mx-auto mb-2" />
            <p>Simple Counter Mode</p>
            <p className="text-sm">Users will select quantity with +/- buttons</p>
          </div>
        </div>
      );
    }

    const grid = [];
    for (let row = 1; row <= totalRows; row++) {
      const rowSeats = [];
      for (let col = 1; col <= totalColumns; col++) {
        const seat = seats.find(s => s.rowNumber === row && s.columnNumber === col);
        if (seat) {
          rowSeats.push(
            <div
              key={`${row}-${col}`}
              className={`w-8 h-8 border rounded cursor-pointer flex items-center justify-center text-xs font-medium transition-all ${
                seat.seatType === 'disabled' 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: getCategoryColor(seat.categoryId) }}
              onClick={() => {
                if (seat.seatType !== 'disabled' && selectedCategory) {
                  updateSeat(row, col, { categoryId: selectedCategory });
                }
              }}
              title={`${seat.seatNumber} - ${getCategoryName(seat.categoryId)} - $${seat.price}`}
            >
              {seat.seatNumber}
            </div>
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
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="mb-4">
          <h4 className="font-medium mb-2">Seat Grid Preview</h4>
          <div className="text-sm text-gray-600 mb-2">
            Click on seats to assign categories. Current selection: {getCategoryName(selectedCategory || 0)}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="border rounded p-2 bg-white">
            {grid}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Create Seat Layout</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="venueType">Venue Type</Label>
                <Select value={venueType} onValueChange={(value: any) => setVenueType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theater">Theater</SelectItem>
                    <SelectItem value="open_ground">Open Ground</SelectItem>
                    <SelectItem value="simple_counter">Simple Counter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="layoutName">Layout Name</Label>
                <Input
                  id="layoutName"
                  value={layoutName}
                  onChange={(e) => setLayoutName(e.target.value)}
                  placeholder="Enter layout name"
                />
              </div>

              {venueType !== 'simple_counter' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="totalRows">Rows</Label>
                      <Input
                        id="totalRows"
                        type="number"
                        min="1"
                        max="20"
                        value={totalRows}
                        onChange={(e) => setTotalRows(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalColumns">Columns</Label>
                      <Input
                        id="totalColumns"
                        type="number"
                        min="1"
                        max="30"
                        value={totalColumns}
                        onChange={(e) => setTotalColumns(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bookingType">Booking Type</Label>
                <Select value={bookingType} onValueChange={(value: any) => setBookingType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One Time Booking</SelectItem>
                    <SelectItem value="multiple">Multiple Bookings</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-600 mt-1">
                  {bookingType === 'one_time' 
                    ? 'Each seat can only be booked once' 
                    : 'Each seat can be booked multiple times up to capacity'
                  }
                </p>
              </div>

              {bookingType === 'multiple' && (
                <div>
                  <Label htmlFor="maxBookingsPerSeat">Max Bookings per Seat</Label>
                  <Input
                    id="maxBookingsPerSeat"
                    type="number"
                    min="1"
                    value={maxBookingsPerSeat}
                    onChange={(e) => setMaxBookingsPerSeat(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Category Selection */}
          {venueType !== 'simple_counter' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Seat Categories</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Select Category</Label>
                  <Select value={selectedCategory?.toString() || ''} onValueChange={(value) => setSelectedCategory(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price per Seat</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={selectedPrice}
                    onChange={(e) => setSelectedPrice(parseFloat(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="maxCapacity">Max Capacity</Label>
                  <Input
                    id="maxCapacity"
                    type="number"
                    min="1"
                    value={selectedMaxCapacity}
                    onChange={(e) => setSelectedMaxCapacity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedCategory) {
                      updateSeatsByCategory(selectedCategory, { 
                        price: selectedPrice, 
                        maxCapacity: selectedMaxCapacity 
                      });
                    }
                  }}
                >
                  Apply to All {getCategoryName(selectedCategory || 0)} Seats
                </Button>
              </div>
            </div>
          )}

          {/* Seat Grid */}
          {!previewMode && renderSeatGrid()}

          {/* Category Legend */}
          {venueType !== 'simple_counter' && (
            <div className="space-y-2">
              <h4 className="font-medium">Category Legend</h4>
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
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Layout'}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatLayoutCreator;
