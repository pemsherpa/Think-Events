import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, Ticket, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsAPI } from '@/services/api';

interface Booking {
  id: number;
  event_title: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_city: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  event_id: number;
}

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchBookings();
    }
  }, [isOpen, user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getUserBookings();
      const apiBookings = response.data?.bookings || response.data || [];
      const normalized = apiBookings.map((b: any) => ({
        id: b.id,
        event_title: b.event_title,
        event_date: b.start_date,
        event_time: b.start_time,
        venue_name: b.venue_name,
        venue_city: b.venue_city,
        status: b.status,
        event_id: b.event_id,
      }));
      setBookings(normalized);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Mock data for demonstration
      setBookings([
        {
          id: 1,
          event_title: 'Sajjan Raj Vaidya Live in Concert',
          event_date: '2024-12-15',
          event_time: '19:00',
          venue_name: 'Dashrath Stadium',
          venue_city: 'Kathmandu',
          status: 'confirmed',
          event_id: 1,
        },
        {
          id: 2,
          event_title: 'Nepal Music Festival 2024',
          event_date: '2024-12-19',
          event_time: '18:00',
          venue_name: 'Dashrath Stadium',
          venue_city: 'Kathmandu',
          status: 'pending',
          event_id: 2,
        },
        {
          id: 3,
          event_title: 'Nepal Premier League 2024',
          event_date: '2024-12-25',
          event_time: '16:00',
          venue_name: 'Dashrath Stadium',
          venue_city: 'Kathmandu',
          status: 'confirmed',
          event_id: 3,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getBookingsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.event_date === dateString);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/event/${eventId}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="h-6 w-6 mr-3" />
              <h2 className="text-2xl font-bold">Your Event Calendar</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!user ? (
            <div className="text-center py-12">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to view your calendar</h3>
              <p className="text-gray-600 mb-6">Sign in to see your booked events on the calendar</p>
              <button 
                onClick={() => {
                  navigate('/login');
                  onClose();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Calendar Header */}
              <div className="bg-white rounded-xl shadow-lg border overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h3 className="text-lg font-semibold">{formatDate(currentDate)}</h3>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-4">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((day, index) => {
                      if (!day) {
                        return <div key={index} className="h-12"></div>;
                      }

                      const dayBookings = getBookingsForDate(day);
                      const isToday = day.toDateString() === new Date().toDateString();
                      const isSelected = selectedDate?.toDateString() === day.toDateString();

                      return (
                        <div
                          key={day.toISOString()}
                          className={`h-12 border border-gray-200 rounded-lg p-1 cursor-pointer transition-all ${
                            isToday ? 'bg-purple-50 border-purple-200' : ''
                          } ${isSelected ? 'ring-2 ring-purple-500' : 'hover:bg-gray-50'}`}
                          onClick={() => setSelectedDate(day)}
                        >
                          <div className={`text-sm font-medium mb-1 ${
                            isToday ? 'text-purple-600' : 'text-gray-900'
                          }`}>
                            {day.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayBookings.slice(0, 2).map(booking => (
                              <div
                                key={booking.id}
                                className={`h-1 rounded-full ${getStatusColor(booking.status)}`}
                                title={booking.event_title}
                              />
                            ))}
                            {dayBookings.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{dayBookings.length - 2}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Selected Date Events */}
              {selectedDate && (
                <div className="bg-white rounded-xl shadow-lg border p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Events on {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                  {getBookingsForDate(selectedDate).length > 0 ? (
                    <div className="space-y-3">
                      {getBookingsForDate(selectedDate).map(booking => (
                        <div
                          key={booking.id}
                          className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={() => handleEventClick(booking.event_id)}
                        >
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status)} mr-3`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 text-sm">{booking.event_title}</h4>
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              <span className="mr-3">{booking.event_time}</span>
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{booking.venue_name}, {booking.venue_city}</span>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Ticket className="h-3 w-3 mr-1" />
                            <span className="capitalize">{booking.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-6">No events booked for this date</p>
                  )}
                </div>
              )}

              {loading && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading your events...</p>
                </div>
              )}

              {!loading && bookings.length === 0 && (
                <div className="text-center py-8">
                  <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">No events booked yet</h3>
                  <p className="text-gray-600 mb-4 text-sm">Start exploring events and make your first booking!</p>
                  <button 
                    onClick={() => {
                      navigate('/events');
                      onClose();
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    Browse Events
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarModal;
