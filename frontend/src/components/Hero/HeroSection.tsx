
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Ticket, Music, Calendar, Users, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SearchDropdown from '@/components/Layout/SearchDropdown';
import EventCarousel from './EventCarousel';
import { eventsAPI } from '@/services/api';

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
  // Date input removed for simpler UX
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetchFeaturedEvents();
    setIsVisible(true);
  }, []);

  // Animate stats counter
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll({ featured: 'true', limit: 5 });
      const list = data.data || data.events || [];
      if (Array.isArray(list)) setEvents(list);
    } catch (err) {
      console.error('Error fetching featured events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    
    const queryString = params.toString();
    navigate(`/events${queryString ? `?${queryString}` : ''}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Date handling removed

  return (
    <div className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/10 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-orange-400/10 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-400/10 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-8 h-8 bg-blue-400/10 rounded-full animate-pulse"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight px-2">
              Discover Amazing Events in{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent animate-pulse">
                Nepal
              </span>
              <Sparkles className="inline-block w-8 h-8 text-yellow-400 ml-2 animate-spin" />
            </h1>
          </div>
          
          <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <p className="text-base sm:text-lg lg:text-xl text-purple-100 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              From vibrant festivals to electrifying concerts, find and book tickets for the best events across Nepal. Join the crowd and create memories!
            </p>
          </div>

          {/* Search Section */}
          <div className={`transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 md:p-4 mb-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <SearchDropdown />
                  </div>
                </div>
                {/* Removed button; search occupies full bar */}
              </div>
            </div>
          </div>

          {/* Dynamic Stats */}
          <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className={`text-center p-4 rounded-xl transition-all duration-500 ${currentStat === 0 ? 'bg-yellow-400/20 scale-110' : 'bg-white/5 hover:bg-white/10'}`}>
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-yellow-400 mr-2" />
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400 animate-pulse">50K+</div>
                </div>
                <div className="text-sm md:text-base text-purple-200">Happy Customers</div>
              </div>
              <div className={`text-center p-4 rounded-xl transition-all duration-500 ${currentStat === 1 ? 'bg-yellow-400/20 scale-110' : 'bg-white/5 hover:bg-white/10'}`}>
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-yellow-400 mr-2" />
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400 animate-pulse">1K+</div>
                </div>
                <div className="text-sm md:text-base text-purple-200">Events Hosted</div>
              </div>
              <div className={`text-center p-4 rounded-xl transition-all duration-500 ${currentStat === 2 ? 'bg-yellow-400/20 scale-110' : 'bg-white/5 hover:bg-white/10'}`}>
                <div className="flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-yellow-400 mr-2" />
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400 animate-pulse">200+</div>
                </div>
                <div className="text-sm md:text-base text-purple-200">Event Organizers</div>
              </div>
              <div className={`text-center p-4 rounded-xl transition-all duration-500 ${currentStat === 3 ? 'bg-yellow-400/20 scale-110' : 'bg-white/5 hover:bg-white/10'}`}>
                <div className="flex items-center justify-center mb-2">
                  <Music className="h-6 w-6 text-yellow-400 mr-2" />
                  <div className="text-2xl md:text-3xl font-bold text-yellow-400 animate-pulse">15+</div>
                </div>
                <div className="text-sm md:text-base text-purple-200">Cities Covered</div>
              </div>
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
