
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import HeroSection from '@/components/Hero/HeroSection';
import CategoryGrid from '@/components/Categories/CategoryGrid';
import EventFilters from '@/components/Events/EventFilters';
import EventCard from '@/components/Events/EventCard';
import { eventsAPI } from '@/services/api';

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    // Get category from URL params
    const category = searchParams.get('category');
    if (category) {
      setFilters(prev => ({ ...prev, category }));
    }
    
    // Listen for category filter events from CategoryGrid
    const handleCategoryFilter = (event: CustomEvent) => {
      const { category } = event.detail;
      setFilters(prev => ({ ...prev, category }));
    };
    
    window.addEventListener('categoryFilter', handleCategoryFilter);
    return () => window.removeEventListener('categoryFilter', handleCategoryFilter);
  }, [searchParams]);

  useEffect(() => {
    fetchEvents();
  }, [filters, sortBy]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const queryParams: any = { ...filters };
      
      // Add sorting parameters
      switch (sortBy) {
        case 'viewed':
          queryParams.sortBy = 'views';
          queryParams.sortOrder = 'DESC';
          break;
        case 'recent':
          queryParams.sortBy = 'created_at';
          queryParams.sortOrder = 'DESC';
          break;
        case 'soon':
          queryParams.sortBy = 'start_date';
          queryParams.sortOrder = 'ASC';
          break;
        default:
          queryParams.sortBy = 'created_at';
          queryParams.sortOrder = 'DESC';
      }
      
      const response = await eventsAPI.getAll({ ...queryParams, limit: 6 });
      setEvents(response.data.events || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    
    // Update URL params
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, String(value));
      }
    });
    // Update URL without navigation
    window.history.replaceState({}, '', `${window.location.pathname}?${newSearchParams.toString()}`);
  };

  const handleViewAllEvents = () => {
    navigate('/events');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <CategoryGrid />
      
      <section className="py-16" data-section="events">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Featured Events
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't miss out on these amazing events happening across Nepal
            </p>
          </div>

          <EventFilters onFilterChange={handleFilterChange} />
          
          {/* Sorting Buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => setSortBy('viewed')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  sortBy === 'viewed'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                }`}
              >
                Most Viewed
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  sortBy === 'recent'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                }`}
              >
                Most Recent
              </button>
              <button
                onClick={() => setSortBy('soon')}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                  sortBy === 'soon'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-purple-300'
                }`}
              >
                Happening Soon
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-pulse-smooth rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="mt-2 text-gray-600">Loading events...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchEvents}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No events found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
              <button 
                onClick={handleViewAllEvents}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium btn-smooth"
              >
              View All Events
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
