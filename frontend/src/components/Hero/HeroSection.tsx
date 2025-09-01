
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import EventCarousel from './EventCarousel';

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

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/events?featured=true&limit=5`);
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching featured events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedDate) params.set('date', selectedDate);
    
    const queryString = params.toString();
    navigate(`/events${queryString ? `?${queryString}` : ''}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2">
            Discover Amazing Events in{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Nepal
            </span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            From vibrant festivals to electrifying concerts, find and book tickets for the best events across Nepal. Join the crowd and create memories!
          </p>

          {/* Search Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input 
                    placeholder="Search events, artists, venues..."
                    className="pl-10 bg-white text-gray-900 border-0 h-12 text-sm md:text-base"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
              
              <div>
                <Input 
                  type="date"
                  className="bg-white text-gray-900 border-0 h-12 text-sm md:text-base cursor-pointer"
                  value={selectedDate}
                  onChange={handleDateChange}
                  onKeyPress={handleKeyPress}
                />
              </div>
              
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 h-12 text-sm md:text-base"
                onClick={handleSearch}
              >
                <Ticket className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Find Events</span>
                <span className="sm:hidden">Search</span>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">50K+</div>
              <div className="text-sm md:text-base text-purple-200">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">1K+</div>
              <div className="text-sm md:text-base text-purple-200">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">200+</div>
              <div className="text-sm md:text-base text-purple-200">Event Organizers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-yellow-400">15+</div>
              <div className="text-sm md:text-base text-purple-200">Cities Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Carousel */}
      {!loading && events.length > 0 && (
        <div className="container mx-auto px-4 pb-16">
          <EventCarousel events={events} />
        </div>
      )}
    </div>
  );
};

export default HeroSection;
