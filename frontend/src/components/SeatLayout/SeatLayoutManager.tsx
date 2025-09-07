import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { seatLayoutAPI } from '@/services/api';
import { Plus, Edit, Trash2, Eye, Settings } from 'lucide-react';
import SeatLayoutCreator from './SeatLayoutCreator';

interface SeatLayout {
  id: number;
  eventId: number;
  venueType: 'theater' | 'open_ground' | 'simple_counter';
  layoutName: string;
  totalRows: number;
  totalColumns: number;
  bookingType: 'one_time' | 'multiple';
  maxBookingsPerSeat: number;
  isActive: boolean;
  createdAt: string;
}

interface SeatLayoutManagerProps {
  eventId: number;
  onLayoutChange?: () => void;
}

const SeatLayoutManager: React.FC<SeatLayoutManagerProps> = ({
  eventId,
  onLayoutChange
}) => {
  const [layout, setLayout] = useState<SeatLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [editingLayout, setEditingLayout] = useState<SeatLayout | null>(null);

  useEffect(() => {
    fetchLayout();
  }, [eventId]);

  const fetchLayout = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await seatLayoutAPI.getLayout(eventId);
      
      if (response.success && response.data?.layout) {
        setLayout(response.data.layout);
      } else {
        setLayout(null);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to load seat layout');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLayout = () => {
    setEditingLayout(null);
    setShowCreator(true);
  };

  const handleEditLayout = () => {
    if (layout) {
      setEditingLayout(layout);
      setShowCreator(true);
    }
  };

  const handleDeleteLayout = async () => {
    if (!layout || !confirm('Are you sure you want to delete this seat layout? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await seatLayoutAPI.deleteLayout(layout.id);
      
      if (response.success) {
        setLayout(null);
        onLayoutChange?.();
      } else {
        setError(response.message || 'Failed to delete seat layout');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete seat layout');
    }
  };

  const handleLayoutCreated = (newLayout: any) => {
    setLayout(newLayout);
    setShowCreator(false);
    setEditingLayout(null);
    onLayoutChange?.();
  };

  const handleCancel = () => {
    setShowCreator(false);
    setEditingLayout(null);
  };

  const getVenueTypeLabel = (venueType: string) => {
    switch (venueType) {
      case 'theater': return 'Theater';
      case 'open_ground': return 'Open Ground';
      case 'simple_counter': return 'Simple Counter';
      default: return venueType;
    }
  };

  const getBookingTypeLabel = (bookingType: string) => {
    switch (bookingType) {
      case 'one_time': return 'One Time Booking';
      case 'multiple': return 'Multiple Bookings';
      default: return bookingType;
    }
  };

  if (showCreator) {
    return (
      <SeatLayoutCreator
        eventId={eventId}
        onLayoutCreated={handleLayoutCreated}
        onCancel={handleCancel}
      />
    );
  }

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
        <p className="text-red-600 mb-2">Error loading seat layout</p>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <Button variant="outline" onClick={fetchLayout}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!layout ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Seat Layout Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <Settings className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">No Seat Layout Configured</p>
                <p className="text-sm">Create a custom seat layout for this event</p>
              </div>
              <Button onClick={handleCreateLayout} className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Seat Layout
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Seat Layout Configuration
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleEditLayout}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={handleDeleteLayout}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Layout Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{layout.layoutName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Venue Type:</span>
                      <Badge variant="secondary">{getVenueTypeLabel(layout.venueType)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking Type:</span>
                      <Badge variant="secondary">{getBookingTypeLabel(layout.bookingType)}</Badge>
                    </div>
                    {layout.venueType !== 'simple_counter' && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Grid Size:</span>
                          <span className="font-medium">{layout.totalRows} × {layout.totalColumns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Seats:</span>
                          <span className="font-medium">{layout.totalRows * layout.totalColumns}</span>
                        </div>
                      </>
                    )}
                    {layout.bookingType === 'multiple' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max per Seat:</span>
                        <span className="font-medium">{layout.maxBookingsPerSeat}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge variant={layout.isActive ? "default" : "secondary"}>
                        {layout.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {new Date(layout.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleEditLayout}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Layout
                  </Button>
                  <Button variant="outline" onClick={() => window.open(`/event/${eventId}`, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Event
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SeatLayoutManager;
