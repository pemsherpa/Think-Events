import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, Star, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bookingsAPI } from '@/services/api';

interface Booking {
  id: number;
  event_title: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_city: string;
  seats: string[];
  total_amount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  booking_date: string;
  payment_status: 'paid' | 'pending' | 'failed';
}

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getUserBookings();
      setBookings(response.data.bookings || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings');
      // Mock data for demonstration
      setBookings([
        {
          id: 1,
          event_title: 'Sajjan Raj Vaidya Live in Concert',
          event_date: '2024-12-15',
          event_time: '19:00',
          venue_name: 'Dashrath Stadium',
          venue_city: 'Kathmandu',
          seats: ['A1', 'A2', 'A3'],
          total_amount: 4500,
          status: 'confirmed',
          booking_date: '2024-11-20',
          payment_status: 'paid'
        },
        {
          id: 2,
          event_title: 'Nepal Music Festival 2024',
          event_date: '2024-12-19',
          event_time: '18:00',
          venue_name: 'Dashrath Stadium',
          venue_city: 'Kathmandu',
          seats: ['VIP Section-1', 'VIP Section-2'],
          total_amount: 3600,
          status: 'pending',
          booking_date: '2024-11-25',
          payment_status: 'pending'
        },
        {
          id: 3,
          event_title: 'Nepal Premier League 2024',
          event_date: '2024-09-30',
          event_time: '16:00',
          venue_name: 'Dashrath Stadium',
          venue_city: 'Kathmandu',
          seats: ['North Stand-1', 'North Stand-2', 'North Stand-3'],
          total_amount: 5400,
          status: 'confirmed',
          booking_date: '2024-09-15',
          payment_status: 'paid'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <ClockIcon className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredBookings = {
    all: bookings,
    confirmed: bookings.filter(b => b.status === 'confirmed'),
    pending: bookings.filter(b => b.status === 'pending'),
    cancelled: bookings.filter(b => b.status === 'cancelled')
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-2 text-gray-600">Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchBookings} className="bg-purple-600 hover:bg-purple-700">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
        <Button onClick={fetchBookings} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <Ticket className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
          <p className="text-gray-600 mb-4">Start exploring events and make your first booking!</p>
          <Button onClick={() => navigate('/events')} className="bg-purple-600 hover:bg-purple-700">
            Browse Events
          </Button>
        </div>
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({filteredBookings.all.length})</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed ({filteredBookings.confirmed.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({filteredBookings.pending.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({filteredBookings.cancelled.length})</TabsTrigger>
          </TabsList>

          {Object.entries(filteredBookings).map(([status, statusBookings]) => (
            <TabsContent key={status} value={status} className="space-y-4">
              {statusBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-lg p-6 border">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.event_title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </Badge>
                          <Badge className={getPaymentStatusColor(booking.payment_status)}>
                            {booking.payment_status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{formatDate(booking.event_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{formatTime(booking.event_time)}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{booking.venue_name}, {booking.venue_city}</span>
                        </div>
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 mr-2 text-purple-600" />
                          <span>{booking.seats.length} seat{booking.seats.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Selected Seats:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {booking.seats.map((seat, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {seat}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-semibold text-gray-900">रु {booking.total_amount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Booked on {formatDate(booking.booking_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 lg:ml-4">
                      {booking.status === 'pending' && (
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Complete Payment
                        </Button>
                      )}
                      {booking.status === 'confirmed' && (
                        <Button size="sm" variant="outline">
                          Download Ticket
                        </Button>
                      )}
                      {booking.status !== 'cancelled' && (
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          Cancel Booking
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default MyBookings;
