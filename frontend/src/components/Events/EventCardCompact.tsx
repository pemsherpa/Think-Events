
import React from 'react';
import { Calendar, Clock, MapPin, Ticket, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface EventCardCompactProps {
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
  size?: 'small' | 'medium' | 'large';
}

const EventCardCompact: React.FC<EventCardCompactProps> = ({ event, size = 'medium' }) => {
  const navigate = useNavigate();

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg'
  };

  const imageSizes = {
    small: 'h-32',
    medium: 'h-40',
    large: 'h-48'
  };

  const formatPrice = (price: number) => {
    return `रु ${price.toLocaleString()}`;
  };

  const getAvailabilityColor = () => {
    const percentage = (event.availableSeats / event.totalSeats) * 100;
    if (percentage > 50) return 'text-green-600';
    if (percentage > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleBookNow = () => {
    navigate(`/book/${event.id}`);
  };

  const handleViewDetails = () => {
    navigate(`/event/${event.id}`);
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${sizeClasses[size]} mx-auto`}>
      {/* Image and Actions */}
      <div className="relative">
        <img 
          src={`https://images.unsplash.com/${event.image}?w=400&h=200&fit=crop`}
          alt={event.title}
          className={`w-full ${imageSizes[size]} object-cover`}
        />
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-white/90 text-purple-600 font-medium">
            {event.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
            <Heart className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-purple-600" onClick={handleViewDetails}>
          {event.title}
        </h3>
        
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2 text-purple-500" />
            <span>{event.date}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-purple-500" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2 text-purple-500" />
            <span className="truncate">{event.venue}, {event.location}</span>
          </div>
        </div>

        {/* Price and Availability */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xs text-gray-500">Starting from</span>
            <div className="font-bold text-lg text-purple-600">
              {formatPrice(event.price)}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${getAvailabilityColor()}`}>
              {event.availableSeats} seats left
            </div>
            <div className="text-xs text-gray-500">
              of {event.totalSeats} total
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 border-purple-200 hover:border-purple-300"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1 bg-purple-600 hover:bg-purple-700"
            onClick={handleBookNow}
          >
            <Ticket className="h-4 w-4 mr-2" />
            Book Now
          </Button>
        </div>

        {/* Organizer */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 text-center">
            Organized by <span className="font-medium text-gray-700">{event.organizer}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCardCompact;
