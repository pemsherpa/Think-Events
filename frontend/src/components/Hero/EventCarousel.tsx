import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Event {
  id: number;
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  venue_name: string;
  venue_city: string;
  price: number;
  currency: string;
  images: string[];
  category_name: string;
  available_seats: number;
  total_seats: number;
}

interface EventCarouselProps {
  events: Event[];
}

const EventCarousel: React.FC<EventCarouselProps> = ({ events }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [events.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/event/${eventId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const formatPrice = (price: number, currency: string) => {
    return `${currency} ${price.toLocaleString()}`;
  };

  if (!events || events.length === 0) {
    return null;
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="relative w-full h-[500px] overflow-hidden rounded-2xl">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${currentEvent.images?.[0] || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&h=500&fit=crop'})`
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Event Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-8 text-white">
        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-purple-600/90 text-white text-sm font-medium rounded-full">
            {currentEvent.category_name}
          </span>
        </div>

        {/* Event Title */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {currentEvent.title}
        </h2>

        {/* Event Description */}
        <p className="text-lg text-gray-200 mb-6 max-w-2xl line-clamp-2">
          {currentEvent.description}
        </p>

        {/* Event Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-purple-300" />
            <span className="text-sm">{formatDate(currentEvent.start_date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-300" />
            <span className="text-sm">{formatTime(currentEvent.start_time)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-purple-300" />
            <span className="text-sm">{currentEvent.venue_city}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-300" />
            <span className="text-sm">{currentEvent.available_seats} seats left</span>
          </div>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-300">Starting from</span>
            <div className="text-2xl font-bold text-yellow-400">
              {formatPrice(currentEvent.price, currentEvent.currency)}
            </div>
          </div>
          <Button 
            size="lg"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3"
            onClick={() => handleEventClick(currentEvent.id)}
          >
            View Event
          </Button>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-200"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-200"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-white scale-125' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default EventCarousel;
