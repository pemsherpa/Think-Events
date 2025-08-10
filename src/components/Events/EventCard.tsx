
import React from 'react';
import { Calendar, Clock, MapPin, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    location: string;
    price: number;
    image: string;
    category: string;
    organizer: string;
    availableSeats: number;
    totalSeats: number;
  };
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return `रु ${price.toLocaleString()}`;
  };

  const getAvailabilityStatus = () => {
    const percentage = (event.availableSeats / event.totalSeats) * 100;
    if (percentage > 50) return { text: 'Available', color: 'bg-green-500' };
    if (percentage > 20) return { text: 'Filling Fast', color: 'bg-yellow-500' };
    if (percentage > 0) return { text: 'Almost Sold Out', color: 'bg-red-500' };
    return { text: 'Sold Out', color: 'bg-gray-500' };
  };

  const availability = getAvailabilityStatus();

  const handleBookNow = () => {
    navigate(`/book/${event.id}`);
  };

  const handleCardClick = () => {
    navigate(`/event/${event.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative cursor-pointer" onClick={handleCardClick}>
        <img 
          src={`https://images.unsplash.com/${event.image}?w=400&h=200&fit=crop`}
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-purple-600">
            {event.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge className={`${availability.color} text-white`}>
            {availability.text}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-purple-600" onClick={handleCardClick}>
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{event.date}</span>
            <Clock className="h-4 w-4 ml-4 mr-2" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="truncate">{event.venue}, {event.location}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500">Starting from</span>
            <div className="font-bold text-lg text-purple-600">
              {formatPrice(event.price)}
            </div>
          </div>
          
          <Button 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700"
            onClick={(e) => {
              e.stopPropagation();
              handleBookNow();
            }}
          >
            <Ticket className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>by {event.organizer}</span>
            <span>{event.availableSeats} of {event.totalSeats} seats left</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
