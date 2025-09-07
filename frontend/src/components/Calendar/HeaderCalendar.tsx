import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, MapPin, Clock, X } from 'lucide-react';
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

interface HeaderCalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

const HeaderCalendar: React.FC<HeaderCalendarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              <h2 className="text-lg font-bold">My Event Calendar</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          {!user ? (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />
              <h3 className="text-base font-medium text-gray-900 mb-2">Sign in to view your calendar</h3>
              <p className="text-gray-600 mb-4 text-sm">Sign in to see your booked events on the calendar</p>
              <button 
                onClick={() => {
                  navigate('/login');
                  onClose();
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
              >
                Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Calendar Header */}
              <div className="bg-white rounded-lg shadow border overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigateMonth('prev')}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <h3 className="text-sm font-semibold">{formatDate(currentDate)}</h3>
                    <button
                      onClick={() => navigateMonth('next')}
                      className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-3">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Days */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(currentDate).map((day, index) => {
                      if (!day) {
                        return <div key={index} className="h-8"></div>;
                      }

                      const dayBookings = getBookingsForDate(day);
                      const isToday = day.toDateString() === new Date().toDateString();
                      const hasBookings = dayBookings.length > 0;

                      return (
                        <div
                          key={day.toISOString()}
                          className={`h-8 border border-gray-200 rounded p-1 cursor-pointer transition-all text-xs ${
                            isToday ? 'bg-purple-50 border-purple-200' : ''
                          } ${hasBookings ? 'bg-red-100 border-red-300' : 'hover:bg-gray-50'}`}
                        >
                          <div className={`text-xs font-medium ${
                            isToday ? 'text-purple-600' : hasBookings ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {day.getDate()}
                          </div>
                          {hasBookings && (
                            <div className="flex justify-center mt-0.5">
                              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-lg shadow border p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Booked Events</h3>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                    <p className="mt-2 text-gray-600 text-xs">Loading...</p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="space-y-2">
                    {bookings.slice(0, 3).map(booking => (
                      <div
                        key={booking.id}
                        className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => handleEventClick(booking.event_id)}
                      >
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(booking.status)} mr-2`}></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-xs truncate">{booking.event_title}</h4>
                          <div className="flex items-center text-xs text-gray-600 mt-0.5">
                            <Clock className="h-3 w-3 mr-1" />
                            <span className="mr-2">{new Date(booking.event_date).toLocaleDateString()}</span>
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{booking.venue_name}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 capitalize ml-2">
                          {booking.status}
                        </div>
                      </div>
                    ))}
                    {bookings.length > 3 && (
                      <p className="text-xs text-gray-500 text-center py-1">
                        +{bookings.length - 3} more events
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4 text-xs">No events booked yet</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeaderCalendar;
