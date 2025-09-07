
import React from 'react';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  event: {
    id: number;
    title: string;
    start_date: string;
    start_time: string;
    venue_name: string;
    venue_city: string;
    venue_country: string;
    price: number;
    currency: string;
    images: string[];
    category_name: string;
    organizer_name: string;
    available_seats: number;
    total_seats: number;
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return `रु ${price.toLocaleString()}`;
  };

  const isEventExpired = () => {
    const eventDate = new Date(event.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
  };

  const getAvailabilityStatus = () => {
    if (isEventExpired()) {
      return { text: 'Expired', color: 'bg-gray-500' };
    }
    
    const percentage = (event.available_seats / event.total_seats) * 100;
    if (percentage > 50) return { text: 'Available', color: 'bg-green-500' };
    if (percentage > 20) return { text: 'Filling Fast', color: 'bg-yellow-500' };
    if (percentage > 0) return { text: 'Almost Sold Out', color: 'bg-red-500' };
    return { text: 'Sold Out', color: 'bg-gray-500' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // Remove seconds
  };

  const availability = getAvailabilityStatus();

  const handleBookNow = () => {
    navigate(`/book/${event.id}`);
  };

  const handleCardClick = () => {
    navigate(`/event/${event.id}`);
  };

  const expired = isEventExpired();

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 group ${
      expired 
        ? 'opacity-60 grayscale' 
        : 'hover:shadow-2xl transform hover:-translate-y-2 hover:scale-105'
    }`}>
      <div className="relative cursor-pointer" onClick={handleCardClick}>
        <img 
          src={event.images && event.images.length > 0 
            ? event.images[0] 
            : 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=200&fit=crop'
          }
          alt={event.title}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-purple-600">
            {event.category_name}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <Badge className={`${availability.color} text-white`}>
            {availability.text}
          </Badge>
        </div>
      </div>

      <div className="p-3 md:p-4">
        <h3 className="font-bold text-base md:text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-purple-600" onClick={handleCardClick}>
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-3 md:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 text-xs md:text-sm space-y-1 sm:space-y-0">
            <div className="flex items-center">
              <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-2" />
              <span>{formatDate(event.start_date)}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 md:h-4 md:w-4 ml-0 sm:ml-4 mr-2" />
              <span>{formatTime(event.start_time)}</span>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 text-xs md:text-sm">
            <MapPin className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.venue_name}, {event.venue_city}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div>
            <span className="text-xs text-gray-500">Starting from</span>
            <div className="font-bold text-base md:text-lg text-purple-600">
              {formatPrice(event.price)} {event.currency}
            </div>
          </div>
          
          <Button 
            size="sm" 
            className={`w-full sm:w-auto min-h-[40px] md:min-h-[36px] transition-all duration-300 ${
              expired 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple-600 hover:bg-purple-700 hover:scale-105 hover:shadow-lg'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              if (!expired) {
                handleBookNow();
              }
            }}
            disabled={expired}
          >
            <Ticket className="h-3 w-3 md:h-4 md:w-4 mr-2" />
            <span className="text-sm md:text-base">{expired ? 'Expired' : 'Book Now'}</span>
          </Button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-gray-500 space-y-1 sm:space-y-0">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                navigate('/organizers');
              }}
              className="text-left hover:text-purple-600 transition-colors"
            >
              by {event.organizer_name}
            </button>
            <span>{event.available_seats} of {event.total_seats} seats left</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
